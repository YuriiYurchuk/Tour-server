const crypto = require("crypto");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/mailer");
const logger = require("../config/logger");

// Підтвердження електронної пошти користувача
const verifyEmail = async (req, res) => {
  try {
    // Отримуємо токен з запиту
    const { token } = req.query;

    // Якщо токен відсутній, виводимо попередження та повертаємо 400 помилку
    if (!token) {
      logger.warn("Токен відсутній при спробі підтвердження електронної пошти");
      return res.status(400).json({ message: "Токен відсутній" });
    }

    // Знаходимо користувача з відповідним токеном підтвердження
    const user = await User.findOne({
      where: { email_verification_token: token },
    });

    // Якщо користувача не знайдено, логуємо попередження та повертаємо 400 помилку
    if (!user) {
      logger.warn(
        `Невірний або прострочений токен для електронної пошти: ${token}`
      );
      return res
        .status(400)
        .json({ message: "Невірний або прострочений токен" });
    }

    // Якщо користувача знайдено, оновлюємо статус підтвердження та очищаємо токен
    user.email_verified = true;
    user.email_verification_token = null;
    await user.save();

    // Логуємо успішне підтвердження та перенаправляємо на сторінку успіху
    logger.info(`Електронна пошта успішно підтверджена для ${user.email}`);
    res.redirect("/verificationSuccess.html");
  } catch (error) {
    // У випадку помилки логуємо її та повертаємо 500 помилку
    logger.error(`Помилка підтвердження електронної пошти: ${error.message}`);
    res
      .status(500)
      .json({ message: "Помилка підтвердження електронної пошти" });
  }
};

// Функція для повторного відправлення листа з підтвердженням електронної пошти
const resendVerificationEmail = async (req, res) => {
  try {
    // Отримуємо електронну адресу з тіла запиту
    const { email } = req.body;

    // Якщо електронна адреса не вказана, логуємо попередження та повертаємо 400 помилку
    if (!email) {
      logger.warn(
        "Не надано електронну адресу для повторної відправки підтвердження"
      );
      return res.status(400).json({ message: "Електронна адреса не вказана" });
    }

    // Знаходимо користувача з відповідною електронною адресою
    const user = await User.findOne({ where: { email } });

    // Якщо користувача не знайдено, логуємо попередження та повертаємо 404 помилку
    if (!user) {
      logger.warn(
        `Користувач з такою електронною поштою не знайдений: ${email}`
      );
      return res.status(404).json({
        message: "Користувача з такою електронною поштою не знайдено",
      });
    }

    // Якщо електронна пошта вже підтверджена, логуємо попередження та повертаємо 400 помилку
    if (user.email_verified) {
      logger.warn(`Електронна пошта вже підтверджена: ${email}`);
      return res
        .status(400)
        .json({ message: "Електронна пошта вже підтверджена" });
    }

    // Генеруємо новий токен для підтвердження електронної пошти
    const email_verification_token = crypto.randomBytes(32).toString("hex");

    // Зберігаємо новий токен у базі даних
    user.email_verification_token = email_verification_token;
    await user.save();

    // Відправляємо лист із підтвердженням
    await sendVerificationEmail(email, email_verification_token);

    // Логуємо успішне відправлення листа та повертаємо відповідь клієнту
    logger.info(
      `Лист для підтвердження пошти успішно відправлений на ${email}`
    );
    res
      .status(200)
      .json({ message: "Лист для підтвердження пошти успішно відправлений" });
  } catch (error) {
    // Логуємо помилку та повертаємо 500 помилку у випадку невдалої операції
    logger.error(
      `Помилка при повторному відправленні листа для підтвердження пошти: ${error.message}`
    );
    res.status(500).json({
      message:
        "Помилка при повторному відправленні листа для підтвердження пошти",
    });
  }
};

module.exports = { verifyEmail, resendVerificationEmail };
