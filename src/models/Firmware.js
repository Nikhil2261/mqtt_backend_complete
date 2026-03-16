// import mongoose from "mongoose";

// const firmwareSchema = new mongoose.Schema({
//   version: { type: String, required: true, unique: true },
//   url: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("Firmware", firmwareSchema);


import mongoose from "mongoose";

const firmwareSchema = new mongoose.Schema({

  version: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  url: {
    type: String,
    required: true
  },

  size: Number,

  checksum: String,

  platform: {
    type: String,
    default: "esp32"
  },

  active: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Firmware", firmwareSchema);