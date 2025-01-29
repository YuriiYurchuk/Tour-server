const ContactForm = require("../models/ContactForm");
const logger = require("../config/logger");

const createContactForm = async (req, res) => {
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
          message: "Ви вже надсилали дані. Спробуйте пізніше.",
        });
      } else {
        // Якщо пройшло більше 24 годин, оновлюємо запис
        existingContact.name = name; // Оновлюємо ім'я або інші дані за потребою
        existingContact.created_at = new Date(); // Оновлюємо час останнього запиту

        await existingContact.save();

        logger.info(
          `Запис з номером телефону ${phone_number} оновлено після 24 годин.`
        );

        return res.status(200).json({
          message: "Ваша форма була оновлена після 24 годин.",
          contact: existingContact,
        });
      }
    }

    // Якщо контакт не знайдено, створюємо новий
    const newContactForm = await ContactForm.create({
      name,
      phone_number,
    });

    // Логуємо успішне створення запису
    logger.info(
      `Новий запис створено в ContactForm: ${JSON.stringify(newContactForm)}`
    );

    // Відповідь користувачу з повідомленням
    res.status(201).json({
      message: "Ваші дані успішно надіслано. Дякуємо за звернення!",
      contact: newContactForm,
    });
  } catch (error) {
    // Логуємо помилку
    logger.error(
      `Помилка при створенні запису в ContactForm: ${error.message}`
    );

    res
      .status(500)
      .json({ error: "Не вдалося додати запис до контактної форми" });
  }
};

// Функція видалення запису з контактної форми
const deleteContactForm = async (req, res) => {
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
};

module.exports = { createContactForm, deleteContactForm };
