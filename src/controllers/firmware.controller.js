// import Firmware from "../models/Firmware.js";

// export async function registerFirmware(req, res) {

//   const { version, url } = req.body;

//   if (!version || !url) {
//     return res.status(400).json({ error: "version and url required" });
//   }

//   const fw = await Firmware.create({ version, url });

//   res.json({
//     success: true,
//     firmware: fw
//   });
// }

import Firmware from "../models/Firmware.js";

export async function registerFirmware(req, res) {

  try {

    const { version, url } = req.body;

    if (!version || !url) {
      return res.status(400).json({
        error: "version and url required"
      });
    }

    if (!url.startsWith("http")) {
      return res.status(400).json({
        error: "invalid firmware url"
      });
    }

    const exists = await Firmware.findOne({ version });

    if (exists) {
      return res.status(400).json({
        error: "firmware version already exists"
      });
    }

    const fw = await Firmware.create({
      version,
      url
    });

    res.json({
      success: true,
      firmware: fw
    });

  } catch (err) {

    console.error("Firmware register error:", err);

    res.status(500).json({
      error: "server error"
    });

  }

}