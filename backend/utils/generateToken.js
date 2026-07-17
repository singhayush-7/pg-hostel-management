const jwt = require("jsonwebtoken");

 
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

 
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

 
const generateTokenPair = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
  };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

module.exports = { generateAccessToken, generateRefreshToken, generateTokenPair };
