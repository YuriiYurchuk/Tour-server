const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { sendVerificationEmail } = require("../utils/mailer");
const logger = require("../config/logger");

// Функція для реєстрації нового користувача
const register = async (req, res) => {
  try {
    // Отримуємо дані запиту
    const { username, email, password, first_name, last_name } = req.body;

    // Перевірка заповнених обов'язкових полів
    if (!username || !email || !password) {
      logger.warn(`Невірні дані для реєстрації: ${email}`);
      return res.status(400).json({ message: "Усі поля мають бути заповнені" });
    }

    // Перевірка чи існує користувач з такою електронною адресою
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Користувач з такою електронною поштою вже існує: ${email}`);
      return res
        .status(409)
        .json({ message: "Користувач з такою електронною поштою вже існує" });
    }

    // Перевірка чи існує користувач з таким ім'ям
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      logger.warn(`Користувач з таким ім'ям вже існує: ${username}`);
      return res
        .status(409)
        .json({ message: "Користувач з таким ім'ям вже існує" });
    }

    // Хешування паролю
    const password_hash = await bcrypt.hash(password, 10);

    // Генерація токена для підтвердження електронної пошти
    const email_verification_token = crypto.randomBytes(32).toString("hex");

    // Створення нового користувача
    const user = await User.create({
      username,
      email,
      password_hash,
      first_name: first_name || null,
      last_name: last_name || null,
      avatar_url: "/uploads/avatars/default-avatar.jpg",
      email_verification_token,
    });

    // Відправлення листа для підтвердження електронної пошти
    await sendVerificationEmail(email, email_verification_token);

    // Логування успішної реєстрації
    logger.info(`Користувач успішно зареєстрований: ${email}`);
    res.status(201).json({ message: "Користувач створений успішно", user });
  } catch (error) {
    // Логування помилки реєстрації
    logger.error(`Помилка реєстрації користувача: ${error.message}`);
    console.error(error);
    res.status(500).json({ message: "Помилка реєстрації користувача" });
  }
};

// Функція для входу користувача
const login = async (req, res) => {
  try {
    const { loginInput, password } = req.body;
    logger.info(`Запит на вхід для користувача: ${loginInput}`);

    // Пошук користувача за email або username
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: loginInput }, { username: loginInput }],
      },
    });

    // Якщо користувач не знайдений
    if (!user) {
      logger.warn(`Невірний логін: ${loginInput}`);
      return res.status(401).json({ message: "Неправильний логін або пароль" });
    }

    // Перевірка правильності паролю
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn(`Невірний пароль для користувача: ${loginInput}`);
      return res.status(401).json({ message: "Неправильний логін або пароль" });
    }

    // Створення access токена для авторизації
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" } // Термін дії access токена - 15 хвилин
    );

    // Створення refresh токена для оновлення access токена в майбутньому
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" } // Термін дії refresh токена - 30 днів
    );

    // Збереження refresh токена в базі
    await RefreshToken.create({
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Термін дії refresh токена
    });

    // Збереження refresh токена в куках для подальшої авторизації
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Доступ до cookie лише через сервер
      // Якщо в продакшн-режимі, то cookie передається лише через HTTPS
      secure:
        process.env.NODE_ENV === "production" &&
        process.env.TEST_ENV !== "test",
      maxAge: 30 * 24 * 60 * 60 * 1000, // Термін дії cookie - 30 днів
    });

    // Логування успішного входу
    logger.info(`Користувач ${user.username} успішно увійшов`);
    res.json({ accessToken }); // Відправлення access токена в відповідь
  } catch (error) {
    // Логування помилки при вході
    logger.error(`Помилка при вході: ${error.message}`);
    res.status(500).json({ message: "Помилка входу" });
  }
};

// Функція для оновлення access токена за допомогою refresh токена
const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies; // Отримуємо refresh токен з куків

  // Якщо refresh токен відсутній
  if (!refreshToken) {
    logger.warn("Відсутній refresh токен при спробі оновлення");
    return res.status(401).json({ message: "Відсутній токен оновлення" });
  }

  try {
    // Пошук збереженого refresh токена в базі
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    // Якщо токен не знайдений або він прострочений
    if (!storedToken || storedToken.expires_at < new Date()) {
      logger.warn("Refresh токен не знайдений або прострочений");
      res.clearCookie("refreshToken"); // Видаляємо недійсний refresh токен з куків
      return res
        .status(403)
        .json({ message: "Недійсний або прострочений токен" });
    }

    // Верифікація refresh токена
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Генерація нового access токена
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" } // Термін дії нового access токена
    );

    // Логування успішного оновлення токену
    logger.info(`Оновлено access токен для користувача ${user.username}`);
    res.json({ accessToken: newAccessToken }); // Відправлення нового access токена
  } catch (error) {
    // Логування помилки при оновленні токену
    logger.error(`Помилка при оновленні токену: ${error.message}`);
    res.clearCookie("refreshToken"); // Видалення недійсного refresh токена
    res.status(403).json({ message: "Недійсний або прострочений токен" });
  }
};

// Функція для виходу користувача
const logout = async (req, res) => {
  const refreshToken = req.cookies ? req.cookies.refreshToken : null; // Отримуємо refresh токен з куків

  // Якщо refresh токен відсутній
  if (!refreshToken) {
    logger.warn("Refresh токен відсутній при спробі виходу");
    return res.status(400).json({ message: "Токен відсутній у запиті" });
  }

  try {
    // Видалення refresh токена з бази даних
    await RefreshToken.destroy({ where: { token: refreshToken } });
    res.clearCookie("refreshToken"); // Видаляємо refresh токен з куків

    // Логування успішного виходу
    logger.info("Користувач успішно вийшов із системи");
    res.status(200).json({ message: "Вихід успішний" });
  } catch (error) {
    // Логування помилки при виході
    logger.error(`Помилка при виході користувача: ${error.message}`);
    res.status(500).json({ message: "Помилка виходу" });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
