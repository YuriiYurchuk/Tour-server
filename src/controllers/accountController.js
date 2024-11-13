const User = require("../models/User");
const logger = require("../config/logger");
const { Op } = require("sequelize");

// Функція для м'якого видалення акаунта
async function softDeleteUser(req, res) {
  try {
    const userId = req.user.id; // Отримуємо id користувача із токена
    const user = await User.findByPk(userId); // Пошук користувача в базі даних

    if (!user) {
      // Якщо користувача не знайдено
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    if (user.deleted_at) {
      // Перевірка, чи акаунт вже м'яко видалений
      return res.status(400).json({ message: "Акаунт вже видалений." });
    }

    // Встановлюємо дату видалення та змінюємо статус на неактивний
    user.deleted_at = new Date();
    user.is_active = false;
    await user.save();

    logger.info(`Користувач ${userId} успішно м'яко видалений.`);
    return res.status(200).json({ message: "Акаунт успішно м'яко видалений." });
  } catch (error) {
    // Логування та обробка помилки
    logger.error(`Помилка при м'якому видаленні акаунта: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Помилка при м'якому видаленні акаунта." });
  }
}

// Функція для відновлення акаунта після м'якого видалення
async function restoreUser(req, res) {
  try {
    const userId = req.user.id; // Отримуємо id користувача із токена
    const user = await User.findByPk(userId);

    if (!user) {
      // Якщо користувача не знайдено
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    if (user.is_active === true) {
      // Перевірка, чи акаунт вже активний
      return res.status(400).json({ message: "Акаунт вже активний." });
    }

    // Перевірка на наявність дати видалення
    if (!user.deleted_at) {
      return res
        .status(400)
        .json({ message: "Акаунт не був м'яко видалений." });
    }

    // Відновлюємо акаунт (встановлюємо is_active в true та очищуємо deleted_at)
    user.is_active = true;
    user.deleted_at = null;

    await user.save();

    logger.info(`Користувач ${userId} успішно відновлений.`);
    return res.status(200).json({ message: "Акаунт успішно відновлений." });
  } catch (error) {
    // Логування та обробка помилки
    logger.error(`Помилка при відновленні акаунта: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Помилка при відновленні акаунта." });
  }
}

// Функція для остаточного видалення акаунтів після 30 днів
async function permanentlyDeleteUser() {
  try {
    // Визначаємо порогову дату для видалення (30 днів тому)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30);

    // Знаходимо користувачів, у яких дата видалення більше 30 днів
    const usersToDelete = await User.findAll({
      where: {
        deleted_at: {
          [Op.lt]: thresholdDate, // Дата видалення менше ніж 30 днів тому
        },
        is_active: false, // Лише неактивні акаунти
      },
    });

    // Видаляємо кожного користувача, який відповідає умовам
    for (const user of usersToDelete) {
      await user.destroy();
      logger.info(`Користувач ${user.id} остаточно видалений.`);
    }

    logger.info(`Остаточно видалено ${usersToDelete.length} акаунтів.`);
  } catch (error) {
    // Логування та обробка помилки
    logger.error(
      `Помилка при остаточному видаленні акаунтів: ${error.message}`
    );
  }
}

module.exports = { softDeleteUser, restoreUser, permanentlyDeleteUser };
