export function emqxAcl(req, res) {
  const { username, topic, action } = req.body;

  if (!username || !topic || !action) {
    return res.json({ result: "deny" });
  }

  // Device publishing telemetry or ack
  if (
    action === "publish" &&
    (
      topic === `devices/${username}/telemetry` ||
      topic === `devices/${username}/ack`
    )
  ) {
    return res.json({ result: "allow" });
  }

  // Device subscribing to commands
  if (
    action === "subscribe" &&
    topic === `devices/${username}/command`
  ) {
    return res.json({ result: "allow" });
  }

  return res.json({ result: "deny" });
}
