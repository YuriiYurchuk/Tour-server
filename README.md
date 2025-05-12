# **Tour-server**

_Backend API for the Tour Booking web application._

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue?style=flat-square&logo=postgresql)
![Sequelize](https://img.shields.io/badge/Sequelize-6.x-00BFFF?style=flat-square&logo=sequelize)
![JWT](https://img.shields.io/badge/JWT-auth-blueviolet?style=flat-square)
![Cron](https://img.shields.io/badge/Cron-jobs-orange?style=flat-square)
![Multer](https://img.shields.io/badge/File%20Upload-Multer-yellow?style=flat-square)

---

## 🌍 Overview

This is the **server-side** of the tour booking application. It provides APIs for:

- User authentication and email verification
- Hotel and tour booking management
- User profile and subscription
- Reviews and ratings
- File upload handling (e.g., images)
- Cron jobs for automatic cleanup and data updates

---

## 🛠️ Technologies Used

- **Node.js + Express.js**
- **PostgreSQL** with Sequelize ORM
- **JWT** for authentication
- **Nodemailer** for email confirmation
- **Multer** for file uploads
- **Moment-timezone** for time management
- **Node-cron** for scheduled jobs
- **CORS**, **cookie-parser**, **dotenv**, and more

---

## 🧩 API Routes

- `/api/auth` – Registration, login, token handling
- `/api/email` – Email verification logic
- `/api/user` – User data (profile, avatar, etc.)
- `/api/subscribers` – Newsletter/email list management
- `/api/hotel` – Hotels
- `/api/bookings` – Booking flow logic
- `/api/reviews` – Reviews about the company

Uploads are served from `/uploads`.

---

## 🔁 Cron Jobs

These tasks run automatically in the background:

- `clearExpiredTokensCorn` – Removes expired tokens
- `accountCleanupCorn` – Deletes unverified/unused accounts
- `updateHotDealsCron` – Updates hot tour deals
- `bookingStatusCron` – Updates booking statuses based on time

---

## 📦 Installation

```bash
git clone https://github.com/YuriiYurchuk/Tour-server
cd Tour-server
npm install
npm run dev
```
