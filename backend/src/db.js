const mongoose = require("mongoose");
const { config } = require("./config");

async function connectDB() {
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB connected");
}

module.exports = connectDB;