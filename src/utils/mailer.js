const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

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

module.exports = { sendVerificationEmail };
