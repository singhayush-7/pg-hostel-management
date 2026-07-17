const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { ALL_ROLES, ROLES } = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,  
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: ROLES.STUDENT,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;  
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Please enter a valid 10-digit Indian phone number",
      },
    },
    avatar: {
      public_id: String,
      url: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

 
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

 
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

 
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

   
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  
  this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;

  return resetToken;  
};

 
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
