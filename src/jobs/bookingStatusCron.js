const cron = require("node-cron");
const { Op } = require("sequelize");
const Booking = require("../models/Booking");
const logger = require("../config/logger");

// Запускаємо cron задачу, яка працюватиме щодня о 00:00
cron.schedule("0 0 * * *", async () => {
  try {
    // Отримуємо поточну дату
    const currentDate = new Date();

    // Знайдемо всі бронювання, де дата завершення менша або дорівнює поточній даті
    const bookings = await Booking.findAll({
      where: {
        end_date: {
          [Op.lte]: currentDate, // Перевірка, чи поточна дата більша або дорівнює кінцевій даті
        },
        status: {
          [Op.not]: "завершено", // Перевіряємо, що статус не є вже "завершено"
        },
      },
    });

    // Оновлюємо статус для кожного знайденого бронювання
    for (const booking of bookings) {
      booking.status = "завершено"; // Оновлюємо статус
      await booking.save(); // Зберігаємо зміни в базі даних

      logger.info(
        `Статус бронювання з ID ${booking.id} оновлено на "завершено"`
      );
    }
  } catch (error) {
    logger.error("Помилка при зміні статусу бронювань на завершено", {
      error: error.message,
    });
  }
});

module.exports = cron;

