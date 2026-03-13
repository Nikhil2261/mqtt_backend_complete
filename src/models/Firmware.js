import mongoose from "mongoose";

const firmwareSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Firmware", firmwareSchema);