const fs = require("fs");
const path = require("path");
const models = require("../../models/Hotel/models");
const logger = require("../../config/logger");

// Функція для видалення готелю
const deleteHotel = async (req, res) => {
  const { hotelId } = req.params;

  // Ініціалізація транзакції
  const transaction = await models.Hotels.sequelize.transaction();
  try {
    // Перевіряємо, чи існує готель
    const hotel = await models.Hotels.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Готель не знайдено" });
    }

    // Логування початку процесу видалення
    logger.info(`Початок видалення готелю з ID: ${hotelId}`);

    // Функція для видалення файлів з диску
    const deleteFiles = (filePaths) => {
      filePaths.forEach((filePath) => {
        const absolutePath = path.join(process.cwd(), filePath);

        // Логування спроби видалення файлу
        logger.info(`Спроба видалення файлу: ${absolutePath}`);

        if (fs.existsSync(absolutePath)) {
          fs.unlink(absolutePath, (err) => {
            if (err) {
              logger.error(
                `Помилка видалення файлу ${absolutePath}: ${err.message}`
              );
            } else {
              logger.info(`Файл успішно видалено: ${absolutePath}`);
            }
          });
        } else {
          logger.warn(`Файл не знайдено: ${absolutePath}`);
        }
      });
    };

    // Видалення файлів галереї
    const gallery = await models.HotelGallery.findAll({
      where: { hotel_id: hotelId },
    });
    const galleryPaths = gallery.map((item) => item.photo_url);
    deleteFiles(galleryPaths);
    await models.HotelGallery.destroy({
      where: { hotel_id: hotelId },
      transaction,
    });

    // Видалення файлів типів кімнат
    const roomTypes = await models.HotelRoomTypes.findAll({
      where: { hotel_id: hotelId },
    });
    const roomTypePaths = roomTypes.map((item) => item.photo_url);
    deleteFiles(roomTypePaths);
    await models.HotelRoomTypes.destroy({
      where: { hotel_id: hotelId },
      transaction,
    });

    // Список моделей, які пов'язані з готелем
    const relatedModels = [
      models.HotelAmenities,
      models.HotelServices,
      models.HotelKids,
      models.HotelPools,
      models.HotelSpas,
      models.HotelBeach,
      models.HotelActivity,
      models.HotelRestaurants,
      models.HotelSurroundings,
      models.HotelGeneral,
      models.HotelCommunication,
      models.HotelContact,
      models.HotelAirportDistance,
      models.HotelMealTypes,
      models.HotelLocation,
      models.HotelReview,
      models.AverageRating,
    ];

    // Видалення даних з усіх пов'язаних моделей
    for (const model of relatedModels) {
      await model.destroy({ where: { hotel_id: hotelId }, transaction });
    }

    // Видалення самого готелю
    await models.Hotels.destroy({ where: { id: hotelId }, transaction });

    // Підтвердження успішного завершення операції
    await transaction.commit();
    logger.info(`Готель з ID: ${hotelId} успішно видалено`);
    res.status(200).json({ message: "Готель успішно видалено" });
  } catch (error) {
    // В разі помилки, скасовуємо транзакцію
    await transaction.rollback();
    logger.error(`Помилка видалення готелю: ${error.message}`);
    res
      .status(500)
      .json({ error: "Не вдалося видалити готель", details: error.message });
  }
};

module.exports = { deleteHotel };
