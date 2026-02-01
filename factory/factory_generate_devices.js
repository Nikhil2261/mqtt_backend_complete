import fs from "fs";
import crypto from "crypto";
import mongoose from "mongoose";
import PhysicalDevice from "../src/models/PhysicalDevice.js";
import "dotenv/config";

/* ================= CONFIG ================= */

const INPUT_FILE = process.argv[2]; // mac_list.txt

if (!INPUT_FILE) {
  console.error("❌ Usage: node factory_generate_devices.js mac_list.txt");
  process.exit(1);
}

/* ================= DB CONNECT ================= */

// ❗ FIXED: MONGO_URI (NOT MONGO_URL)
await mongoose.connect(process.env.MONGO_URL, {
  autoIndex: true
});

console.log("✅ MongoDB connected (factory)");

/* ================= HELPERS ================= */

function generateToken() {
  return crypto.randomBytes(16).toString("hex"); // 32 chars
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/* ================= READ DEVICE IDS ================= */

const deviceIds = fs
  .readFileSync(INPUT_FILE, "utf-8")
  .split("\n")
  .map(l => l.trim().toLowerCase())
  .filter(Boolean);

if (deviceIds.length === 0) {
  console.error("❌ No device IDs found in file");
  process.exit(1);
}

/* ================= CSV PREP ================= */

// EMQX Built-in Auth CSV format
const csvLines = ["username,password"];

/* ================= MAIN LOOP ================= */

let created = 0;

for (const deviceId of deviceIds) {
  const plainToken = generateToken();
  const tokenHash = hashToken(plainToken);

  try {
    await PhysicalDevice.create({
      deviceId,
      deviceToken: tokenHash,   // 🔒 HASHED IN DB
      claimed: false
    });

    // CSV gets PLAIN token
    csvLines.push(`${deviceId},${plainToken}`);
    created++;
  } catch (err) {
    if (err.code === 11000) {
      console.log(`⚠️ Skipped duplicate deviceId: ${deviceId}`);
    } else {
      console.error(`❌ Error inserting ${deviceId}`, err.message);
    }
  }
}

/* ================= WRITE CSV ================= */

fs.writeFileSync("devices.csv", csvLines.join("\n"));

console.log("=================================");
console.log("✅ FACTORY RUN COMPLETE");
console.log(`Devices processed: ${deviceIds.length}`);
console.log(`Devices inserted:  ${created}`);
console.log("CSV generated: devices.csv");
console.log("=================================");

process.exit(0);
