import { Router } from "express";
import { getStatistics } from "../controllers/statisticsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.use(authMiddleware);
router.get("/", getStatistics);

export default router;