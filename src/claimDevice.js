import crypto from "crypto";
import PhysicalDevice from "../models/PhysicalDevice.js";

function sha256(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function claimDevice(req, res) {
  const { deviceId, deviceToken } = req.body;
  const userId = req.user.id; // JWT middleware se

  if (!deviceId || !deviceToken) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const device = await PhysicalDevice.findOne({ deviceId });

  if (!device) {
    return res.status(404).json({ error: "Device not found" });
  }

  if (device.claimed) {
    return res.status(409).json({ error: "Device already claimed" });
  }

  const hash = sha256(deviceToken);

  if (hash !== device.deviceToken) {
    return res.status(401).json({ error: "Invalid device token" });
  }

  device.claimed = true;
  device.ownerUserId = userId;
  await device.save();

  res.json({ success: true });
}
