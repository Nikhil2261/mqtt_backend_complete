import Command from "../models/Command.js";

const NORMAL_CMD_TIMEOUT_MS = 30 * 1000;      // 30 sec
const OTA_CMD_TIMEOUT_MS    = 10 * 60 * 1000; // 10 min

export async function runCommandTimeoutWorker() {
  const now = Date.now();

  // Find all pending commands
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
      await Command.updateOne(
        { _id: cmd._id, status: "pending" },
        {
          $set: {
            status: "failed",
            failedReason: "timeout",
            failedAt: new Date()
          }
        }
      );
    }
  }
}
