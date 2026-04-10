import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
{
  deviceId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },

  deviceToken: {
    type: String,
    required: true,
    minlength: 32
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  claimedAt: Date,

  online: {
    type: Boolean,
    default: false,
    index: true
  },

  lastSeen: Date,

  // states: mongoose.Schema.Types.Mixed,

  fanSpeed: Number,

 states: [
  {
    type: {
      type: String   // "switch" | "fan"
    },
    pin: Number,
    status: String,
    relay: String,
    speed: Number
  }
],

  firmware: {
    type: String,
    index: true
  },

  ota: {
    status: {
      type: String,
      enum: ["idle","pending","updating","failed"],
      default: "idle"
    },
    lastAttempt: Date
  }

},
{
  timestamps: true
}
);

export default mongoose.model("Device", DeviceSchema);