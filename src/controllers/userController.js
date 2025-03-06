const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const logger = require("../config/logger");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../utils/mailer");

// Функція оновлення даних користувача
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email, current_password, new_password } =
      req.body;
    let avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    if (!first_name && !last_name && !avatarUrl && !email && !new_password) {
      logger.warn(`Користувач ${userId} не надав даних для оновлення.`);
      return res
        .status(400)
        .json({ message: "Будь ласка, надайте дані для оновлення." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn(`Користувача з id ${userId} не знайдено.`);
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    const DEFAULT_AVATAR = "/uploads/avatars/default-avatar.jpg";

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;

    if (avatarUrl) {
      if (user.avatar_url && user.avatar_url !== DEFAULT_AVATAR) {
        const oldAvatarPath = path.join(__dirname, "../../", user.avatar_url);
        try {
          await fs.promises.unlink(oldAvatarPath);
          logger.info(`Старий аватар видалено: ${oldAvatarPath}`);
        } catch (err) {
          logger.warn(`Не вдалося видалити старий аватар: ${err.message}`);
        }
      }
      user.avatar_url = avatarUrl;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        logger.warn(`Електронна пошта ${email} вже використовується.`);
        return res
          .status(409)
          .json({ message: "Ця електронна пошта вже використовується." });
      }

      const email_verification_token = crypto.randomBytes(32).toString("hex");
      user.email = email;
      user.email_verified = false;
      user.email_verification_token = email_verification_token;
      await sendVerificationEmail(email, email_verification_token);
      logger.info(
        `Користувач ${userId} оновив електронну адресу. Верифікація потрібна повторно.`
      );
    }
    if (new_password) {
      if (!current_password) {
        return res
          .status(400)
          .json({ message: "Необхідно вказати старий пароль." });
      }

      const isMatch = await bcrypt.compare(
        current_password,
        user.password_hash
      );
      if (!isMatch) {
        logger.warn(`Старий пароль для користувача ${userId} невірний.`);
        return res.status(400).json({ message: "Старий пароль неправильний." });
      }

      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(new_password, salt);
      logger.info(`Користувач ${userId} змінив пароль.`);
    }

    await user.save();
    logger.info(`Користувач ${userId} успішно оновив свої дані.`);
    res
      .status(200)
      .json({ message: "Дані користувача успішно оновлені", user });
  } catch (error) {
    logger.error(`Помилка при оновленні даних користувача: ${error.message}`);
    res.status(500).json({ message: "Помилка оновлення даних користувача" });
  }
};

const getUsers = async (req, res) => {
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
};

// Функція для оновлення ролі користувача
const updateUserRole = async (req, res) => {
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
};

module.exports = { updateUser, getUsers, updateUserRole };
