const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    documents: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const JoinRequest = mongoose.models.JoinRequest || mongoose.model('JoinRequest', joinRequestSchema);
module.exports = JoinRequest;
