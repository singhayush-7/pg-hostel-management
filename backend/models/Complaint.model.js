const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  sender: {
    type: String,  
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: Date,
    default: Date.now,
  }
});

const complaintSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    issue: {
      type: String,
      required: [true, "Complaint issue is required"],
      trim: true,
      maxlength: [1000, "Issue cannot exceed 1000 characters"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    replies: [replySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

 
complaintSchema.index({ tenant: 1 });
complaintSchema.index({ owner: 1 });
complaintSchema.index({ property: 1 });

const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
