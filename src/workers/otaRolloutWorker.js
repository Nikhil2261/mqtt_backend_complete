import Firmware from "../models/Firmware.js";
import Device from "../models/Device.js";
import crypto from "crypto";
import { mqttClient } from "../mqtt/mqttClient.js";

export async function otaRolloutWorker() {

  const latest = await Firmware
    .findOne()
    .sort({ createdAt: -1 });

  if (!latest) return;

  const devices = await Device
    .find({ firmware: { $ne: latest.version } })
    .limit(50); // batch rollout

  for (const d of devices) {

    const cmdId = crypto.randomUUID();

    mqttClient.publish(
      `devices/${d.deviceId}/commands`,
      JSON.stringify({
        cmdId,
        type: "ota",
        version: latest.version,
        url: latest.url
      }),
      { qos: 1 }
    );
  }
}