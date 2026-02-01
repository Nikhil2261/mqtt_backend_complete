import mqtt from "mqtt";
import { handleTelemetry } from "./telemetryHandler.js";
import { handleAck } from "./ackHandler.js";
import { handleStatus } from "./statusHandler.js";

export let mqttClient = null;

export function startMqtt() {
  if (mqttClient) return mqttClient;

  console.log("MQTT ENV CHECK:", {
    EMQX_URL: process.env.EMQX_URL,
    USER: process.env.BACKEND_MQTT_USER,
    HAS_PASS: !!process.env.BACKEND_MQTT_PASS
  });

  mqttClient = mqtt.connect(process.env.EMQX_URL, {
    clientId: "backend-server",
    username: process.env.BACKEND_MQTT_USER,
    password: process.env.BACKEND_MQTT_PASS,
    protocol: "mqtts",
    keepalive: 60,
    clean: true,
    reconnectPeriod: 5000,
    rejectUnauthorized: false
  });

  mqttClient.on("connect", () => {
    console.log("✅ Backend MQTT connected");

    mqttClient.subscribe("devices/+/telemetry", { qos: 1 });
    mqttClient.subscribe("devices/+/ack", { qos: 1 });
    mqttClient.subscribe("devices/+/status", { qos: 1 });
  });

  mqttClient.on("message", (topic, payload) => {
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

  mqttClient.on("error", err => {
    console.error("❌ MQTT ERROR:", err.message);
  });

  return mqttClient;
}
