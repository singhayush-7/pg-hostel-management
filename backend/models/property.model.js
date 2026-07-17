const mongoose = require("mongoose");

const AMENITIES = [
  "WiFi", "AC", "Parking", "CCTV", "Laundry",
  "Food", "Gym", "Power Backup", "Water Purifier", "Security Guard",
];

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: ["pg", "hostel", "coliving"],
      required: [true, "Property type is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "any"],
      required: [true, "Gender preference is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amenities: {
      type: [String],
      enum: AMENITIES,
      default: [],
    },
    photos: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    
    totalRooms: {
      type: Number,
      default: 0,
    },
    availableRooms: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

 
propertySchema.index({ owner: 1 });
propertySchema.index({ city: 1, isActive: 1 });
propertySchema.index({ type: 1, gender: 1 });


propertySchema.virtual("typeLabel").get(function () {
  const map = { pg: "PG", hostel: "Hostel", coliving: "Co-Living" };
  return map[this.type] || this.type;
});

const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);
module.exports = Property;
