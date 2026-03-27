import crypto from "crypto";
import Device from "../models/Device.js";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/* ================== CLAIM DEVICE ================== */
export async function claimDevice(req, res) { try{
  const { deviceId, deviceToken } = req.body;
  const userId = req.user.userId;

  if (!deviceId || !deviceToken) {
    return res.status(400).json({ error: "Missing deviceId or token" });
  }

  const device = await Device.findOne({ deviceId });
  if (!device) {
    return res.status(404).json({ error: "Device not found" });
  }

  if (device.owner) {
    return res.status(409).json({ error: "Device already claimed" });
  }

  const hashed = hashToken(deviceToken);
  if (device.deviceToken !== hashed) {
    return res.status(401).json({ error: "Invalid device token" });
  }

  device.owner = userId;
  device.claimedAt = new Date();
  await device.save();

  console.log("DEVICE CLAIMED:", deviceId, "BY", userId);

  res.json({
    message: "Device claimed successfully",
    deviceId: device.deviceId,
    claimedAt: device.claimedAt
  });
}catch (err) {
    console.error("[sendDeviceCommand] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  } }

/* ================== LIST MY DEVICES ================== */
export async function listMyDevices(req, res) { try{
  const userId = req.user.userId;

  const devices = await Device.find(
    { owner: userId },
    { deviceToken: 0 } // 🔥 never expose token
  );

  res.json(devices);
} catch (err) {
    console.error("[sendDeviceCommand] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }}
