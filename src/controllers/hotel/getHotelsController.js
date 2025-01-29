const { Op } = require("sequelize");
const models = require("../../models/Hotel/models");
const logger = require("../../config/logger");

// Константа з атрибутами, які витягуються з бази
const HOTEL_ATTRIBUTES = [
  "id",
  "name",
  "country",
  "star_rating",
  "hotel_photos",
  "is_hot_deal",
  "tour_start_date",
  "tour_end_date",
  "tour_price",
  "average_rating",
  "review_count",
  "included_meal_types",
  "season",
  "total_orders",
  "city",
  "amenity",
];

// Отримання параметрів пагінації з запиту
const getPaginationParams = (query, defaultLimit = 8) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || defaultLimit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// Побудова фільтрів для бази даних
const buildFilters = (query, isHotDeal = null) => {
  const filters = {};

  if (isHotDeal !== null) filters.is_hot_deal = isHotDeal;
  if (query.season) filters.season = query.season;
  if (query.starRating) filters.star_rating = parseInt(query.starRating, 10);
  if (query.mealType) {
    filters.included_meal_types = {
      [Op.iLike]: `%${query.mealType}%`,
    };
  }
  if (query.country) filters.country = query.country;
  if (query.priceFrom || query.priceTo) {
    filters.tour_price = {};
    if (query.priceFrom) {
      filters.tour_price[Op.gte] = parseFloat(query.priceFrom);
    }
    if (query.priceTo) {
      filters.tour_price[Op.lte] = parseFloat(query.priceTo);
    }
  }
  if (query.amenities) {
    const amenitiesArray = query.amenities.split(",").filter(Boolean);
    if (amenitiesArray.length > 0) {
      filters.amenity = { [Op.overlap]: amenitiesArray };
    }
  }

  Object.keys(filters).forEach((key) => {
    if (
      filters[key] === undefined ||
      filters[key] === null ||
      filters[key] === ""
    ) {
      delete filters[key];
    }
  });

  return filters;
};

// Побудова параметрів сортування для бази даних
const getSortParams = (query) => {
  if (query.sortBy && query.sortOrder) {
    return [[query.sortBy, query.sortOrder === "asc" ? "ASC" : "DESC"]];
  }
  return null;
};

// Очищення текстових полів готелю від зайвих символів
const cleanHotelData = (hotel) => {
  const cleanField = (field) => (field ? field.replace(/"/g, "") : field);
  return {
    ...hotel.dataValues,
    name: cleanField(hotel.name),
    country: cleanField(hotel.country),
    description: cleanField(hotel.description),
    included_meal_types: cleanField(hotel.included_meal_types),
    season: cleanField(hotel.season),
  };
};

// Загальна функція для запитів до бази даних
const fetchHotelsData = async ({ filters, sort, limit, offset }) => {
  const { count, rows } = await models.Hotels.findAndCountAll({
    attributes: HOTEL_ATTRIBUTES,
    where: filters,
    order: sort,
    limit,
    offset,
    distinct: true,
  });

  return {
    count,
    hotels: rows.map(cleanHotelData),
  };
};

// Відправлення відповіді на клієнт
const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

// Обробка запиту для отримання всіх готелів
const getAllHotels = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = buildFilters(req.query);

    logger.info(`Отримання готелів: сторінка ${page}, ліміт ${limit}`);
    const { count, hotels } = await fetchHotelsData({
      filters,
      sort: getSortParams(req.query),
      limit,
      offset,
    });

    sendResponse(res, 200, {
      hotels,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalHotels: count,
    });
  } catch (error) {
    logger.error("Помилка при отриманні готелів: ", error.message);
    sendResponse(res, 500, {
      error: "Не вдалося отримати список готелів",
      details: error.message,
    });
  }
};

// Обробка запиту для отримання гарячих турів
const getHotDeals = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);

    logger.info(`Отримання гарячих турів: сторінка ${page}, ліміт ${limit}`);
    const { count, hotels } = await fetchHotelsData({
      filters: buildFilters(req.query, true),
      sort: getSortParams(req.query),
      limit,
      offset,
    });

    sendResponse(res, 200, {
      hotDeals: hotels,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalHotDeals: count,
    });
  } catch (error) {
    logger.error("Помилка при отриманні гарячих турів: ", error.message);
    sendResponse(res, 500, {
      error: "Не вдалося отримати гарячі тури",
      details: error.message,
    });
  }
};

// Обробка запиту для отримання топ-готелів за замовленнями
const getTopHotels = async (req, res) => {
  try {
    logger.info("Отримання топ-10 готелів за кількістю замовлень");

    const { hotels } = await fetchHotelsData({
      filters: {},
      sort: [["total_orders", "DESC"]],
      limit: 10,
      offset: 0,
    });

    sendResponse(res, 200, {
      topHotels: hotels,
      total: hotels.length,
    });
  } catch (error) {
    logger.error("Помилка при отриманні топ-10 готелів: ", error.message);
    sendResponse(res, 500, {
      error: "Не вдалося отримати топ-10 готелів",
      details: error.message,
    });
  }
};

// Обробка запиту для отримання топ-готелів за рейтингом
const getTopRatedHotels = async (req, res) => {
  try {
    logger.info("Отримання топ-10 готелів за рейтингом");

    const { hotels } = await fetchHotelsData({
      filters: {},
      sort: [["average_rating", "DESC"]],
      limit: 10,
      offset: 0,
    });

    sendResponse(res, 200, {
      topRatedHotels: hotels,
      total: hotels.length,
    });
  } catch (error) {
    logger.error(
      "Помилка при отриманні топ-10 готелів за рейтингом: ",
      error.message
    );
    sendResponse(res, 500, {
      error: "Не вдалося отримати топ-10 готелів за рейтингом",
      details: error.message,
    });
  }
};

// Обробка запиту для отримання топ-гарячих готелів
const getTopHotDeals = async (req, res) => {
  try {
    logger.info("Отримання топ-10 гарячих готелів");

    const { hotels } = await fetchHotelsData({
      filters: { is_hot_deal: true },
      sort: [["tour_price", "ASC"]],
      limit: 10,
      offset: 0,
    });

    sendResponse(res, 200, {
      topHotDeals: hotels,
      total: hotels.length,
    });
  } catch (error) {
    logger.error(
      "Помилка при отриманні топ-10 гарячих готелів: ",
      error.message
    );
    sendResponse(res, 500, {
      error: "Не вдалося отримати топ-10 гарячих готелів",
      details: error.message,
    });
  }
};

const getAllHotelsWithStreaming = async (req, res) => {
  try {
    // Налаштування заголовків для SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Відправка початкового повідомлення
    res.write('data: {"status": "starting"}\n\n');

    logger.info("Отримання всіх готелів з потоковим завантаженням");

    // Створюємо Set для відстеження унікальних ID готелів
    const processedHotelIds = new Set();

    // Потокове завантаження готелів
    const hotelsStream = await models.Hotels.findAll({
      attributes: HOTEL_ATTRIBUTES,
      include: [
        {
          model: models.HotelLocation,
          as: "location",
          attributes: ["id", "latitude", "longitude"],
        },
      ],
      nest: true,
    });

    // Перевірка на порожні дані
    if (!hotelsStream || hotelsStream.length === 0) {
      logger.error("Не знайдено жодного готелю.");
      res.write('data: {"error": "Не знайдено жодного готелю"}\n\n');
      res.end();
      return;
    }

    // Поступове завантаження готелів і відправка унікальних готелів через SSE
    for (const hotel of hotelsStream) {
      try {
        // Перевіряємо, чи цей готель вже було оброблено
        if (processedHotelIds.has(hotel.id)) {
          logger.info(`Пропуск дубльованого готелю з ID: ${hotel.id}`);
          continue;
        }

        // Додаємо ID готелю до Set обраблених
        processedHotelIds.add(hotel.id);

        // Очищаємо дані перед відправкою
        const cleanedHotel = cleanHotelData(hotel);

        // Перевірка, чи очищені дані мають правильну структуру
        if (!cleanedHotel || Object.keys(cleanedHotel).length === 0) {
          throw new Error("Очищені дані готелю мають неправильну структуру");
        }

        // Відправляємо кожен унікальний готель на клієнт через SSE
        res.write(`data: ${JSON.stringify(cleanedHotel)}\n\n`);

        // Затримка для симуляції поступового завантаження (за потребою)
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        logger.error(`Помилка при обробці готелю ${hotel.id}: ${err.message}`);
        res.write(
          `data: {"error": "Помилка при обробці готелю ${hotel.id}"}\n\n`
        );
      }
    }

    // Додаємо статистику в кінцеве повідомлення
    const stats = {
      status: "completed",
      totalProcessed: processedHotelIds.size,
      duplicatesSkipped: hotelsStream.length - processedHotelIds.size,
    };

    // Завершуємо SSE з'єднання
    res.write(`data: ${JSON.stringify(stats)}\n\n`);
    res.end();
  } catch (error) {
    logger.error(
      "Помилка при отриманні готелів з потоковим завантаженням: ",
      error.message
    );
    res.write('data: {"error": "Не вдалося отримати список всіх готелів"}\n\n');
    res.end();
  }
};

module.exports = {
  getAllHotels,
  getHotDeals,
  getTopHotels,
  getTopRatedHotels,
  getTopHotDeals,
  getAllHotelsWithStreaming,
};
