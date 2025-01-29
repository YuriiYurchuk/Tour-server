const model = require("../../models/Hotel/models");
const User = require("../../models/User");
const logger = require("../../config/logger");

// Функція для отримання даних готелю за ID разом із пов'язаними моделями
const getHotelByIdWithAssociations = async (req, res) => {
  const hotelId = req.params.hotelId;

  logger.info(`Отримання даних готелю з ID: ${hotelId}`);

  try {
    // Пошук готелю в базі даних із включенням пов'язаних даних
    const hotel = await model.Hotels.findOne({
      where: { id: hotelId },
      include: [
        // Отримання всіх даних пов'язаних з готелем
        {
          model: model.HotelReview,
          as: "reviews",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "first_name"],
            },
          ],
          order: [["created_at", "DESC"]],
          limit: 2,
        },
        {
          model: model.HotelRoomTypes,
          as: "room_types",
        },
        {
          model: model.HotelMealTypes,
          as: "meal_types",
        },
        {
          model: model.HotelGallery,
          as: "gallery",
        },
        {
          model: model.HotelLocation,
          as: "location",
        },
        {
          model: model.AverageRating,
          as: "rating",
        },
        {
          model: model.HotelActivity,
          as: "activities",
        },
        {
          model: model.HotelAmenities,
          as: "amenities",
        },
        {
          model: model.HotelSpas,
          as: "spas",
        },
        {
          model: model.HotelPools,
          as: "pools",
        },
        {
          model: model.HotelRestaurants,
          as: "restaurants",
        },
        {
          model: model.HotelSurroundings,
          as: "surroundings",
        },
        {
          model: model.HotelAirportDistance,
          as: "airport",
        },
        {
          model: model.HotelBeach,
          as: "beach",
        },
        {
          model: model.HotelCommunication,
          as: "communication",
        },
        {
          model: model.HotelContact,
          as: "contact",
        },
        {
          model: model.HotelGeneral,
          as: "general",
        },
        {
          model: model.HotelKids,
          as: "kids",
        },
        {
          model: model.HotelServices,
          as: "services",
        },
      ],
    });

    // Перевірка, чи знайдено готель
    if (!hotel) {
      logger.warn(`Готель з ID: ${hotelId} не знайдений`);
      return res.status(404).json({ message: "Готель не знайдено" });
    }

    // Успішний результат
    logger.info(`Дані готелю з ID: ${hotelId} успішно отримано`);
    return res.status(200).json(hotel);
  } catch (error) {
    // Обробка помилки і логування
    logger.error(
      `Помилка при отриманні готелю з ID: ${hotelId}. Деталі: ${error.message}`
    );
    return res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

module.exports = { getHotelByIdWithAssociations };
