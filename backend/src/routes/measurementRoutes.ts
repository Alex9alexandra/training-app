import { Router } from "express";
import { getMeasurements,addMeasurement,deleteMeasurement } from "../controllers/measurementController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.use(authMiddleware);
router.get(
    "/:clientId/measurements",
    getMeasurements
);
router.post("/:clientId/measurements", addMeasurement);
router.delete("/:clientId/measurements/:measurementId", deleteMeasurement);
export default router;

