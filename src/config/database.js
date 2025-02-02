const { Sequelize } = require("sequelize");

// Створюємо новий екземпляр Sequelize, використовуючи параметри підключення з environment variables.
// Це дозволяє легко змінювати налаштування бази даних без зміни коду.
const sequelize = new Sequelize(
  process.env.DB_NAME, // Ім'я бази даних
  process.env.DB_USER, // Ім'я користувача бази даних
  process.env.DB_PASSWORD, // Пароль користувача
  {
    host: process.env.DB_HOST, // Хост бази даних
    port: process.env.DB_PORT, // Порт бази даних
    dialect: "postgres", // Тип бази даних - PostgreSQL
    logging: false, // Вимикаємо логування SQL-запитів для чистоти консолі
    timezone: "Europe/Kiev", // Встановлюємо часовий пояс для бази даних
    pool: {
      max: 10, // Максимальна кількість з'єднань
      min: 0, // Мінімальна кількість з'єднань
      acquire: 30000, // Час, протягом якого sequelize буде намагатися отримати з'єднання
      idle: 10000, // Час, протягом якого з'єднання може залишатися неактивним перед тим, як воно буде закрите
    },
  }
);

// Перевіряємо підключення до бази даних
sequelize
  .authenticate()
  .then(() => {
    console.log("Підключення до бази даних успішне.");
  })
  .catch((error) => {
    console.error("Помилка підключення до бази даних:", error);
  });

module.exports = sequelize;
