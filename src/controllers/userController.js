const User = require("../models/User");
const logger = require("../config/logger");

// Функція оновлення даних користувача
async function updateUser(req, res) {
  try {
    // Отримуємо id користувача, який виконує запит, з токена
    const userId = req.user.id;
    // Деструктуризація даних з тіла запиту (дані для оновлення)
    const { first_name, last_name, avatar_url, email } = req.body;

    // Перевірка, чи вказано хоча б одне поле для оновлення
    if (!first_name && !last_name && !avatar_url && !email) {
      logger.warn(`Користувач ${userId} не надав даних для оновлення.`);
      return res
        .status(400)
        .json({ message: "Будь ласка, надайте дані для оновлення." });
    }

    // Знаходимо користувача по id
    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn(`Користувача з id ${userId} не знайдено.`);
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    // Перевірка, чи підтверджена електронна пошта
    if (!user.email_verified) {
      logger.warn(`Користувач ${userId} не підтвердив свою електронну пошту.`);
      return res.status(400).json({
        message: "Ваша електронна пошта не підтверджена. Оновлення неможливе.",
      });
    }

    // Оновлення даних користувача
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (avatar_url) user.avatar_url = avatar_url;
    if (email) {
      // Перевірка, чи електронна пошта вже використовується іншим користувачем
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        logger.warn(`Електронна пошта ${email} вже використовується.`);
        return res
          .status(409)
          .json({ message: "Ця електронна пошта вже використовується." });
      }
      user.email = email;
    }

    // Збереження оновлених даних в базі
    await user.save();

    // Логування успішного оновлення даних
    logger.info(`Користувач ${userId} успішно оновив свої дані.`);
    res
      .status(200)
      .json({ message: "Дані користувача успішно оновлені", user });
  } catch (error) {
    // Логування помилки при оновленні даних
    logger.error(`Помилка при оновленні даних користувача: ${error.message}`);
    res.status(500).json({ message: "Помилка оновлення даних користувача" });
  }
}

async function getUsers(req, res) {
  try {
    // Отримуємо всіх користувачів, вибираючи тільки id, username, email і role
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role"], // Вибірка лише необхідних полів
    });

    // Фільтруємо користувачів, виключаючи тих, у кого роль "admin"
    const filteredUsers = users.filter((user) => user.role !== "admin");

    // Якщо після фільтрації користувачів не залишилося
    if (filteredUsers.length === 0) {
      logger.warn("Не знайдено жодного користувача, окрім адміністраторів.");
      return res.status(404).json({ message: "Користувачів не знайдено." });
    }

    // Повертаємо список користувачів, окрім адміністраторів
    logger.info("Список користувачів успішно отримано.");
    return res.status(200).json({ users: filteredUsers });
  } catch (error) {
    // Логування помилки при отриманні користувачів
    logger.error(`Помилка при отриманні користувачів: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Помилка при отриманні користувачів." });
  }
}

// Функція для оновлення ролі користувача
async function updateUserRole(req, res) {
  try {
    // Отримуємо id адміністратора та нову роль з тіла запиту
    const adminId = req.user.id;
    const { userId, newRole } = req.body;

    // Перевірка на допустимі ролі
    const validRoles = ["user", "manager", "admin"];
    if (!validRoles.includes(newRole)) {
      logger.warn(
        `Користувач з ID ${adminId} намагається призначити недопустиму роль: ${newRole}.`
      );
      return res.status(400).json({ message: "Недопустима роль." });
    }

    // Знаходимо користувача за ID
    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn(`Користувач з ID ${userId} не знайдений.`);
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    // Перевірка, чи роль, яку ми хочемо призначити, не є тією ж самою
    if (user.role === newRole) {
      return res
        .status(400)
        .json({ message: "Цей користувач вже має цю роль." });
    }

    // Оновлення ролі користувача
    user.role = newRole;
    await user.save();

    // Логування зміни ролі
    logger.info(
      `Адміністратор з ID ${adminId} змінив роль користувача з ID ${userId} на ${newRole}.`
    );
    return res
      .status(200)
      .json({ message: `Роль користувача успішно змінено на ${newRole}.` });
  } catch (error) {
    logger.error(`Помилка при зміні ролі користувача: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Помилка при зміні ролі користувача." });
  }
}

module.exports = { updateUser, getUsers, updateUserRole };
