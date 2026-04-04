
// import Command from "../models/Command.js";
// import Device from "../models/Device.js";
// import { emitToUser } from "../socket/index.js";

// export async function handleAck(topic, payload) {

//   let data;

//   try {
//     data = JSON.parse(payload.toString());
//   } catch {
//     return;
//   }

//   const parts = topic.split("/");
//   const deviceId = parts[1];

//   if (!deviceId || !data.cmdId) return;

//   let status = "done";

//   if (data.status === "failed") {
//     status = "failed";
//   }

//   const res = await Command.updateOne(
//     {
//       deviceId,
//       cmdId: data.cmdId,
//       status: { $ne: "done" }
//     },
//     {
//       $set: {
//         status,
//         ackAt: new Date(),
//         failedReason: status === "failed" ? "device_reject" : null
//       }
//     }
//   );

//   if (res.matchedCount === 0) return;

//   const device = await Device.findOne({ deviceId });

//   if (!device?.owner) return;

//   emitToUser(device.owner.toString(), "ack", {
//     deviceId,
//     cmdId: data.cmdId,
//     status,
//     ts: Date.now()
//   });

// }

import Command from "../models/Command.js";
import Device from "../models/Device.js";
import { emitToUser } from "../socket/index.js";

export async function handleAck(topic, payload) {

  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch {
    return;
  }

  const parts = topic.split("/");
  const deviceId = parts[1];

  if (!deviceId || !data.cmdId) return;

  let status = "done";
  if (data.status === "failed") status = "failed";

  // Command update karo
  const res = await Command.updateOne(
    {
      deviceId,
      cmdId: data.cmdId,
      status: { $ne: "done" }
    },
    {
      $set: {
        status,
        ackAt: new Date(),
        failedReason: status === "failed" ? "device_reject" : null
      }
    }
  );

  if (res.matchedCount === 0) return;

  const device = await Device.findOne({ deviceId });
  if (!device?.owner) return;

  // ✅ OTA ACK handle karo — Device.ota.status update karo
  const command = await Command.findOne({ cmdId: data.cmdId });

  if (command?.type === "ota") {
    if (data.status === "ota-start") {
      // ESP32 ne OTA shuru kiya
      await Device.updateOne(
        { deviceId },
        { $set: { "ota.status": "updating" } }
      );
    } else if (status === "done" || data.status === "ota-failed") {
      // OTA complete ya failed
      await Device.updateOne(
        { deviceId },
        {
          $set: {
            "ota.status": status === "done" ? "idle" : "failed"
          }
        }
      );
    }
  }

  // Frontend ko emit karo
  emitToUser(device.owner.toString(), "ack", {
    deviceId,
    cmdId: data.cmdId,
    status,
    ts: Date.now()
  });
}