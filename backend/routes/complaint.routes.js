const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
  createComplaint,
  getComplaints,
  updateComplaint,
} = require("../controllers/complaint.controller");

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createComplaint)
  .get(getComplaints);

router.route("/:id")
  .patch(updateComplaint);

module.exports = router;
