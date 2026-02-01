import Device from "../models/Device.js";
import { emitToUser } from "../socket/index.js";

export async function handleTelemetry(topic, payload) {
  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch {
    return;
  }

  const [, deviceId] = topic.split("/");
  if (!deviceId) return;

  /* ================= OTA PROGRESS ================= */
  if (data.type === "ota") {
    const device = await Device.findOne({ deviceId });
    if (!device?.owner) return;

    emitToUser(device.owner.toString(), "ota", {
      deviceId,
      stage: data.stage,
      percent: data.percent ?? 0,
      ts: data.ts ?? Date.now()
    });
    return;
  }

  /* ================= NORMAL TELEMETRY ================= */
  if (typeof data.states !== "object") return;

  const device = await Device.findOneAndUpdate(
    { deviceId },
    {
      $set: {
        states: data.states,
        lastSeen: new Date()
      }
    },
    { new: true }
  );

  if (!device?.owner) return;

  emitToUser(device.owner.toString(), "telemetry", {
    deviceId,
    states: device.states,
    ts: data.ts ?? Date.now()
  });
}
