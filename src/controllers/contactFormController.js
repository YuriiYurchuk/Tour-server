const ContactForm = require("../models/ContactForm");
const logger = require("../config/logger");

// Функція додавання нового запису у контактну форму
async function createContactForm(req, res) {
  try {
    const { name, phone_number } = req.body;

    // Перевірка, чи існує запис з таким номером телефону
    const existingContact = await ContactForm.findOne({
      where: { phone_number },
    });

    if (existingContact) {
      // Перевіряємо, чи пройшло 24 години з останнього запиту (за полем created_at)
      const lastSubmittedAt = new Date(existingContact.created_at).getTime();
      const currentTime = Date.now();

      // Якщо не пройшло 24 години
      if (currentTime - lastSubmittedAt < 24 * 60 * 60 * 1000) {
        // Логуємо спробу надсилання до 24 годин
        logger.warn(
          `Користувач з номером телефону ${phone_number} намагався відправити форму до того, як пройшло 24 години.`
        );

        return res.status(429).json({
          error:
            "Ви вже надсилали форму. Будь ласка, зачекайте 24 години перед повторною спробою.",
        });
      }
    }

    // Створюємо новий запис у базі даних
    const newContactForm = await ContactForm.create({
      name,
      phone_number,
    });

    // Логуємо успішне створення запису
    logger.info(
      `Новий запис створено в ContactForm: ${JSON.stringify(newContactForm)}`
    );

    res.status(201).json(newContactForm);
  } catch (error) {
    // Логуємо помилку
    logger.error(
      `Помилка при створенні запису в ContactForm: ${error.message}`
    );

    res
      .status(500)
      .json({ error: "Не вдалося додати запис до контактної форми" });
  }
}

// Функція видалення запису з контактної форми
async function deleteContactForm(req, res) {
  try {
    const { id } = req.params;

    // Пошук і видалення запису
    const result = await ContactForm.destroy({ where: { id } });

    if (result) {
      // Логуємо успішне видалення запису
      logger.info(`Запис з id ${id} видалено з ContactForm`);
      res.status(200).json({ message: "Запис успішно видалено" });
    } else {
      // Логуємо випадок, коли запис не знайдено
      logger.warn(`Запис з id ${id} не знайдено в ContactForm`);
      res.status(404).json({ error: "Запис не знайдено" });
    }
  } catch (error) {
    // Логуємо помилку
    logger.error(
      `Помилка при видаленні запису з ContactForm: ${error.message}`
    );
    res
      .status(500)
      .json({ error: "Не вдалося видалити запис з контактної форми" });
  }
}

module.exports = { createContactForm, deleteContactForm };
