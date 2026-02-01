

 import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, unique: true, required: true },

    // 🔥 Ownership
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // 🔐 Factory token (hashed recommended later)
    deviceToken: { type: String, required: true },

    claimedAt: Date,

    // Live state
    online: { type: Boolean, default: false },
    lastSeen: Date,

    // Telemetry snapshot
    states: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Device", DeviceSchema);


