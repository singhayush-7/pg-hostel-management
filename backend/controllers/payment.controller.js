const JoinRequest = require("../models/joinRequest.model");
const Payment = require("../models/Payment.model");
const Notification = require("../models/Notification.model");
const { createOrder, verifySignature } = require("../services/razorpay.service");
const { ROLES } = require("../constants/roles");

 
const createPaymentOrder = async (req, res) => {
  try {
    if (req.user.role !== ROLES.STUDENT) {
      return res.status(403).json({ message: "Only tenants can initiate payments." });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    
    const booking = await JoinRequest.findById(bookingId).populate("room");
    
  
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    
    if (booking.tenant.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to this booking." });
    }
    
    if (booking.status !== "Approved") {
      return res.status(400).json({ message: "Invalid booking state. Booking must be Confirmed (Approved) to pay." });
    }
    
    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Payment has already been made for this booking." });
    }

    const amount = booking.room.rent;
    if (!amount) {
      return res.status(400).json({ message: "Room rent not defined." });
    }

   
    const order = await createOrder(amount, booking._id.toString());
 
    res.status(200).json({
      orderId: order.id,
      amount: order.amount / 100,  
      currency: order.currency,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Error in createPaymentOrder:", error);
    res.status(500).json({ message: error.message || "Failed to create payment order." });
  }
};
 
const verifyPaymentSignature = async (req, res) => {
  try {
    const { bookingId, paymentId, orderId, signature } = req.body;

    if (!bookingId || !paymentId || !orderId || !signature) {
      return res.status(400).json({ message: "Missing required payment parameters." });
    }

    
    const isValid = verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
    }

    
    const booking = await JoinRequest.findById(bookingId).populate("room");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Payment has already been recorded." });
    }

    
    const payment = await Payment.create({
      tenantId: booking.tenant,
      ownerId: booking.owner,
      propertyId: booking.property,
      roomId: booking.room._id,
      bookingId: booking._id,
      orderId,
      paymentId,
      amount: booking.room.rent,
      currency: "INR",
      status: "Paid",
      paymentMethod: "Razorpay",
      paidAt: new Date(),
    });

    
    booking.paymentStatus = "Paid";
    booking.paymentId = paymentId;
    booking.orderId = orderId;
    booking.paidAt = new Date();
    await booking.save();

    await Notification.create([
      {
        user: booking.owner,
        title: 'Payment Received',
        message: `Payment of ₹${booking.room.rent} received for Room ${booking.room.roomNumber}.`,
        type: 'success',
        link: '/owner/payments'
      },
      {
        user: booking.tenant,
        title: 'Payment Successful',
        message: `Your payment of ₹${booking.room.rent} was successful.`,
        type: 'success',
        link: '/tenant/payments'
      }
    ]);

    res.status(200).json({
      message: "Payment successfully verified and recorded.",
      payment,
    });
  } catch (error) {
    console.error("Error in verifyPaymentSignature:", error);
    res.status(500).json({ message: "Failed to verify payment." });
  }
};

 
const getPaymentHistory = async (req, res) => {
  try {
    const userRole = req.user.role;
    let query = {};

    if (userRole === ROLES.STUDENT) {
      query.tenantId = req.user.id;
    } else if (userRole === ROLES.OWNER) {
      query.ownerId = req.user.id;
    } else {
      return res.status(403).json({ message: "Unauthorized role for payment history." });
    }

    const payments = await Payment.find(query)
      .populate("propertyId", "name area city")
      .populate("roomId", "roomNumber type")
      .populate("tenantId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error in getPaymentHistory:", error);
    res.status(500).json({ message: "Failed to fetch payment history." });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentSignature,
  getPaymentHistory,
};
