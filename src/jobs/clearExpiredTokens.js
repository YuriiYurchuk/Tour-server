const cron = require("node-cron");
const RefreshToken = require("../models/RefreshToken");

// Налаштовуємо розклад виконання завдання: кожен день опівночі ("0 0 * * *").
// Це завдання буде видаляти всі прострочені токени з бази даних
cron.schedule("0 0 * * *", async () => {
  try {
    // Поточна дата і час.
    const now = new Date();
    // Видаляємо всі токени, у яких значення `expires_at` менше поточної дати,
    // тобто всі токени, термін дії яких закінчився.
    const result = await RefreshToken.destroy({
      where: {
        expires_at: { lt: now }, // Умови видалення прострочених токенів
      },
    });
    console.log(`Видалено ${result} прострочених токенів.`);
  } catch (error) {
    console.error("Помилка при видаленні прострочених токенів:", error);
  }
});

module.exports = cron;
