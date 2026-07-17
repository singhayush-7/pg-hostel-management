const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    property: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed"],
      default: "Scheduled",
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ owner: 1 });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
module.exports = Task;
