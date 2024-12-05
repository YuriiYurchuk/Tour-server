const multer = require("multer");
const path = require("path");

// Налаштування сховища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    // Вибір папки залежно від поля
    switch (file.fieldname) {
      case "avatar":
        uploadPath = path.join(__dirname, "../../uploads/avatars");
        break;
      case "gallery":
        uploadPath = path.join(__dirname, "../../uploads/gallery");
        break;
      case "roomType":
        uploadPath = path.join(__dirname, "../../uploads/room_types");
        break;
      default:
        uploadPath = path.join(__dirname, "../../uploads/others");
        break;
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Фільтр для перевірки типів файлів
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Недопустимий тип файлу. Дозволені формати: JPEG, PNG, JPG."),
      false
    );
  }
};

// Завантажувач
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Обмеження розміру: 5MB
});

module.exports = upload;
