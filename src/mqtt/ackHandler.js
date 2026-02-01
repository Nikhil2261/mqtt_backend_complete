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

  const [, deviceId] = topic.split("/");
  if (!deviceId || !data.cmdId) return;

  const res = await Command.updateOne(
    {
      deviceId,
      cmdId: data.cmdId,
      status: { $ne: "done" }
    },
    {
      $set: {
        status: "done",
        ackAt: new Date()
      }
    }
  );

  // duplicate / late ACK
  if (res.matchedCount === 0) return;

  const device = await Device.findOne({ deviceId });
  if (!device?.owner) return;

  emitToUser(device.owner.toString(), "ack", {
    deviceId,
    cmdId: data.cmdId,
    status: "done",
    ts: Date.now()
  });
}
