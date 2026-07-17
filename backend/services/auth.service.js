const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");
const { generateTokenPair } = require("../utils/generateToken");

 
const register = async ({ name, email, password, role, phone }) => {
  
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

 
  const user = await User.create({ name, email, password, role, phone });

   
  const tokens = generateTokenPair(user);

  
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeObject(), ...tokens };
};

 
const login = async ({ email, password }) => {
  
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account has been deactivated. Please contact support.");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokenPair(user);

  
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeObject(), ...tokens };
};

 
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

 
const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    const error = new Error("Refresh token missing");
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== incomingRefreshToken) {
    const error = new Error("Refresh token has been revoked");
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeObject(), ...tokens };
};

 
const forgotPassword = async (email, resetUrlBase) => {
  const user = await User.findOne({ email });

   
  if (!user) return;

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${resetUrlBase}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0F172A; color: #F1F5F9; border-radius: 12px;">
      <h1 style="color: #6366F1; font-size: 28px; margin-bottom: 8px;">SmartStay</h1>
      <h2 style="font-size: 20px; margin-bottom: 16px;">Reset Your Password</h2>
      <p style="color: #94A3B8; margin-bottom: 24px;">
        You requested a password reset. Click the button below to set a new password.
        This link expires in <strong style="color: #F59E0B;">10 minutes</strong>.
      </p>
      <a href="${resetUrl}" 
         style="display: inline-block; background: #6366F1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
      <p style="color: #94A3B8; margin-top: 24px; font-size: 14px;">
        If you didn't request this, please ignore this email. Your password won't change.
      </p>
      <hr style="border: 1px solid #1E293B; margin: 24px 0;" />
      <p style="color: #475569; font-size: 12px;">
        Or copy this URL: <a href="${resetUrl}" style="color: #6366F1;">${resetUrl}</a>
      </p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: "SmartStay – Password Reset Request",
    html,
  });
};


const resetPassword = async (token, newPassword) => {
  
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpiry");

  if (!user) {
    const error = new Error("Password reset token is invalid or has expired");
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  user.refreshToken = undefined;  
  await user.save();

  return user.toSafeObject();
};

 
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeObject();
};


const updateProfile = async (userId, updates) => {
  const allowedFields = ["name", "phone"];
  const filteredUpdates = {};
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) filteredUpdates[field] = updates[field];
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: filteredUpdates },
    { new: true, runValidators: true }
  );

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user.toSafeObject();
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
};
