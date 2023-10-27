const mongoose = require("mongoose");

// Environment variables
const connectionString =
  process.env.MONGODB_CONNECTION_STRING ||
  "mongodb+srv://eazyrooms:wXcsfLhPOlBOZVnV@serverlessinstance0.yizghsf.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

// Disconnect from MongoDB
async function disconnectFromMongoDB() {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Failed to disconnect from MongoDB", error);
  }
}

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB,
};
