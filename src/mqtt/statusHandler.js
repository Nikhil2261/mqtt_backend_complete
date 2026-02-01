import Device from "../models/Device.js";
import { emitToUser } from "../socket/index.js";

export async function handleStatus(topic, payload) {
  let data;

  try {
    data = JSON.parse(payload.toString());
  } catch {
    return;
  }

  const [, deviceId] = topic.split("/");
  if (!deviceId || typeof data.online !== "boolean") return;

  const device = await Device.findOneAndUpdate(
    { deviceId },
    {
      $set: {
        online: data.online,
        lastSeen: new Date()
      }
    },
    { new: true }
  );

  // device not claimed → no user to notify
  if (!device?.owner) return;

  // 🔥 WebSocket push to owning user
  emitToUser(device.owner.toString(), "status", {
    deviceId,
    online: data.online,
    ts: Date.now()
  });
}
