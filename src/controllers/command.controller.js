// import crypto from "crypto";
// import Device from "../models/Device.js";
// import Command from "../models/Command.js";
// import { mqttClient } from "../mqtt/mqttClient.js";

// /* ================== SEND COMMAND ================== */
// export async function sendDeviceCommand(req, res) {
//   const { deviceId } = req.params;
//   const userId = req.user.userId;
//   const command = req.body;

//   // 🔐 Validate command
//   if (!command?.type) {
//     return res.status(400).json({ error: "Command type missing" });
//   }

//   // 🔐 Ownership check
//   const device = await Device.findOne({ deviceId, owner: userId });
//   if (!device) {
//     return res.status(404).json({ error: "Device not found or not owned" });
//   }

//   const cmdId = crypto.randomUUID();

//   // 🧾 Save command (PENDING)
//   await Command.create({
//     deviceId,
//     cmdId,
//     type: command.type,
//     command,
//     status: "pending"
//   });

//   // 📡 MQTT publish
//   const topic = `devices/${deviceId}/commands`;
//     const payload = { cmdId, ...command };
  
//     console.log("[API] Publishing MQTT command", {
//       topic,
//       payload
//     });
  
//     mqttClient.publish(
//       topic,
//       JSON.stringify(payload),
//       { qos: 1 }
//     );
  
//     res.json({
//       cmdId,
//       status: "pending"
//     });
//   }

import crypto from "crypto";
import Device from "../models/Device.js";
import Command from "../models/Command.js";
import { mqttClient } from "../mqtt/mqttClient.js";

/* ================== SEND COMMAND ================== */
export async function sendDeviceCommand(req, res) {
  const { deviceId } = req.params;
  const userId = req.user.userId;
  const command = req.body;

  // 🔐 Basic validation
  if (!command?.type) {
    return res.status(400).json({ error: "Command type missing" });
  }

  // 🔐 Ownership check
  const device = await Device.findOne({ deviceId, owner: userId });
  if (!device) {
    return res.status(404).json({ error: "Device not found or not owned" });
  }

  const cmdId = crypto.randomUUID();

  /* ================== BUILD SAFE PAYLOAD ================== */

  let payload;

  // ✔ SWITCH = TOGGLE ONLY
  if (command.type === "switch") {

    if (typeof command.pin !== "number") {
      return res.status(400).json({ error: "Pin missing for switch command" });
    }

    payload = {
      cmdId,
      type: "switch",
      pin: command.pin,
      action: "toggle"
    };
  }

  // ✔ FAN = SET SPEED
  else if (command.type === "fan") {

    if (typeof command.value !== "number") {
      return res.status(400).json({ error: "Fan speed missing" });
    }

    payload = {
      cmdId,
      type: "fan",
      value: command.value
    };
  }

  else {
    return res.status(400).json({ error: "Invalid command type" });
  }

  /* ================== SAVE COMMAND ================== */

  await Command.create({
    deviceId,
    cmdId,
    type: payload.type,
    command: payload,
    status: "pending"
  });

  /* ================== MQTT PUBLISH ================== */

  const topic = `devices/${deviceId}/commands`;

  console.log("[API] Publishing MQTT command", {
    topic,
    payload
  });

  mqttClient.publish(
    topic,
    JSON.stringify(payload),
    { qos: 1 }
  );

  /* ================== RESPONSE ================== */

  res.json({
    cmdId,
    status: "pending"
  });
}