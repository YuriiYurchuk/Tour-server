const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger");

const transporter = nodemailer.createTransport({
  // Встановлюємо конфігурацію для SMTP-сервера
  service: process.env.EMAIL_SERVICE, // Сервіс електронної пошти
  auth: {
    user: process.env.EMAIL_USERNAME, // Ім'я користувача для аутентифікації
    pass: process.env.EMAIL_PASSWORD, // Пароль для аутентифікації
  },
});

async function sendVerificationEmail(userEmail, token) {
  // Вказуємо шлях до шаблону листа підтвердження електронної пошти
  const templatePath = path.join(
    __dirname,
    "../templates/verificationEmailTemplate.html"
  );
  // Читаємо HTML-шаблон з файлу
  let html = fs.readFileSync(templatePath, "utf-8");

  // Створюємо URL для підтвердження електронної пошти, додаючи токен як параметр
  const verificationUrl = `${process.env.BASE_URL}/api/email/verify-email?token=${token}`;
  html = html.replace("{{verificationUrl}}", verificationUrl);

  // Відправляємо електронний лист за допомогою налаштованого транспорту
  await transporter.sendMail({
    from: `"Підтримка" <${process.env.EMAIL_USER}>`, // Відправник
    to: userEmail, // Отримувач
    subject: "Підтвердження електронної пошти", // Тема листа
    html, // HTML-контент листа
  });
}

async function sendBookingConfirmationEmail(
  user,
  booking,
  hotel,
  roomType,
  mealType
) {
  try {
    // Перевірка на наявність змінних оточення
    if (
      !process.env.EMAIL_SERVICE ||
      !process.env.EMAIL_USERNAME ||
      !process.env.EMAIL_PASSWORD
    ) {
      throw new Error("Не вистачає змінних оточення для налаштування email");
    }

    // Шлях до шаблону підтвердження бронювання
    const templatePath = path.join(
      __dirname,
      "../templates/bookingConfirmationTemplate.html"
    );

    // Перевірка на наявність шаблону
    if (!fs.existsSync(templatePath)) {
      throw new Error("Шаблон підтвердження бронювання не знайдено");
    }

    // Читаємо HTML-шаблон
    let html = fs.readFileSync(templatePath, "utf-8");

    // Заміна плейсхолдерів на реальні значення
    html = html
      .replace("{{userName}}", user.first_name) // Використовуємо ім'я користувача
      .replace("{{bookingId}}", booking.id) // Використовуємо номер бронювання
      .replace("{{hotelName}}", hotel.name) // Використовуємо назву готелю
      .replace("{{roomType}}", roomType.name) // Використовуємо тип кімнати
      .replace("{{mealType}}", mealType.type_name) // Використовуємо тип кімнати
      .replace("{{startDate}}", booking.start_date) // Використовуємо дату початку
      .replace("{{endDate}}", booking.end_date);

    // Відправка листа
    const mailOptions = {
      from: `"Підтримка" <${process.env.EMAIL_USERNAME}>`,
      to: user.email, // Використовуємо email користувача
      subject: "Підтвердження вашого бронювання",
      html, // Відправляємо HTML контент
    };

    // Відправка email
    await transporter.sendMail(mailOptions);
    logger.info(`Лист підтвердження успішно надіслано на ${user.email}`);
  } catch (error) {
    logger.error("Помилка при відправці email підтвердження бронювання", {
      error: error.message,
    });
    throw new Error("Не вдалося надіслати лист підтвердження бронювання");
  }
}

async function sendBookingStatusUpdateEmail(user, booking) {
  try {
    // Перевірка на наявність змінних оточення
    if (
      !process.env.EMAIL_SERVICE ||
      !process.env.EMAIL_USERNAME ||
      !process.env.EMAIL_PASSWORD
    ) {
      throw new Error("Не вистачає змінних оточення для налаштування email");
    }

    // Шлях до шаблону підтвердження бронювання
    const templatePath = path.join(
      __dirname,
      "../templates/bookingStatusUpdateTemplate.html"
    );

    // Перевірка на наявність шаблону
    if (!fs.existsSync(templatePath)) {
      throw new Error("Шаблон оновлення статусу не знайдено");
    }

    // Читаємо HTML-шаблон
    let html = fs.readFileSync(templatePath, "utf-8");

    // Заміна плейсхолдерів на реальні значення
    html = html
      .replace("{{userName}}", user.first_name) // Використовуємо ім'я користувача
      .replace("{{bookingId}}", booking.id) // Використовуємо номер бронювання
      .replace("{{status}}", booking.status) // Використовуємо новий статус
      .replace("{{startDate}}", booking.start_date) // Використовуємо дату початку
      .replace("{{endDate}}", booking.end_date); // Використовуємо дату завершення

    // Відправка листа
    const mailOptions = {
      from: `"Підтримка" <${process.env.EMAIL_USERNAME}>`,
      to: user.email, // Використовуємо email користувача
      subject: "Статус вашого бронювання змінено",
      html, // Відправляємо HTML контент
    };

    // Відправка email
    await transporter.sendMail(mailOptions);
    logger.info(
      `Лист про оновлення статусу успішно надіслано на ${user.email}`
    );
  } catch (error) {
    logger.error("Помилка при відправці email про оновлення статусу", {
      error: error.message,
    });
    throw new Error("Не вдалося надіслати лист про оновлення статусу");
  }
}

module.exports = {
  sendVerificationEmail,
  sendBookingConfirmationEmail,
  sendBookingStatusUpdateEmail,
};
