import express from "express";

const router = express.Router();

// router.get("/ping", (req, res) => {
//   res.status(200).send("OK");
// });
router.get("/ping", (req, res) => {

  const time = new Date().toISOString();

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;

  console.log(`📡 [PING] ${time} | IP: ${ip}`);

  res.status(200).send("OK");
});

export default router;