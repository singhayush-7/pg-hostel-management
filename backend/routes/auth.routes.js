const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
} = require("../validators/auth.validator");

 
router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", forgotPasswordValidator, authController.forgotPassword);
router.put("/reset-password/:token", resetPasswordValidator, authController.resetPassword);
 
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);
router.put("/update-profile", protect, updateProfileValidator, authController.updateProfile);

module.exports = router;
