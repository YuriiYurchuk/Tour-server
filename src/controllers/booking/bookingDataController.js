const BookingContract = require("../../models/BookingContract");
const BookingServices = require("../../models/BookingServices");
const BookingTourists = require("../../models/BookingTourists");
const Booking = require("../../models/Booking");
const logger = require("../../config/logger");

const createBookingDetails = async (req, res) => {
  const transaction = await Booking.sequelize.transaction();
  let booking_id;

  try {
    booking_id = req.params.booking_id;
    const { contract, services, tourists } = req.body;

    logger.info("Початок створення деталей бронювання", { booking_id });

    // Перевірка наявності бронювання
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      logger.warn("Бронювання не знайдено", { booking_id });
      return res.status(404).json({ message: "Бронювання не знайдено" });
    }

    // Запис контракту
    if (contract) {
      await BookingContract.create(
        {
          booking_id,
          ...contract, // Данні контракту (ім'я, документ тощо)
        },
        { transaction }
      );
      logger.info("Контракт успішно створено", { booking_id });
    }

    // Запис додаткових послуг
    if (services && Array.isArray(services)) {
      for (const service of services) {
        await BookingServices.create(
          {
            booking_id,
            ...service, // Тип послуги, назва тощо
          },
          { transaction }
        );
        logger.info("Послугу додано до бронювання", { booking_id, service });
      }
    }

    // Запис туристів
    if (tourists && Array.isArray(tourists)) {
      for (const tourist of tourists) {
        await BookingTourists.create(
          {
            booking_id,
            ...tourist, // Дані туриста (ім'я, документ тощо)
          },
          { transaction }
        );
        logger.info("Туриста додано до бронювання", { booking_id, tourist });
      }
    }

    await booking.update({ status: "дані заповнено" }, { transaction });

    // Фіксація транзакції
    await transaction.commit();
    logger.info("Деталі бронювання успішно створено", { booking_id });

    res.status(201).json({ message: "Деталі бронювання успішно створено" });
  } catch (error) {
    await transaction.rollback(); // Відкат транзакції у разі помилки
    logger.error("Помилка створення деталей бронювання", {
      booking_id,
      error: error.message,
    });
    res.status(500).json({
      message: "Не вдалося створити деталі бронювання",
      error: error.message,
    });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const { booking_id } = req.params; // Отримуємо ID бронювання з параметрів запиту

    logger.info("Отримання деталей бронювання", { booking_id });

    // Отримання контракту
    const contract = await BookingContract.findOne({
      where: { booking_id },
    });

    // Отримання додаткових послуг
    const services = await BookingServices.findAll({
      where: { booking_id },
    });

    // Отримання туристів
    const tourists = await BookingTourists.findAll({
      where: { booking_id },
    });

    // Перевірка, чи є дані
    if (
      !contract &&
      (!services || services.length === 0) &&
      (!tourists || tourists.length === 0)
    ) {
      logger.warn("Деталі бронювання не знайдено", { booking_id });
      return res.status(404).json({
        message: "Деталі бронювання не знайдено",
      });
    }

    logger.info("Деталі бронювання успішно отримано", { booking_id });

    // Відправлення відповіді з даними
    res.status(200).json({
      message: "Дані бронювання отримано успішно",
      data: {
        contract,
        services,
        tourists,
      },
    });
  } catch (error) {
    logger.error("Помилка при отриманні деталей бронювання", {
      error: error.message,
    });

    res.status(500).json({
      message: "Не вдалося отримати деталі бронювання",
      error: error.message,
    });
  }
};

module.exports = { createBookingDetails, getBookingDetails };
