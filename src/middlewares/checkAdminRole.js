// Middleware для перевірки ролі користувача
const checkAdminRole = (req, res, next) => {
  // Отримуємо роль користувача з токена (додано в об'єкт req.user при авторизації)
  const userRole = req.user.role;

  // Якщо роль користувача не є "admin", повертаємо помилку з кодом 403 (заборонено)
  if (userRole !== "admin") {
    return res
      .status(403) // Статус 403 - доступ заборонено
      .json({ message: "Недостатньо прав для цього запиту." }); // Повідомлення про помилку
  }

  // Якщо роль користувача є "admin", передаємо контроль до наступного middleware
  next();
};

module.exports = checkAdminRole;
