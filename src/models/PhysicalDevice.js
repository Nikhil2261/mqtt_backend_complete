import mongoose from "mongoose";

const physicalDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },

  deviceToken: {
    type: String,
    required: true
  },

  claimed: {
    type: Boolean,
    default: false
  },

  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("PhysicalDevice", physicalDeviceSchema);


