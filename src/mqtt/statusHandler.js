import Device from "../models/Device.js";
import { emitToDevice } from "../socket/index.js";

export async function handleStatus(topic, payload) {
  let data;

  try {
    data = JSON.parse(payload.toString());
  } catch {
    return;
  }

  const [, deviceId] = topic.split("/");
  if (!deviceId || typeof data.online !== "boolean") return;

  await Device.updateOne(
    { deviceId },
    {
      $set: {
        online: data.online,
        lastSeen: new Date()
      }
    },
    { upsert: true }
  );

  // 🔥 WebSocket push to frontend
  emitToDevice(deviceId, "status", {
    deviceId,
    online: data.online,
    ts: Date.now()
  });
}
