const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

 
const protect = async (req, res, next) => {
  try {
    let token;

    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

 
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
 
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists or is deactivated.",
      });
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please refresh.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

 
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is restricted to: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
