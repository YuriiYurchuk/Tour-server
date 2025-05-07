const Booking = require("../../models/Booking");
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
    const booking = await Booking.findAll({
      where: { user_id },
      include: [
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

const getSingleBookingWithConfirmation = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { id } = req.user; // Припускаємо, що user_id приходить з авторизації через middleware

    // Логування запиту на отримання одного бронювання
    logger.info("Запит на отримання бронювання по ID", { booking_id });

    // Шукаємо одне бронювання по ID з усіма асоційованими даними
    const booking = await Booking.findOne({
      where: { id: booking_id },
      include: [
        { model: BookingChildren, as: "children" }, // Діти, асоційовані з бронюванням
        { model: Hotels }, // Готель, асоційований з бронюванням
        { model: HotelRoomTypes }, // Типи кімнат, асоційовані з бронюванням
        { model: HotelMealTypes }, // Типи харчування, асоційовані з бронюванням
      ],
    });

    // Якщо бронювання не знайдено
    if (!booking) {
      logger.warn("Бронювання не знайдено", { booking_id });
      return res.status(404).json({ message: "Бронювання не знайдено" });
    }

    // Перевірка чи збігається user_id з бронюванням
    if (booking.user_id !== id) {
      logger.warn("Користувач не має доступу до цього бронювання", {
        booking_id,
        id,
      });
      return res
        .status(403)
        .json({ message: "Немає доступу до цього бронювання" });
    }

    // Логування успішного отримання бронювання
    logger.info("Бронювання знайдено", { booking_id });

    // Перевірка статусу підтвердження
    const isConfirmed = booking.status === "підтверджено";

    // Повертаємо знайдене бронювання разом з інформацією про підтвердження
    res.status(200).json({
      booking,
      confirmed: isConfirmed,
    });
  } catch (err) {
    // Логування помилки при отриманні бронювання
    logger.error("Помилка при отриманні бронювання", {
      error: err.message,
    });

    // Відправлення помилки у відповідь
    res.status(500).json({
      message: "Не вдалося отримати бронювання",
      error: err.message,
    });
  }
};

module.exports = { getBookingByUserId, getSingleBookingWithConfirmation };
