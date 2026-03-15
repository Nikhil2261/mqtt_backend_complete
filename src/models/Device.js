import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      unique: true,
      required: true
    },

    // 🔐 Factory generated (HASHED)
    deviceToken: {
      type: String,
      required: true
    },

    // 👤 Ownership (null until claimed)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    claimedAt: Date,

    // Runtime state
    online: {
      type: Boolean,
      default: false
    },

    lastSeen: Date,

    // Telemetry snapshot
    states: mongoose.Schema.Types.Mixed,
    fanSpeed: Number,
    firmware: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Device", DeviceSchema);
