import Device from "../models/Device.js";

/* ================== CLAIM DEVICE ================== */
export async function claimDevice(req, res) {
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

  if (device.deviceToken !== deviceToken) {
    return res.status(401).json({ error: "Invalid device token" });
  }

  device.owner = userId;
  device.claimedAt = new Date();

  await device.save();

  res.json({
    message: "Device claimed successfully",
    device: {
      deviceId: device.deviceId,
      claimedAt: device.claimedAt
    }
  });
}

/* ================== LIST MY DEVICES ================== */
export async function listMyDevices(req, res) {
  const userId = req.user.userId;

  const devices = await Device.find(
    { owner: userId },
    { deviceToken: 0 } // 🔥 never send token to frontend
  );

  res.json(devices);
}
