const express = require("express");
const router = express.Router();
const emailVerificationController = require("../controllers/emailVerificationController");

// Маршрут для підтвердження електронної пошти користувача
router.get("/verify-email", emailVerificationController.verifyEmail);

// Маршрут для повторного надсилання листа з підтвердженням електронної пошти
router.post(
  "/resend-verification-email",
  emailVerificationController.resendVerificationEmail
);

module.exports = router;
