require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const moment = require("moment-timezone");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/emailVerificationRoutes");
const userRoutes = require("./routes/userRoutes");
const subscriberRoutes = require("./routes/subscribersRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewsCompanyRoutes = require("./routes/reviewsCompanyRoutes");
const associationsBooking = require("./models/associationsBooking");
const associationsHotel = require("./models/associationsHotel");
const associationsCompanyReviews = require("./models/associationsCompanyReviews");

const app = express();

associationsBooking(); // Виклик асоціацій моделей пов'язаних з букінгом
associationsHotel(); // Виклик асоціацій моделей пов'язаних з готелем
associationsCompanyReviews();

moment.tz.setDefault("Europe/Kiev");

require("./jobs/clearExpiredTokensCorn");
require("./jobs/accountCleanupCorn");
require("./jobs/updateHotDealsCron");
require("./jobs/bookingStatusCron");

app.use(express.static(path.join(__dirname, "templates")));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/user", userRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewsCompanyRoutes);

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`Сервер запущено на ${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Помилка підключення до бази даних:", error);
  });
