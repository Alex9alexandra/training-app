import {Router} from "express";
import { addExercise, deleteExercise } from "../controllers/exerciseController";

const router=Router();

router.post("/:clientId/workouts/:workoutId/exercises", addExercise);
router.delete("/:clientId/workouts/:workoutId/exercises/:exerciseId", deleteExercise);

export default router;