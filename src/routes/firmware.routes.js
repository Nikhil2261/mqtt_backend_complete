// import express from "express";
// import { registerFirmware } from "../controllers/firmware.controller.js";
// import { requireAuth } from "../middleware/auth.middleware.js";

// const router = express.Router();

// router.post("/", requireAuth, registerFirmware);

// export default router;


import express from "express";
import {
  registerFirmware,
  listFirmwares,
  getLatestFirmware
} from "../controllers/firmware.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, registerFirmware);

router.get("/", requireAuth, listFirmwares);

router.get("/latest", requireAuth, getLatestFirmware);

export default router;