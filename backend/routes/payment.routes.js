const express = require("express");
const router = express.Router();
const { createPaymentOrder, verifyPaymentSignature, getPaymentHistory } = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");

 
router.use(protect);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPaymentSignature);
router.get("/history", getPaymentHistory);

module.exports = router;
