import { Router } from "express";
import { getMeasurements,addMeasurement,deleteMeasurement } from "../controllers/measurementController";

const router = Router();
router.get(
    "/:clientId/measurements",
    getMeasurements
);
router.post("/:clientId/measurements", addMeasurement);
router.delete("/:clientId/measurements/:measurementId", deleteMeasurement);
export default router;
