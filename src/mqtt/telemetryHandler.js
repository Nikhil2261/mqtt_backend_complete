// import Device from "../models/Device.js";
// import { emitToUser } from "../socket/index.js";

// export async function handleTelemetry(topic, payload) {
//   let data;
//   try {
//     data = JSON.parse(payload.toString());
//   } catch {
//     return;
//   }

//   const [, deviceId] = topic.split("/");
//   if (!deviceId) return;

//   /* ========== OTA PROGRESS ========== */
//   if (data.type === "ota") {
//     const device = await Device.findOne({ deviceId });
//     if (!device?.owner) return;

//     emitToUser(device.owner.toString(), "ota", {
//       deviceId,
//       stage: data.stage,
//       percent: data.percent ?? 0,
//       ts: data.ts ?? Date.now()
//     });
//     return;
//   }

//   /* ========== TELEMETRY NORMALIZATION ========== */
//   if (!Array.isArray(data.states)) return;

//   const normalizedStates = {};
//   let fan = null;

//   for (const s of data.states) {
//     if (s.type === "switch") {
//       normalizedStates[s.pin] = s.status;
//     }

//     if (s.type === "fan") {
//       fan = s.speed;
//     }
//   }

//   const device = await Device.findOneAndUpdate(
//     { deviceId },
//     {
//       $set: {
//         states: normalizedStates,
//         fanSpeed: fan,
//         lastSeen: new Date()
//       }
//     },
//     { new: true }
//   );

//   if (!device?.owner) return;

//   emitToUser(device.owner.toString(), "telemetry", {
//     deviceId,
//     states: device.states,
//     fanSpeed: device.fanSpeed,
//     ts: data.ts ?? Date.now()
//   });
// }



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

  /* ========== OTA PROGRESS ========== */
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

  /* ========== TELEMETRY NORMALIZATION ========== */
  if (!Array.isArray(data.states)) return;

  const normalizedStates = [];
  let fan = null;

  for (const s of data.states) {
    if (s.type === "switch") {
      normalizedStates.push({
        type: "switch",
        pin: s.pin,
        status: s.status
      });
    }

    if (s.type === "fan") {
      fan = s.speed;
    }
  }

  const device = await Device.findOneAndUpdate(
    { deviceId },
    {
      $set: {
        states: normalizedStates,
        fanSpeed: fan,
        lastSeen: new Date()
      }
    },
    { new: true }
  );

  if (!device?.owner) return;

  emitToUser(device.owner.toString(), "telemetry", {
    deviceId,
    states: device.states,
    fanSpeed: device.fanSpeed,
    ts: data.ts ?? Date.now()
  });
}
