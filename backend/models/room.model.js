const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    floor: {
      type: Number,
      default: 0,
      min: [0, "Floor cannot be negative"],
    },
    type: {
      type: String,
      enum: ["single", "double", "triple"],
      required: [true, "Room type is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [10, "Capacity cannot exceed 10"],
    },
    availableBeds: {
      type: Number,
      min: [0, "Available beds cannot be negative"],
    },
    rent: {
      type: Number,
      required: [true, "Rent is required"],
      min: [0, "Rent cannot be negative"],
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, "Deposit cannot be negative"],
    },
    isAC: {
      type: Boolean,
      default: false,
    },
    hasAttachedBath: {
      type: Boolean,
      default: false,
    },
    hasWiFi: {
      type: Boolean,
      default: false,
    },
    hasFood: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Room description cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

 
roomSchema.index({ property: 1, status: 1 });
roomSchema.index({ property: 1, roomNumber: 1 }, { unique: true });


roomSchema.pre("save", function () {
  if (this.isNew && this.availableBeds === undefined) {
    this.availableBeds = this.capacity;
  }
});

 
const updatePropertyRoomCount = async function (propertyId) {
  const Room = mongoose.model("Room");
  const Property = mongoose.model("Property");

  const [totalRooms, availableRooms] = await Promise.all([
    Room.countDocuments({ property: propertyId }),
    Room.countDocuments({ property: propertyId, status: "available" }),
  ]);

  await Property.findByIdAndUpdate(propertyId, { totalRooms, availableRooms });
};

roomSchema.post("save", async function () {
  await updatePropertyRoomCount(this.property);
});

roomSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await updatePropertyRoomCount(doc.property);
});

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
module.exports = Room;
