const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,  
    }
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
module.exports = Notification;
