const cron = require("node-cron");
const { permanentlyDeleteUser } = require("../controllers/accountController");
const logger = require("../config/logger");

// Планувальник для регулярного виконання завдання (кожного дня о 2-й годині ночі)
cron.schedule("0 2 * * *", async () => {
  try {
    logger.info("Початок процесу остаточного видалення акаунтів...");
    await permanentlyDeleteUser();
  } catch (error) {
    logger.error(`Помилка при виконанні планувальника: ${error.message}`);
  }
});

module.exports = cron;