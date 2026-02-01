import { sendCommand } from "./command.service.js";

export async function sendCommandController(req, res) {
  const { deviceId } = req.params;
  const command = req.body;

  const cmdId = await sendCommand(deviceId, command);
  res.json({ ok: true, cmdId });
}