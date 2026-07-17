const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from the API .env file."
      );
    }

    const connection =
      await mongoose.connect(
        process.env.MONGO_URI
      );

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
};

module.exports = connectDatabase;
