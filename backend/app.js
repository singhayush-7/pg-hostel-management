const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const { propertyRouter, roomsRouter } = require("./routes/property.routes");
const joinRequestRoutes = require("./routes/joinRequest.routes");
const complaintRoutes = require("./routes/complaint.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const taskRoutes = require("./routes/task.routes");
const paymentRoutes = require("./routes/payment.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();
 
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,  
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
 
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
 
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
 
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SmartStay API is running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

 
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/checkout", checkoutRoutes);
 
app.use(notFound);
app.use(errorHandler);

module.exports = app;
