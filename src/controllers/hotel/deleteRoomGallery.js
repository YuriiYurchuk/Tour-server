const fs = require("fs");
const path = require("path");
const models = require("../../models/Hotel/models");
const logger = require("../../config/logger");

// Функція для видалення даних, пов'язаних із готелем
const deleteHotelData = async (req, res) => {
  // Початок транзакції для забезпечення цілісності даних
  const transaction = await models.Hotels.sequelize.transaction();
  try {
    // Отримуємо ідентифікатор готелю та список цілей для видалення з запиту
    const { hotelId } = req.params;
    const targets = req.body.targets;

    // Перевіряємо, чи список цілей є валідним
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({
        error: "Список цілей для видалення є порожнім або некоректним",
      });
    }

    logger.info(
      `Запит на видалення кількох даних у готелі (ID: ${hotelId}): ${JSON.stringify(
        targets
      )}`
    );

    // Перевіряємо, чи існує готель із вказаним ID
    const hotel = await models.Hotels.findByPk(hotelId);
    if (!hotel) {
      logger.warn(`Готель з ID ${hotelId} не знайдено`);
      return res.status(404).json({ error: "Готель не знайдено" });
    }

    // Відповідність між типами даних і моделями
    const modelMapping = {
      roomType: models.HotelRoomTypes,
      galleryPhoto: models.HotelGallery,
    };

    // Обробка кожної цілі для видалення
    for (const target of targets) {
      const { targetType, targetId } = target;

      // Перевіряємо, чи є коректна модель для вказаного типу
      const targetModel = modelMapping[targetType];
      if (!targetModel) {
        logger.warn(`Некоректний тип даних для видалення: ${targetType}`);
        throw new Error(`Некоректний тип даних для видалення: ${targetType}`);
      }

      // Шукаємо запис у базі даних
      const record = await targetModel.findOne({
        where: { id: targetId, hotel_id: hotelId },
      });

      if (!record) {
        logger.warn(
          `Запис у ${targetType} з ID ${targetId} для готелю ${hotelId} не знайдено`
        );
        throw new Error(
          `Запис для видалення не знайдено: ${targetType} (ID: ${targetId})`
        );
      }

      // Видалення пов'язаних файлів, якщо вони існують
      if (targetType === "galleryPhoto" && record.photo_url) {
        const filePath = path.join(
          __dirname,
          "../../uploads/gallery",
          path.basename(record.photo_url)
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`Файл галереї ${filePath} успішно видалено з сервера`);
        } else {
          logger.warn(`Файл галереї ${filePath} не знайдено на сервері`);
        }
      } else if (targetType === "roomType" && record.photo_url) {
        const filePath = path.join(
          __dirname,
          "../../uploads/room_types",
          path.basename(record.photo_url)
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`Фото кімнати ${filePath} успішно видалено з сервера`);
        } else {
          logger.warn(`Фото кімнати ${filePath} не знайдено на сервері`);
        }
      }

      // Видалення запису з бази даних
      await record.destroy({ transaction });
      logger.info(
        `Запис у ${targetType} (ID: ${targetId}) для готелю ${hotelId} успішно видалено`
      );
    }

    // Оновлюємо головне фото готелю, якщо воно є
    const remainingPhotos = await models.HotelGallery.findAll({
      where: { hotel_id: hotelId },
      order: [["created_at", "ASC"]],
    });

    if (remainingPhotos.length > 0) {
      await models.Hotels.update(
        { hotel_photos: remainingPhotos[0].photo_url },
        { where: { id: hotelId }, transaction }
      );
    } else {
      await models.Hotels.update(
        { hotel_photos: null },
        { where: { id: hotelId }, transaction }
      );
    }

    // Фіксуємо транзакцію
    await transaction.commit();
    res.status(200).json({
      message: "Усі вказані дані успішно видалено",
    });
  } catch (error) {
    // У разі помилки відміняємо транзакцію
    await transaction.rollback();
    logger.error(
      `Помилка видалення даних у готелі (ID: ${hotelId}): ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
};

module.exports = { deleteHotelData };
