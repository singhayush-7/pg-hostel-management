const { body, param, query, validationResult } = require("express-validator");

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

const VALID_AMENITIES = [
  "WiFi", "AC", "Parking", "CCTV", "Laundry",
  "Food", "Gym", "Power Backup", "Water Purifier", "Security Guard",
];

const propertyValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Property name is required")
    .isLength({ min: 3, max: 100 }).withMessage("Name must be 3–100 characters"),

  body("type")
    .notEmpty().withMessage("Property type is required")
    .customSanitizer(val => val === 'Co-living' ? 'coliving' : val.toLowerCase())
    .isIn(["pg", "hostel", "coliving"]).withMessage("Type must be pg, hostel, or coliving"),

  body("gender")
    .notEmpty().withMessage("Gender preference is required")
    .toLowerCase()
    .isIn(["male", "female", "any"]).withMessage("Gender must be male, female, or any"),

  body("address")
    .trim()
    .notEmpty().withMessage("Address is required"),

  body("city")
    .trim()
    .notEmpty().withMessage("City is required"),

  body("pincode")
    .optional({ checkFalsy: true })
    .matches(/^\d{6}$/).withMessage("Please enter a valid 6-digit pincode"),

  body("amenities")
    .optional()
    .custom((value) => {
      
      let arr;
      if (typeof value === "string") {
        try {
          arr = JSON.parse(value);
        } catch (e) {
          arr = [value];  
        }
      } else {
        arr = value;
      }
      
      if (!Array.isArray(arr)) throw new Error("Amenities must be an array");
      const invalid = arr.filter((a) => !VALID_AMENITIES.includes(a));
      if (invalid.length > 0) throw new Error(`Invalid amenities: ${invalid.join(", ")}`);
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters"),

  validate,
];

 
const propertyIdValidator = [
  param("id").isMongoId().withMessage("Invalid property ID"),
  validate,
];

 
const listPropertiesValidator = [
  query("city").optional().trim(),
  query("area").optional().trim(),
  query("type").optional().isIn(["pg", "hostel", "coliving"]),
  query("gender").optional().isIn(["male", "female", "any"]),
  query("minRent").optional().isNumeric().withMessage("minRent must be a number"),
  query("maxRent").optional().isNumeric().withMessage("maxRent must be a number"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1–50"),
  validate,
];

module.exports = { propertyValidator, propertyIdValidator, listPropertiesValidator };
