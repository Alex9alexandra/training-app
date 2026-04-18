import { Router } from "express";
import { getWorkouts, addWorkout, deleteWorkout } from "../controllers/workoutController";

const router = Router();

router.get("/:clientId/workouts", getWorkouts);
router.post("/:clientId/workouts", addWorkout);
router.delete("/:clientId/workouts/:workoutId", deleteWorkout);

export default router;
