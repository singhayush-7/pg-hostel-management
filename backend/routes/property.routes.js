const express = require("express");
const router = express.Router();

const propertyController = require("../controllers/property.controller");
const roomController = require("../controllers/room.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { handlePropertyUpload, handleRoomUpload } = require("../middleware/upload.middleware");
const { propertyValidator, propertyIdValidator, listPropertiesValidator } = require("../validators/property.validator");
const { roomValidator, roomIdValidator } = require("../validators/room.validator");
const { ROLES } = require("../constants/roles");


router.get("/", listPropertiesValidator, propertyController.getAllProperties);
router.get("/my", protect, authorize(ROLES.OWNER), propertyController.getMyProperties);
router.get("/:id", propertyController.getPropertyById);
 
router.post(
  "/",
  protect,
  authorize(ROLES.OWNER),
  handlePropertyUpload,
  propertyValidator,
  propertyController.createProperty
);

router.put(
  "/:id",
  protect,
  authorize(ROLES.OWNER),
  handlePropertyUpload,
  propertyValidator,
  propertyController.updateProperty
);

router.delete(
  "/:id",
  protect,
  authorize(ROLES.OWNER),
  propertyIdValidator,
  propertyController.deleteProperty
);

 
router.get("/:propertyId/rooms", roomController.getRoomsByProperty);

router.post(
  "/:propertyId/rooms",
  protect,
  authorize(ROLES.OWNER),
  handleRoomUpload,
  roomValidator,
  roomController.createRoom
);

 
const roomsRouter = express.Router();

roomsRouter.get("/:roomId", roomController.getRoomById);

roomsRouter.put(
  "/:roomId",
  protect,
  authorize(ROLES.OWNER),
  handleRoomUpload,
  roomValidator,
  roomController.updateRoom
);

roomsRouter.delete(
  "/:roomId",
  protect,
  authorize(ROLES.OWNER),
  roomIdValidator,
  roomController.deleteRoom
);

module.exports = { propertyRouter: router, roomsRouter };
