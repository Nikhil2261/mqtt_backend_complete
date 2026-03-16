// // import Firmware from "../models/Firmware.js";

// // export async function registerFirmware(req, res) {

// //   const { version, url } = req.body;

// //   if (!version || !url) {
// //     return res.status(400).json({ error: "version and url required" });
// //   }

// //   const fw = await Firmware.create({ version, url });

// //   res.json({
// //     success: true,
// //     firmware: fw
// //   });
// // }

// import Firmware from "../models/Firmware.js";

// export async function registerFirmware(req, res) {

//   try {

//     const { version, url } = req.body;

//     if (!version || !url) {
//       return res.status(400).json({
//         error: "version and url required"
//       });
//     }

//     if (!url.startsWith("http")) {
//       return res.status(400).json({
//         error: "invalid firmware url"
//       });
//     }

//     const exists = await Firmware.findOne({ version });

//     if (exists) {
//       return res.status(400).json({
//         error: "firmware version already exists"
//       });
//     }

//     const fw = await Firmware.create({
//       version,
//       url
//     });

//     res.json({
//       success: true,
//       firmware: fw
//     });

//   } catch (err) {

//     console.error("Firmware register error:", err);

//     res.status(500).json({
//       error: "server error"
//     });

//   }

// }  

import Firmware from "../models/Firmware.js";

/* REGISTER FIRMWARE */

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


/* LIST FIRMWARES */

export async function listFirmwares(req, res) {

  try {

    const list = await Firmware
      .find()
      .sort({ createdAt: -1 });

    res.json(list);

  } catch (err) {

    res.status(500).json({
      error: "server error"
    });

  }

}


/* GET LATEST FIRMWARE */

export async function getLatestFirmware(req, res) {

  try {

    const latest = await Firmware
      .findOne({ active: true })
      .sort({ createdAt: -1 });

    if (!latest) {
      return res.status(404).json({
        error: "no firmware found"
      });
    }

    res.json(latest);

  } catch (err) {

    res.status(500).json({
      error: "server error"
    });

  }

}