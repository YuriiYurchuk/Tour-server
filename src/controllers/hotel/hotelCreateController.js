const models = require("../../models/Hotel/models");
const logger = require("../../config/logger");

// Функція для створення нового готелю
const createHotel = async (req, res) => {
  const transaction = await models.Hotels.sequelize.transaction();
  try {
    let {
      name,
      country,
      star_rating,
      description,
      is_hot_deal,
      tour_start_date,
      tour_end_date,
      tour_price,
      average_rating,
      review_count,
      included_meal_types,
      season,
      city,
      location,
      amenities,
      meals,
      services,
      kids,
      pools,
      spas,
      beach,
      activities,
      restaurants,
      surroundings,
      contact,
      airportDistance,
      generalInfo,
      communication,
      roomTypes,
    } = req.body;

    // Функція для парсингу JSON з обробкою помилок
    const parseJson = (data) => {
      try {
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch (error) {
        logger.error(`Помилка парсингу JSON: ${error.message}`);
        return [];
      }
    };

    // Парсимо всі поля, які мають бути у форматі JSON
    location = parseJson(location);
    amenities = parseJson(amenities);
    meals = parseJson(meals);
    services = parseJson(services);
    kids = parseJson(kids);
    pools = parseJson(pools);
    spas = parseJson(spas);
    beach = parseJson(beach);
    activities = parseJson(activities);
    restaurants = parseJson(restaurants);
    surroundings = parseJson(surroundings);
    contact = parseJson(contact);
    airportDistance = parseJson(airportDistance);
    generalInfo = parseJson(generalInfo);
    communication = parseJson(communication);
    roomTypes = parseJson(roomTypes);

    // Створення нового готелю в базі даних
    const newHotel = await models.Hotels.create(
      {
        name,
        country,
        star_rating,
        description,
        is_hot_deal,
        tour_start_date,
        tour_end_date,
        tour_price,
        average_rating,
        review_count,
        included_meal_types,
        season,
        city,
      },
      { transaction }
    );

    const hotelId = newHotel.id;
    logger.info(`Готель створено: ${name} (ID: ${hotelId})`);

    // Функція для масового додавання даних в базу з обробкою помилок
    const bulkInsert = async (model, data, transformFn, errorMessage) => {
      if (data?.length > 0) {
        try {
          await model.bulkCreate(transformFn(data), { transaction });
          logger.info(`Успішно додано дані в модель ${model.name}`);
        } catch (error) {
          logger.error(`${errorMessage}: ${error.message}`);
          throw error;
        }
      }
    };

    // Простий список асоціацій з додаванням даних до відповідних моделей
    const simpleAssociations = [
      {
        model: models.HotelAmenities,
        data: amenities ? [amenities] : [],
        errorMessage: "Помилка при додаванні зручностей",
      },
      {
        model: models.HotelServices,
        data: services ? [services] : [],
        errorMessage: "Помилка при додаванні сервісів",
      },
      {
        model: models.HotelKids,
        data: kids ? [kids] : [],
        errorMessage: "Помилка при додаванні дитячих послуг",
      },
      {
        model: models.HotelPools,
        data: pools ? [pools] : [],
        errorMessage: "Помилка при додаванні басейнів",
      },
      {
        model: models.HotelSpas,
        data: spas ? [spas] : [],
        errorMessage: "Помилка при додаванні СПА",
      },
      {
        model: models.HotelBeach,
        data: beach ? [beach] : [],
        errorMessage: "Помилка при додаванні пляжу",
      },
      {
        model: models.HotelActivity,
        data: activities ? [activities] : [],
        errorMessage: "Помилка при додаванні активностей",
      },
      {
        model: models.HotelRestaurants,
        data: restaurants ? [restaurants] : [],
        errorMessage: "Помилка при додаванні ресторанів",
      },
      {
        model: models.HotelSurroundings,
        data: surroundings ? [surroundings] : [],
        errorMessage: "Помилка при додаванні довколишніх об'єктів",
      },
      {
        model: models.HotelGeneral,
        data: generalInfo ? [generalInfo] : [],
        errorMessage: "Помилка при додаванні загальної інформації",
      },
      {
        model: models.HotelCommunication,
        data: communication ? [communication] : [],
        errorMessage: "Помилка при додаванні комунікацій",
      },
      {
        model: models.HotelContact,
        data: contact ? [contact] : [],
        errorMessage: "Помилка при додаванні контактної інформації",
      },
      {
        model: models.HotelAirportDistance,
        data: airportDistance ? [airportDistance] : [],
        errorMessage:
          "Помилка при додаванні інформації про відстань до аеропорту",
      },
    ];

    // Додаємо дані у відповідні моделі
    for (const { model, data, errorMessage } of simpleAssociations) {
      await bulkInsert(
        model,
        data,
        (array) => array.map((item) => ({ hotel_id: hotelId, ...item })),
        errorMessage
      );
    }

    // Якщо є локація, додаємо інформацію про координати
    if (location) {
      const { latitude, longitude } = location;
      if (!latitude || !longitude)
        throw new Error("Широта та довгота є обов'язковими");

      await models.HotelLocation.create(
        { hotel_id: hotelId, latitude, longitude },
        { transaction }
      );
      logger.info("Успішно додано інформацію про локацію");
    }

    // Додаємо типи харчування
    await bulkInsert(
      models.HotelMealTypes,
      meals,
      (meals) => meals.map((meal) => ({ hotel_id: hotelId, ...meal })),
      "Помилка при додаванні типів харчування"
    );

    // Якщо є зображення галереї, додаємо їх
    if (req.files?.gallery) {
      const galleryDescriptions = parseJson(req.body.galleryDescriptions || []);
      await bulkInsert(
        models.HotelGallery,
        req.files.gallery,
        (gallery) =>
          gallery.map((file, index) => ({
            hotel_id: hotelId,
            photo_url: `/uploads/gallery/${file.filename}`,
            description: galleryDescriptions[index] || "",
          })),
        "Помилка при додаванні зображень галереї"
      );
    }

    // Якщо є файли типів кімнат, додаємо їх
    if (req.files?.roomType) {
      await bulkInsert(
        models.HotelRoomTypes,
        req.files.roomType,
        (roomFiles) =>
          roomFiles.map((file, index) => ({
            hotel_id: hotelId,
            name: roomTypes[index]?.name || `Номер ${index + 1}`,
            capacity: roomTypes[index]?.capacity || 2,
            price: roomTypes[index]?.price || 100,
            photo_url: `/uploads/room_types/${file.filename}`,
            amenities: roomTypes[index]?.amenities || [],
          })),
        "Помилка при додаванні типів кімнат"
      );
    }

    // Завершуємо транзакцію
    await transaction.commit();
    res.status(201).json({ message: "Готель успішно створено", hotelId });
  } catch (error) {
    // Якщо сталася помилка, скасовуємо транзакцію
    await transaction.rollback();
    res
      .status(500)
      .json({ error: "Не вдалося створити готель", details: error.message });
  }
};

module.exports = { createHotel };
