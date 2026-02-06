import crypto from "crypto";
import Device from "../models/Device.js";
import Command from "../models/Command.js";
import { mqttClient } from "../mqtt/mqttClient.js";

/* ================== SEND COMMAND ================== */
export async function sendDeviceCommand(req, res) {
  const { deviceId } = req.params;
  const userId = req.user.userId;
  const command = req.body;

  // 🔐 Validate command
  if (!command?.type) {
    return res.status(400).json({ error: "Command type missing" });
  }

  // 🔐 Ownership check
  const device = await Device.findOne({ deviceId, owner: userId });
  if (!device) {
    return res.status(404).json({ error: "Device not found or not owned" });
  }

  const cmdId = crypto.randomUUID();

  // 🧾 Save command (PENDING)
  await Command.create({
    deviceId,
    cmdId,
    type: command.type,
    command,
    status: "pending"
  });

  // 📡 MQTT publish
  const topic = `devices/${deviceId}/command`;
    const payload = { cmdId, ...command };
  
    console.log("[API] Publishing MQTT command", {
      topic,
      payload
    });
  
    mqttClient.publish(
      topic,
      JSON.stringify(payload),
      { qos: 1 }
    );
  
    res.json({
      cmdId,
      status: "pending"
    });
  }
