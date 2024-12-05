const models = require("../../models/Hotel/models");
const logger = require("../../config/logger");
const fs = require("fs").promises;
const path = require("path");

// Функція для оновлення даних готелю
const updateHotel = async (req, res) => {
  const transaction = await models.Hotels.sequelize.transaction();
  try {
    const hotelId = req.params.hotelId;
    const hotel = await models.Hotels.findByPk(hotelId);

    if (!hotel) {
      return res.status(404).json({ error: "Готель не знайдено" });
    }

    const {
      name,
      country,
      star_rating,
      description,
      is_hot_deal,
      tour_start_date,
      tour_end_date,
      tour_price,
      average_rating,
      review_count,
      included_meal_types,
      season,
      location,
      amenities,
      meals,
      services,
      kids,
      pools,
      spas,
      beach,
      activities,
      restaurants,
      surroundings,
      contact,
      airportDistance,
      generalInfo,
      communication,
      roomTypes,
    } = req.body;

    // Функція для парсингу JSON
    const parseJson = (data) => {
      try {
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch (error) {
        logger.error(`Помилка парсингу JSON: ${error.message}`);
        return [];
      }
    };

    // Оновлення основних даних готелю
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (country !== undefined) updateData.country = country;
    if (star_rating !== undefined) updateData.star_rating = star_rating;
    if (description !== undefined) updateData.description = description;
    if (is_hot_deal !== undefined) updateData.is_hot_deal = is_hot_deal;
    if (tour_start_date !== undefined)
      updateData.tour_start_date = tour_start_date;
    if (tour_end_date !== undefined) updateData.tour_end_date = tour_end_date;
    if (tour_price !== undefined) updateData.tour_price = tour_price;
    if (average_rating !== undefined)
      updateData.average_rating = average_rating;
    if (review_count !== undefined) updateData.review_count = review_count;
    if (included_meal_types !== undefined)
      updateData.included_meal_types = included_meal_types;
    if (season !== undefined) updateData.season = season;

    if (Object.keys(updateData).length > 0) {
      await hotel.update(updateData, { transaction });
    }

    // Функція для оновлення асоціацій
    const updateAssociations = async (
      model,
      data,
      transformFn,
      errorMessage
    ) => {
      if (data !== undefined) {
        await model.destroy({ where: { hotel_id: hotelId }, transaction });
        if (data?.length > 0) {
          await model.bulkCreate(transformFn(data), { transaction });
        }
      }
    };

    // Оновлення асоціацій
    const simpleAssociations = [
      {
        model: models.HotelAmenities,
        data: parseJson(amenities),
        errorMessage: "Помилка при оновленні зручностей",
      },
      {
        model: models.HotelServices,
        data: parseJson(services),
        errorMessage: "Помилка при оновленні сервісів",
      },
      {
        model: models.HotelKids,
        data: parseJson(kids),
        errorMessage: "Помилка при оновленні дитячих послуг",
      },
      {
        model: models.HotelPools,
        data: parseJson(pools),
        errorMessage: "Помилка при оновленні басейнів",
      },
      {
        model: models.HotelSpas,
        data: parseJson(spas),
        errorMessage: "Помилка при оновленні СПА",
      },
      {
        model: models.HotelBeach,
        data: parseJson(beach),
        errorMessage: "Помилка при оновленні пляжу",
      },
      {
        model: models.HotelActivity,
        data: parseJson(activities),
        errorMessage: "Помилка при оновленні активностей",
      },
      {
        model: models.HotelRestaurants,
        data: parseJson(restaurants),
        errorMessage: "Помилка при оновленні ресторанів",
      },
      {
        model: models.HotelSurroundings,
        data: parseJson(surroundings),
        errorMessage: "Помилка при оновленні довколишніх об'єктів",
      },
      {
        model: models.HotelGeneral,
        data: parseJson(generalInfo),
        errorMessage: "Помилка при оновленні загальної інформації",
      },
      {
        model: models.HotelCommunication,
        data: parseJson(communication),
        errorMessage: "Помилка при оновленні комунікацій",
      },
      {
        model: models.HotelContact,
        data: parseJson(contact),
        errorMessage: "Помилка при оновленні контактної інформації",
      },
      {
        model: models.HotelAirportDistance,
        data: parseJson(airportDistance),
        errorMessage: "Помилка при оновленні відстаней до аеропорту",
      },
    ];

    // Оновлення асоціацій
    for (const { model, data, errorMessage } of simpleAssociations) {
      await updateAssociations(
        model,
        data,
        (array) => array.map((item) => ({ hotel_id: hotelId, ...item })),
        errorMessage
      );
    }

    // Оновлення локації
    if (location !== undefined) {
      const { latitude, longitude } = parseJson(location);
      if (latitude && longitude) {
        await models.HotelLocation.upsert(
          { hotel_id: hotelId, latitude, longitude },
          { transaction }
        );
      } else {
        logger.warn("Широта та довгота відсутні або некоректні");
      }
    }

    // Оновлення харчування
    if (meals !== undefined) {
      for (const meal of meals.entries()) {
        const mealId = meal.id;

        if (mealId) {
          const existingMeal = await models.HotelMealTypes.findOne({
            where: { id: mealId, hotel_id: hotelId },
          });

          if (existingMeal) {
            const updateMealData = {};
            if (meal.type_name !== undefined)
              updateMealData.type_name = meal.type_name;
            if (meal.description !== undefined)
              updateMealData.description = meal.description;
            if (meal.price !== undefined) updateMealData.price = meal.price;

            await existingMeal.update(updateMealData, { transaction });
            logger.info(`Оновлено тип харчування з ID: ${mealId}`);
          } else {
            logger.warn(`Тип харчування з ID: ${mealId} не знайдено`);
          }
        } else {
          const newMeal = {
            hotel_id: hotelId,
            type_name: meal.type_name,
            description: meal.description,
            price: meal.price,
          };

          await models.HotelMealTypes.create(newMeal, { transaction });
          logger.info(`Додано новий тип харчування: ${newMeal.name}`);
        }
      }
    }

    // Оновлення кімнат
    if (roomTypes !== undefined) {
      for (const [index, room] of roomTypes.entries()) {
        const roomId = room.id;
        const amenities = parseJson(room.amenities || []);

        if (roomId) {
          const existingRoom = await models.HotelRoomTypes.findOne({
            where: { id: roomId, hotel_id: hotelId },
          });

          if (existingRoom) {
            const updateRoomData = {};
            if (room.name !== undefined) updateRoomData.name = room.name;
            if (room.capacity !== undefined)
              updateRoomData.capacity = room.capacity;
            if (room.price !== undefined) updateRoomData.price = room.price;
            if (room.amenities !== undefined) {
              updateRoomData.amenities = amenities;
            }

            // Оновлення фото кімнати
            if (req.files?.roomType?.[index]) {
              const oldPhotoUrl = existingRoom.photo_url;

              updateRoomData.photo_url = `/uploads/room_types/${req.files.roomType[index].filename}`;

              if (oldPhotoUrl) {
                const oldPhotoPath = path.join(
                  __dirname,
                  "../../../uploads/room_types",
                  oldPhotoUrl.split("/uploads/room_types/")[1]
                );

                try {
                  await fs.access(oldPhotoPath, fs.constants.F_OK);

                  await fs.unlink(oldPhotoPath);
                  logger.info(`Старе фото видалено: ${oldPhotoPath}`);
                } catch (error) {
                  if (error.code === "ENOENT") {
                    logger.warn(`Файл не знайдений: ${oldPhotoPath}`);
                  } else {
                    logger.warn(
                      `Не вдалося видалити фото: ${oldPhotoPath}. Помилка: ${error.message}`
                    );
                  }
                }
              }
            }

            await existingRoom.update(updateRoomData, { transaction });
            logger.info(`Оновлено тип кімнати з ID: ${roomId}`);
          } else {
            logger.warn(`Тип кімнати з ID: ${roomId} не знайдено`);
          }
        } else {
          const newRoom = {
            hotel_id: hotelId,
            name: room.name,
            capacity: room.capacity,
            price: room.price,
            amenities: amenities,
            photo_url: req.files?.roomType?.[index]
              ? `/uploads/room_types/${req.files.roomType[index].filename}`
              : null,
          };

          await models.HotelRoomTypes.create(newRoom, { transaction });
          logger.info(`Додано новий тип кімнати: ${newRoom.name}`);
        }
      }
    }

    // Оновлення галереї
    if (req.files?.gallery) {
      const galleryDescriptions = parseJson(req.body.galleryDescriptions || []);
      await models.HotelGallery.bulkCreate(
        req.files.gallery.map((file, index) => ({
          hotel_id: hotelId,
          photo_url: `/uploads/gallery/${file.filename}`,
          description: galleryDescriptions[index],
        })),
        { transaction }
      );
    }

    // Завершення транзакції
    await transaction.commit();
    res.status(200).json({ message: "Готель успішно оновлено" });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: "Не вдалося оновити готель", details: error.message });
  }
};

module.exports = { updateHotel };
