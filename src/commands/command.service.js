import crypto from "crypto";
import { mqttClient } from "../mqtt/mqttClient.js";
import Command from "../models/Command.js";

export async function sendCommand(deviceId, command) {
  if (!command?.type) {
    throw new Error("Command type missing");
  }

  const cmdId = crypto.randomUUID();

  await Command.create({
    deviceId,
    cmdId,
    type: command.type,      // 🔥 REQUIRED
    command,                 // raw payload
    status: "pending"        // 🔥 MUST be pending
  });

  mqttClient.publish(
    `devices/${deviceId}/commands`,
    JSON.stringify({ cmdId, ...command }),
    { qos: 1 }
  );

  return cmdId;
}
