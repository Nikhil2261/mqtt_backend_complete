import mqtt from "mqtt";

const client = mqtt.connect(process.env.EMQX_URL, {
  username: process.env.BACKEND_MQTT_USER,
  password: process.env.BACKEND_MQTT_PASS,
  protocol: "mqtts"
});

client.on("connect", () => {
  const deviceId = "c95785c3314";

  const payload = {
    cmdId: "ota-test-001",
    type: "ota",
    version: "1.1.0",
    url: "https://your-backend.com/firmware/esp32_v1.1.0.bin"
  };

  client.publish(
    `devices/${deviceId}/commands`,
    JSON.stringify(payload),
    { qos: 1 },
    () => {
      console.log("OTA command sent");
      process.exit(0);
    }
  );
});
