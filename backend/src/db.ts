import mongoose from "mongoose";
import { config } from "./config.ts";

async function connectDB() {
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB connected");
}

export default connectDB
