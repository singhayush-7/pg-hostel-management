const mongoose = require("mongoose");

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(
        ` MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}):`,
        error.message
      );
      if (retries >= MAX_RETRIES) {
        console.error(" Max retries reached. Exiting process.");
        process.exit(1);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }
};

module.exports = connectDB;
