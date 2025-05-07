const Booking = require("../models/Booking");

const checkUserPermissionFor = async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user.id; // Ідентифікатор користувача з authMiddleware

  // Знайдемо бронювання по ID
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    return res.status(404).json({ message: "Бронювання не знайдено." });
  }

  // Перевіряємо, чи належить бронювання цьому користувачеві
  if (booking.user_id !== userId) {
    return res
      .status(403)
      .json({ message: "Ви не можете скасувати чужі бронювання." });
  }

  next(); // Дозволити скасування, якщо це бронювання користувача
};

module.exports = checkUserPermissionFor;
