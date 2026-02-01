import mongoose from "mongoose";

const CommandSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    cmdId: { type: String, required: true },

    // IMPORTANT: top-level type
    type: { type: String, required: true }, // "switch" | "fan" | "ota"

    command: { type: Object }, // raw payload

    status: {
      type: String,
      enum: ["pending", "done", "failed"],
      default: "pending"
    },

    ackAt: Date,
    failedAt: Date,
    failedReason: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Command", CommandSchema);
