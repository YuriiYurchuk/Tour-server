const Booking = require("../../models/Booking");
const BookingFlight = require("../../models/BookingFlight");
const BookingChildren = require("../../models/BookingChildren");
const Hotels = require("../../models/Hotel/Hotels");
const HotelRoomTypes = require("../../models/Hotel/HotelRoomTypes");
const HotelMealTypes = require("../../models/Hotel/HotelMealTypes");
const logger = require("../../config/logger");

const getBookingByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Логування запиту на отримання бронювання по ID користувача
    logger.info("Запит на отримання бронювання для користувача", { user_id });

    // Шукаємо бронювання для вказаного користувача з усіма асоційованими даними
    const booking = await Booking.findOne({
      where: { user_id },
      include: [
        { model: BookingFlight, as: "flights" }, // Рейси, асоційовані з бронюванням
        { model: BookingChildren, as: "children" }, // Діти, асоційовані з бронюванням
        { model: Hotels }, // Готель, асоційований з бронюванням
        { model: HotelRoomTypes }, // Типи кімнат, асоційовані з бронюванням
        { model: HotelMealTypes }, // Типи харчування, асоційовані з бронюванням
      ],
    });

    // Якщо бронювання не знайдено
    if (!booking) {
      logger.warn("Бронювання не знайдено для користувача", { user_id });
      return res.status(404).json({ message: "Бронювання не знайдено" });
    }

    // Логування успішного отримання бронювання
    logger.info("Бронювання знайдено", { booking_id: booking.id, user_id });

    // Повертаємо знайдене бронювання у відповіді
    res.status(200).json({ booking });
  } catch (err) {
    // Логування помилки при отриманні бронювання
    logger.error("Помилка при отриманні бронювання", {
      user_id,
      error: err.message,
    });

    // Відправлення помилки у відповідь
    res.status(500).json({
      message: "Не вдалося отримати бронювання",
      error: err.message,
    });
  }
};

module.exports = { getBookingByUserId };
