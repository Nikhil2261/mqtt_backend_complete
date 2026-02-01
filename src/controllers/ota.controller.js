import crypto from "crypto";
import Device from "../models/Device.js";
import Command from "../models/Command.js";
import { mqttClient } from "../mqtt/mqttClient.js";

/* ================== TRIGGER OTA ================== */
export async function triggerOta(req, res) {
  const { deviceId } = req.params;
  const userId = req.user.userId;
  const { version, url } = req.body;

  if (!version || !url) {
    return res.status(400).json({ error: "Missing version or url" });
  }

  const device = await Device.findOne({ deviceId, owner: userId });
  if (!device) {
    return res.status(404).json({ error: "Device not found or not owned" });
  }

  const cmdId = crypto.randomUUID();

  const command = {
    type: "ota",
    version,
    url
  };

  await Command.create({
    deviceId,
    cmdId,
    type: "ota",
    command,
    status: "pending"
  });

  mqttClient.publish(
    `devices/${deviceId}/commands`,
    JSON.stringify({ cmdId, ...command }),
    { qos: 1 }
  );

  res.json({
    cmdId,
    status: "pending"
  });
}
