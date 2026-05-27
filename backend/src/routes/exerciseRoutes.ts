import {Router} from "express";
import { addExercise, deleteExercise } from "../controllers/exerciseController";
import { authMiddleware } from "../middleware/authMiddleware";

const router=Router();
router.use(authMiddleware);
router.post("/:clientId/workouts/:workoutId/exercises", addExercise);
router.delete("/:clientId/workouts/:workoutId/exercises/:exerciseId", deleteExercise);

export default router;