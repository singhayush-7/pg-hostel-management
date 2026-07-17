const Razorpay = require("razorpay");
const crypto = require("crypto");

 
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_key_secret",
});

/**
 * Create a new Razorpay order
 * @param {number} amount Amount in INR
 * @param {string} receipt Receipt ID (Booking ID usually)
 * @returns {Promise<Object>} Razorpay Order Object
 */
const createOrder = async (amount, receipt) => {
  try {
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt,
      notes: {
        bookingId: receipt,
      },
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Razorpay Order Creation Failed: ${error.message}`);
  }
};

/**
 * Verify Razorpay payment signature securely
 * @param {string} orderId Razorpay Order ID
 * @param {string} paymentId Razorpay Payment ID
 * @param {string} signature Razorpay Signature from frontend
 * @returns {boolean} True if valid, False otherwise
 */
const verifySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_key_secret";
  
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};

module.exports = {
  createOrder,
  verifySignature,
};
