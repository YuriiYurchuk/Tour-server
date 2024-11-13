const jwt = require("jsonwebtoken");

// Мідлвар для перевірки валідності токена
const authenticateToken = (req, res, next) => {
  // Отримуємо заголовок авторизації з запиту
  const authHeader = req.headers["authorization"];

  // Витягуємо сам токен з заголовка (формат: "Bearer <token>")
  const token = authHeader ? authHeader.split(" ")[1] : null;

  // Якщо токен відсутній, повертаємо помилку
  if (!token) {
    return res.status(401).json({ message: "Відсутній токен" });
  }

  // Перевіряємо токен за допомогою секретного ключа
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // Якщо токен недійсний або виникла інша помилка
    if (err) {
      return res.status(403).json({ message: "Недійсний токен" });
    }
    req.user = user; // Якщо токен валідний, додаємо дані користувача до об'єкта запиту
    next();
  });
};

module.exports = authenticateToken;
