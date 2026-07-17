const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getOwnerDashboard } = require("../controllers/dashboard.controller");

const router = express.Router();

router.use(protect);

router.get("/owner", getOwnerDashboard);

module.exports = router;
