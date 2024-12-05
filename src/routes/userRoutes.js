const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const accountController = require("../controllers/accountController");
const contactController = require("../controllers/contactFormController");
const authenticateToken = require("../middlewares/authMiddleware");
const checkAdminRole = require("../middlewares/checkAdminRole");
const checkManagerRole = require("../middlewares/checkManagerRole");
const upload = require("../config/multer");

// Маршрут для оновлення даних користувача
router.put(
  "/update",
  authenticateToken,
  upload.single("avatar"),
  userController.updateUser
);

// Маршрут для отримання всіх користувачів (лише для адміна)
router.get("/all", authenticateToken, checkAdminRole, userController.getUsers);

// Маршрут для зміни ролі користувача (лише для адміна)
router.put(
  "/role",
  authenticateToken,
  checkAdminRole,
  userController.updateUserRole
);

// Маршрут для м'якого видалення акаунта
router.post(
  "/soft-delete",
  authenticateToken,
  accountController.softDeleteUser
);

// Маршрут для відновлення акаунта
router.post("/restore", authenticateToken, accountController.restoreUser);

// Маршрут для контактної форми
router.post("/contact", contactController.createContactForm);

// Маршрут для видалення даних з контактної форми
router.post(
  "/delete-contact",
  authenticateToken,
  checkManagerRole,
  contactController.deleteContactForm
);

module.exports = router;
