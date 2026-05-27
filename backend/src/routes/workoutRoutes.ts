import { Router } from "express";
import { getWorkouts, addWorkout, deleteWorkout } from "../controllers/workoutController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.use(authMiddleware);
router.get("/:clientId/workouts", getWorkouts);
router.post("/:clientId/workouts", addWorkout);
router.delete("/:clientId/workouts/:workoutId", deleteWorkout);

export default router;
