import { Router } from "express";
import { getMessages } from "../controllers/chatController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.use(authMiddleware);
router.get("/", getMessages);

export default router;