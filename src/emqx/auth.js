import crypto from "crypto";
//import PhysicalDevice from "../models/PhysicalDevice.js";
import Device from "../models/Device.js";

function sha256(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function emqxAuth(req, res) {
  const { username, password } = req.body;

  // EMQX safety
  if (!username || !password) {
    return res.json({ result: "deny" });
  }

  // username = deviceId
  //const device = await PhysicalDevice.findOne({ deviceId: username });
  const device = await Device.findOne({ deviceId: username });

  if (!device) {
    return res.json({ result: "deny" });
  }

  const incomingHash = sha256(password);

  if (incomingHash !== device.deviceToken) {
    return res.json({ result: "deny" });
  }

  // ✅ AUTH OK
  return res.json({
    result: "allow",
    is_superuser: false
  });
}
