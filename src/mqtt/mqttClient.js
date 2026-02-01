import mqtt from "mqtt";
import { handleTelemetry } from "./telemetryHandler.js";
import { handleAck } from "./ackHandler.js";
import { handleStatus } from "./statusHandler.js";

let client = null;

export function startMqtt() {
  console.log("MQTT ENV CHECK:", {
    EMQX_URL: process.env.EMQX_URL,
    USER: process.env.BACKEND_MQTT_USER,
    HAS_PASS: !!process.env.BACKEND_MQTT_PASS
  });

  client = mqtt.connect(process.env.EMQX_URL, {
    clientId: "backend-server",
    username: process.env.BACKEND_MQTT_USER,
    password: process.env.BACKEND_MQTT_PASS,
    protocol: "mqtts",
    keepalive: 60,
    clean: true,
    reconnectPeriod: 5000,
    rejectUnauthorized: false
  });

  client.on("connect", () => {
    console.log("✅ Backend MQTT connected");

    client.subscribe("devices/+/telemetry", { qos: 1 });
    client.subscribe("devices/+/ack", { qos: 1 });
    client.subscribe("devices/+/status", { qos: 1 });
  });

  client.on("message", (topic, payload) => {
    try {
      if (topic.endsWith("/telemetry")) {
        handleTelemetry(topic, payload);
        return;
      }

      if (topic.endsWith("/ack")) {
        handleAck(topic, payload);
        return;
      }

      if (topic.endsWith("/status")) {
        handleStatus(topic, payload);
        return;
      }
    } catch (err) {
      console.error("MQTT handler error:", err.message);
    }
  });

  client.on("error", err => {
    console.error("❌ MQTT ERROR:", err.message);
  });

  return client;
}
