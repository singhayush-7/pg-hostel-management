const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { ROLES } = require("../constants/roles");

router.use(protect);
router.use(authorize(ROLES.OWNER));

router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.patch("/:id", taskController.updateTask);

module.exports = router;
