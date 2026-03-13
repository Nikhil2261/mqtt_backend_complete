import Firmware from "../models/Firmware.js";

export async function registerFirmware(req, res) {

  const { version, url } = req.body;

  if (!version || !url) {
    return res.status(400).json({ error: "version and url required" });
  }

  const fw = await Firmware.create({ version, url });

  res.json({
    success: true,
    firmware: fw
  });
}