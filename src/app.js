require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const moment = require("moment-timezone");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/emailVerification");
const userRoutes = require("./routes/userRoutes");
const subscriberRoutes = require("./routes/subscribersRoutes");

const app = express();

moment.tz.setDefault("Europe/Kiev");

require("./jobs/clearExpiredTokens");
require("./jobs/accountCleanupJob");

app.use(express.static(path.join(__dirname, "templates")));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static("images"));
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/user", userRoutes);
app.use("/api/subscribers", subscriberRoutes);

const PORT = process.env.PORT || 5000;
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущено на порті ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Помилка підключення до бази даних:", error);
  });
