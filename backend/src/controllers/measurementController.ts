import { Request, Response } from "express";

import { clientService } from "../service/clientServiceInstance";
import { validateMeasurement } from "../validators/measurementValidators";
import { validateId } from "../validators/idValidators";
import { Measurement } from "../domain/Measurement";

export const getMeasurements = async (req: Request, res: Response) => {

    const idError = validateId(req.params.clientId);

    if (idError) {
        return res.status(400).json({
            message: idError
        });
    }
    

    const clientId = Number(req.params.clientId);

    const measurements = await clientService.getMeasurements(clientId);

    if (measurements===null) {
        return res.status(404).json({
            message: "Client not found"
        });
    }

    return res.status(200).json(measurements);
};

export const addMeasurement = async (req: Request, res: Response) => {

    const idError = validateId(req.params.clientId);

    if (idError) {
        return res.status(400).json({ message: idError });
    }

    const error = validateMeasurement(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    const clientId = Number(req.params.clientId);

    const measurement: Measurement = req.body;

    const added = await clientService.addMeasurement(clientId, measurement);

    if (!added) {
        return res.status(404).json({
            message: "Client not found or measurement already exists"
        });
    }

    return res.status(201).json(added);
};

export const deleteMeasurement = async (req: Request, res: Response) => {

    const idError = validateId(req.params.clientId);

    if (idError) {
        return res.status(400).json({ message: idError });
    }

    const idError2 = validateId(req.params.measurementId);

    if (idError2) {
        return res.status(400).json({ message: idError2 });
    }

    const clientId = Number(req.params.clientId);
    const measurementId = Number(req.params.measurementId);

    const deleted = await clientService.deleteMeasurement(
        clientId,
        measurementId
    );

    if (!deleted) {
        return res.status(404).json({
            message: "Client or measurement not found"
        });
    }

    return res.status(200).json(deleted);
};