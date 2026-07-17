const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JoinRequest",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["Paid"],
      default: "Paid",
    },
    paymentMethod: {
      type: String,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ tenantId: 1 });
paymentSchema.index({ ownerId: 1 });
paymentSchema.index({ propertyId: 1 });
paymentSchema.index({ bookingId: 1 });

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
module.exports = Payment;
