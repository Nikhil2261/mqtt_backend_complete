
import Device from "../models/Device.js";
import Firmware from "../models/Firmware.js";
import { emitToUser } from "../socket/index.js";

export async function handleTelemetry(topic, payload) {

  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch (err) {
    console.error("Invalid telemetry JSON");
    return;
  }

  const parts = topic.split("/");
  const deviceId = parts[1];
  if (!deviceId) return;

  /* OTA PROGRESS */
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

  /* TELEMETRY NORMALIZATION */
if (!Array.isArray(data.states)) data.states = [];

const normalizedStates = [];

for (const s of data.states) {
  if (s.type === "switch" && typeof s.pin === "number") {
    normalizedStates.push({
      type: "switch",
      pin: s.pin,
      status: s.status
    });
  }

  if (s.type === "fan") {
    normalizedStates.push({
      type: "fan",
      speed: s.speed ?? 0
    });
  }
}

const device = await Device.findOneAndUpdate(
  { deviceId },
  {
    $set: {
      states: normalizedStates,
      firmware: data.fw,
      online: true,
      lastSeen: new Date()
    }
  },
  { new: true }
);
  
  // /* TELEMETRY NORMALIZATION */ =================================old dashboard code
  // if (!Array.isArray(data.states)) data.states = [];

  // const normalizedStates = [];
  // let fan = null;

  // for (const s of data.states) {
  //   if (s.type === "switch" && typeof s.pin === "number") {
  //     normalizedStates.push({
  //       type: "switch",
  //       pin: s.pin,
  //       status: s.status
  //     });
  //   }
  //   if (s.type === "fan") fan = s.speed;
  // }

  // const device = await Device.findOneAndUpdate(
  //   { deviceId },
  //   {
  //     $set: {
  //       states: normalizedStates,
  //       fanSpeed: fan,
  //       firmware: data.fw,
  //       online: true,
  //       lastSeen: new Date()
  //     }
  //   },
  //   { new: true }
  // );

  if (!device?.owner) return;

  // ✅ Firmware latest hai toh ota.status idle karo
  if (data.fw) {
    const latest = await Firmware
      .findOne({ active: true })
      .sort({ createdAt: -1 });

    if (latest && data.fw === latest.version) {
      await Device.updateOne(
        { deviceId },
        { $set: { "ota.status": "idle" } }
      );
      console.log(`[Telemetry] ${deviceId} fw: ${data.fw} → ota.status: idle ✅`);
    }
  }

//   emitToUser(device.owner.toString(), "telemetry", {
//     deviceId,
//     states: device.states,
//     fanSpeed: device.fanSpeed,
//     firmware: device.firmware,
//     ts: data.ts ?? Date.now()
//   });
// }

emitToUser(device.owner.toString(), "telemetry", {
  deviceId,
  states: device.states,
  firmware: device.firmware,
  ts: data.ts ?? Date.now()
});
}