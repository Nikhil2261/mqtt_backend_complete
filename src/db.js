import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL missing");
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected");
}
