
// import Firmware from "../models/Firmware.js";
// import Device from "../models/Device.js";
// import Command from "../models/Command.js";
// import crypto from "crypto";
// import { mqttClient } from "../mqtt/mqttClient.js";

// export async function otaRolloutWorker() {

//   try {

//     // const latest = await Firmware
//     //   .findOne()
//     //   .sort({ createdAt: -1 });

//     // if (!latest) return;
//    // ✅ Version se sort karo
// const latest = await Firmware
//   .findOne({ active: true })
//   .sort({ createdAt: -1 });

// if (!latest) {
//   console.log("[OTA Worker] No firmware found");
//   return;
// }

// console.log("[OTA Worker] Latest firmware:", latest.version);

//     const devices = await Device.find({
//       firmware: { $ne: latest.version },
//       online: true,
//       "ota.status": { $nin: ["pending", "updating"] }
//     }).limit(50);
    

//     for (const d of devices) {

//       const cmdId = crypto.randomUUID();

//       const payload = {
//         cmdId,
//         type: "ota",
//         version: latest.version,
//         url: latest.url
//       };

//       await Command.create({
//         deviceId: d.deviceId,
//         cmdId,
//         type: "ota",
//         command: payload,
//         status: "pending"
//       });

//       mqttClient.publish(
//         `devices/${d.deviceId}/commands`,
//         JSON.stringify(payload),
//         { qos: 1, retain: false }
//       ); 

//       await Device.updateOne(                          
//         { deviceId: d.deviceId },
//         { $set: { "ota.status": "pending", "ota.lastAttempt": new Date() } }
//       );

//       console.log("OTA sent to", d.deviceId);

//     }

//   } catch (err) {

//     console.error("OTA rollout error:", err);

//   }
// }


import Firmware from "../models/Firmware.js";
import Device from "../models/Device.js";
import Command from "../models/Command.js";
import crypto from "crypto";
import { mqttClient } from "../mqtt/mqttClient.js";

export async function otaRolloutWorker() {
  try {

    // ✅ Fix — active:true filter + createdAt sort
    const latest = await Firmware
      .findOne({ active: true })
      .sort({ createdAt: -1 });

    if (!latest) {
      console.log("[OTA Worker] No active firmware found");
      return;
    }

    console.log(`[OTA Worker] Latest firmware: ${latest.version}`);

    // ✅ Fix — firmware field missing wale devices bhi include karo
    const devices = await Device.find({
      $or: [
        { firmware: { $ne: latest.version } },
        { firmware: { $exists: false } },
        { firmware: null }
      ],
      online: true,
      "ota.status": { $nin: ["pending", "updating"] }
    }).limit(50);

    if (devices.length === 0) {
      console.log("[OTA Worker] All devices up to date ✅");
      return;
    }

    console.log(`[OTA Worker] ${devices.length} device(s) need update`);

    for (const d of devices) {

      const cmdId = crypto.randomUUID();

      const payload = {
        cmdId,
        type: "ota",
        version: latest.version,
        url: latest.url
      };

      await Command.create({
        deviceId: d.deviceId,
        cmdId,
        type: "ota",
        command: payload,
        status: "pending"
      });

      mqttClient.publish(
        `devices/${d.deviceId}/commands`,
        JSON.stringify(payload),
        { qos: 1, retain: false }
      );

      await Device.updateOne(
        { deviceId: d.deviceId },
        {
          $set: {
            "ota.status": "pending",
            "ota.lastAttempt": new Date()
          }
        }
      );

      console.log(`[OTA Worker] OTA sent to ${d.deviceId} → v${latest.version}`);
    }

  } catch (err) {
    console.error("[OTA Worker] Error:", err);
  }
}