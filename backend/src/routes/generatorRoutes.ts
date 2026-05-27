import express from "express";
import { startGenerator, stopGenerator } from "../service/generatorService";
import { repo } from "../service/clientServiceInstance";
import { broadcast } from "../service/websocket";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
router.use(authMiddleware);
router.post("/start", (req, res) => {
  startGenerator(repo, broadcast);
  res.send("Generator started");
});

router.post("/stop", (req, res) => {
  stopGenerator();
  res.send("Generator stopped");
});

export default router;