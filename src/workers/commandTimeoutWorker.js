// import Command from "../models/Command.js";

// const NORMAL_CMD_TIMEOUT_MS = 30 * 1000;      // 30 sec
// const OTA_CMD_TIMEOUT_MS    = 10 * 60 * 1000; // 10 min

// export async function runCommandTimeoutWorker() {
//   const now = Date.now();

//   // Find all pending commands
//   const pending = await Command.find({
//     status: "pending"
//   }).lean();

//   for (const cmd of pending) {
//     const age = now - new Date(cmd.createdAt).getTime();

//     const timeout =
//       cmd.type === "ota"
//         ? OTA_CMD_TIMEOUT_MS
//         : NORMAL_CMD_TIMEOUT_MS;

//     if (age > timeout) {
//       await Command.updateOne(
//         { _id: cmd._id, status: "pending" },
//         {
//           $set: {
//             status: "failed",
//             failedReason: "timeout",
//             failedAt: new Date()
//           }
//         }
//       );
//     }
//   }
// }


import Command from "../models/Command.js";
import Device from "../models/Device.js";
import { emitToUser } from "../socket/index.js";

const NORMAL_CMD_TIMEOUT_MS = 30 * 1000;
const OTA_CMD_TIMEOUT_MS    = 10 * 60 * 1000;

export async function runCommandTimeoutWorker() {
  const now = Date.now();

  const pending = await Command.find({
    status: "pending"
  }).lean();

  for (const cmd of pending) {
    const age = now - new Date(cmd.createdAt).getTime();

    const timeout =
      cmd.type === "ota"
        ? OTA_CMD_TIMEOUT_MS
        : NORMAL_CMD_TIMEOUT_MS;

    if (age > timeout) {

      // atomic update
      const updated = await Command.findOneAndUpdate(
        { _id: cmd._id, status: "pending" },
        {
          $set: {
            status: "failed",
            failedReason: "timeout",
            failedAt: new Date()
          }
        },
        { new: true }
      );

      if (!updated) continue;

      const device = await Device.findOne({
        deviceId: cmd.deviceId
      });

      if (!device?.owner) continue;

      emitToUser(device.owner.toString(), "commandFailed", {
        deviceId: cmd.deviceId,
        cmdId: cmd.cmdId,
        reason: "timeout",
        ts: Date.now()
      });
    }
  }
}
