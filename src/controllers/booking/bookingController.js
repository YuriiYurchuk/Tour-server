const Booking = require("../../models/Booking");
const BookingChildren = require("../../models/BookingChildren");
const User = require("../../models/User");
const Hotel = require("../../models/Hotel/Hotels");
const RoomType = require("../../models/Hotel/HotelRoomTypes");
const MealType = require("../../models/Hotel/HotelMealTypes");
const logger = require("../../config/logger");
const { sendBookingConfirmationEmail } = require("../../utils/mailer");
const { sendBookingStatusUpdateEmail } = require("../../utils/mailer");
const { Sequelize } = require("sequelize");

const createBooking = async (req, res) => {
  const transaction = await Booking.sequelize.transaction();
  try {
    // Отримання даних з тіла запиту
    const {
      user_id,
      hotel_id,
      room_type_id,
      meal_plan_id,
      total_price,
      start_date,
      end_date,
      number_of_tourists,
      number_of_children,
      departure_airport,
      status,
      children,
    } = req.body;

    // Перевірка, чи є активні бронювання для цього користувача
    logger.info("Перевірка активних бронювань користувача", { user_id });

    const existingBooking = await Booking.findOne({
      where: {
        user_id: user_id,
        [Sequelize.Op.or]: [
          { status: "очікується" },
          { status: "підтверджено" },
        ],
      },
    });

    // Якщо активне бронювання знайдено, відмовляємо у створенні нового
    if (existingBooking) {
      logger.warn("Користувач вже має активне бронювання", {
        user_id,
        booking_id: existingBooking.id,
      });
      return res.status(400).json({
        message:
          "Ви вже маєте активне бронювання. Завершіть або скасуйте його перед створенням нового.",
      });
    }

    logger.info("Початок створення нового бронювання", { user_id, hotel_id });

    // Створення бронювання в базі даних
    const booking = await Booking.create(
      {
        user_id,
        hotel_id,
        room_type_id,
        meal_plan_id,
        total_price,
        start_date,
        end_date,
        number_of_tourists,
        number_of_children,
        departure_airport,
        status,
      },
      { transaction }
    );

    logger.info("Бронювання успішно створено", { booking_id: booking.id });

    // Обробка дітей, якщо вони є в запиті
    if (children && Array.isArray(children)) {
      for (const child of children) {
        await BookingChildren.create(
          {
            booking_id: booking.id,
            age: child.age,
          },
          { transaction }
        );
        logger.info("Дитина додана до бронювання", {
          booking_id: booking.id,
          age: child.age,
        });
      }
    }

    // Одержуємо асоційовані дані готелю та типу кімнати
    const hotel = await Hotel.findByPk(hotel_id);
    const roomType = await RoomType.findByPk(room_type_id);
    const mealType = await MealType.findByPk(meal_plan_id);

    // Перевірка на наявність готелю та типу кімнати
    if (!hotel || !roomType) {
      throw new Error("Не знайдено готель або тип кімнати");
    }

    // Коміт транзакції, що підтверджує зміни в базі даних
    await transaction.commit();

    logger.info("Транзакцію для бронювання успішно зафіксовано", {
      booking_id: booking.id,
    });

    // Отримання даних користувача
    const user = await User.findByPk(user_id);

    // Перевірка, чи існує користувач
    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }

    // Відправлення підтвердження бронювання на email
    await sendBookingConfirmationEmail(
      user,
      booking,
      hotel,
      roomType,
      mealType
    );

    res.status(201).json({
      message: "Бронювання створено успішно",
      booking,
    });
  } catch (error) {
    // Якщо сталася помилка, скасовуємо транзакцію
    if (transaction.finished !== "commit") {
      await transaction.rollback();
    }
    logger.error("Помилка при створенні бронювання", { error: error.message });

    res.status(500).json({
      message: "Не вдалося створити бронювання",
      error: error.message,
    });
  }
};

const changeBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Знаходимо бронювання
    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Бронювання не знайдено." });
    }

    // Оновлюємо статус
    booking.status = status;
    await booking.save();

    // Одержуємо дані користувача
    const user = await User.findByPk(booking.user_id);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    // Відправка повідомлення користувачеві
    await sendBookingStatusUpdateEmail(user, booking);

    res
      .status(200)
      .json({ message: "Статус бронювання успішно оновлено.", booking });
  } catch (error) {
    res.status(500).json({
      message: "Помилка при оновленні статусу.",
      error: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Бронювання не знайдено." });
    }

    booking.status = "скасовано";
    await booking.save();
    res.status(200).json({ message: "Бронювання успішно скасовано.", booking });
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    res.status(500).json({
      message: "Помилка при скасуванні бронювання.",
      error: error.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    logger.info("Отримання бронювань з пагінацією та фільтром");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    const whereClause = status ? { status } : {};

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereClause,
      limit,
      offset,
    });

    logger.info("Бронювання успішно отримано", {
      count,
      page,
      limit,
      status: status || "усі",
    });

    res.status(200).json({
      message: "Список бронювань успішно отримано",
      data: bookings,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error("Помилка при отриманні бронювань", {
      error: error.message,
    });

    res.status(500).json({
      message: "Не вдалося отримати бронювання",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  changeBookingStatus,
  cancelBooking,
  getAllBookings,
};
