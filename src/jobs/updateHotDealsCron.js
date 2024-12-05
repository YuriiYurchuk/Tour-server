const cron = require("node-cron");
const { Op } = require("sequelize");
const models = require("../models/Hotel/models"); // Шлях до вашої моделі
const logger = require("../config/logger"); // Якщо ви використовуєте логування

// Налаштовуємо cron завдання на кожен перший день місяця о 00:00
cron.schedule("0 0 1 * *", async () => {
  try {
    // Поточна дата і час
    const now = new Date();

    // Розрахунок дати, яка буде через 3-4 місяці
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() + 3); // 3 місяці вперед

    // Оновлюємо всі готелі, де `tour_end_date` знаходиться в діапазоні від 3 до 4 місяців від поточної дати
    const result = await models.Hotels.update(
      { is_hot_deal: true }, // Оновлюємо поле is_hot_deal
      {
        where: {
          tour_end_date: {
            [Op.gte]: startDate, // Готелі з датою закінчення туру від 3 місяців
          },
          is_hot_deal: false, // Оновлюємо лише ті, у яких ще не встановлено true
        },
      }
    );

    logger.info(
      `Оновлено статус для ${result[0]} готелів. Завдання виконано успішно.`
    );
  } catch (error) {
    logger.error("Помилка при оновленні готелів для hot deal:", error);
  }
});

module.exports = cron;
