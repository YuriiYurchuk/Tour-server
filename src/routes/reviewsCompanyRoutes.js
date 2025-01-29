const express = require("express");
const router = express.Router();
const reviewsCompanyController = require("../controllers/reviewsCompanyController");
const authMiddleware = require("../middlewares/authMiddleware");

// Роут для створення нового відгуку
router.post(
  "/create",
  // authMiddleware,
  reviewsCompanyController.createCompanyReview
);

// Роут для отримання відгуків з пагінацією
router.get("/get-reviews", reviewsCompanyController.getCompanyReviews);

// Роут для видалення відгуку
router.delete(
  "/reviews/:id",
  authMiddleware,
  reviewsCompanyController.deleteCompanyReview
);

// Роут для отримання конкретного відгуку, залишеного користувачем
router.get(
  "/reviews/:id",
  authMiddleware,
  reviewsCompanyController.getUserReview
);

router.get("/latest", reviewsCompanyController.getLatestReviews);

module.exports = router;
