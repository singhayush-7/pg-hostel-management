 
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

 
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists`;
    statusCode = 409;
  }

  
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

 
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = 401;
  }

  
  if (process.env.NODE_ENV === "development") {
    console.error(" Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
 
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
