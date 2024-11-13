const winston = require("winston");
const moment = require("moment-timezone");

// Встановлюємо часовий пояс для моменту
moment.tz.setDefault("Europe/Kiev");

// Створюємо конфігурований об'єкт логера за допомогою winston.createLogger().
const logger = winston.createLogger({
  // Встановлюємо основний рівень логування на "info". Це означає, що повідомлення
  // з рівнем "info" та вище (warn, error) будуть записуватись у журнали.
  level: "info",
  // Налаштовуємо два транспортні засоби (transports), які визначають куди і в якому форматі записувати логи.
  transports: [
    // Консольний транспорт: виводить логи в консоль під час виконання програми.
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Додає кольорове форматування для читабельності.
        winston.format.simple() // Використовує простий текстовий формат.
      ),
      level: "info", // Логи з рівнем "info" і вище виводяться в консоль.
    }),
    // Файловий транспорт: зберігає логи у файл "logs/app.log" для подальшого аналізу.
    new winston.transports.File({
      filename: "logs/app.log", // Шлях до файлу для збереження логів.
      level: "info", // Записує логи з рівнем "info" і вище у файл.
      format: winston.format.combine(
        winston.format.timestamp({
          // Додає мітку часу до кожного запису лога.
          format: () => moment().format(), // Використовуємо moment для правильного часу
        }),
        winston.format.json() // Зберігає лог у форматі JSON для структурованого зберігання.
      ),
    }),
  ],
});

module.exports = logger;
