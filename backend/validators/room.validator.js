const { body, param, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

 
const roomValidator = [
  body("roomNumber")
    .trim()
    .notEmpty().withMessage("Room number is required"),

  body("floor")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage("Floor must be a non-negative integer"),

  body("type")
    .notEmpty().withMessage("Room type is required")
    .toLowerCase()
    .isIn(["single", "double", "triple"]).withMessage("Type must be single, double, or triple"),

  body("capacity")
    .notEmpty().withMessage("Capacity is required")
    .isInt({ min: 1, max: 10 }).withMessage("Capacity must be between 1 and 10"),

  body("rent")
    .notEmpty().withMessage("Rent is required")
    .isNumeric().withMessage("Rent must be a number")
    .custom((v) => parseFloat(v) >= 0).withMessage("Rent cannot be negative"),

  body("deposit")
    .optional({ checkFalsy: true })
    .isNumeric().withMessage("Deposit must be a number")
    .custom((v) => parseFloat(v) >= 0).withMessage("Deposit cannot be negative"),

  body("isAC")
    .optional()
    .isIn(["true", "false", true, false]).withMessage("isAC must be boolean"),

  body("hasAttachedBath")
    .optional()
    .isIn(["true", "false", true, false]).withMessage("hasAttachedBath must be boolean"),

  body("hasWiFi")
    .optional()
    .isIn(["true", "false", true, false]).withMessage("hasWiFi must be boolean"),

  body("hasFood")
    .optional()
    .isIn(["true", "false", true, false]).withMessage("hasFood must be boolean"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),

  validate,
];
 
const roomIdValidator = [
  param("roomId").isMongoId().withMessage("Invalid room ID"),
  validate,
];

module.exports = { roomValidator, roomIdValidator };
