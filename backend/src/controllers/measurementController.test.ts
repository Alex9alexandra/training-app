import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";


vi.mock("../service/clientServiceInstance", () => {
  return {
    clientService: {
      getMeasurements: vi.fn(),
      addMeasurement: vi.fn(),
      deleteMeasurement: vi.fn(),
    },
  };
});

vi.mock("../validators/idValidators", () => {
  return {
    validateId: vi.fn(),
  };
});

vi.mock("../validators/measurementValidators", () => {
  return {
    validateMeasurement: vi.fn(),
  };
});

import {
  getMeasurements,
  addMeasurement,
  deleteMeasurement,
} from "./measurementController";

import { clientService } from "../service/clientServiceInstance";
import { validateId } from "../validators/idValidators";
import { validateMeasurement } from "../validators/measurementValidators";


const mockReq = (
  params: any = {},
  body: any = {}
): Request =>
  ({
    params,
    body,
  } as Request);

const mockRes = (): Response => {
  const res: Partial<Response> = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res as Response;
};


const measurement = {
  id: 1,
  height: 180,
  weight: 75,
  muscularMassPercent: 40,
  fatMassPercent: 15,
  boneMassPercent: 5,
  leanBodyMassPercent: 80,
  date: "15/01/2024",
};


describe("measurementController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("getMeasurements", () => {
    it("returns 400 if clientId invalid", async () => {
      (validateId as any).mockReturnValueOnce("Invalid ID");

      const req = mockReq({
        clientId: "abc",
      });

      const res = mockRes();

      await getMeasurements(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid ID",
      });
    });

    it("returns 404 if client not found", async () => {
      (validateId as any).mockReturnValueOnce(null);

      (clientService.getMeasurements as any)
        .mockResolvedValueOnce(null);

      const req = mockReq({
        clientId: "1",
      });

      const res = mockRes();

      await getMeasurements(req, res);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        message: "Client not found",
      });
    });

    it("returns 200 with measurements", async () => {
      (validateId as any).mockReturnValueOnce(null);

      (clientService.getMeasurements as any)
        .mockResolvedValueOnce([measurement]);

      const req = mockReq({
        clientId: "1",
      });

      const res = mockRes();

      await getMeasurements(req, res);

      expect(clientService.getMeasurements)
        .toHaveBeenCalledWith(1);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith([
        measurement,
      ]);
    });
  });


  describe("addMeasurement", () => {
    it("returns 400 if clientId invalid", async () => {
      (validateId as any).mockReturnValueOnce("Invalid ID");

      const req = mockReq({
        clientId: "abc",
      });

      const res = mockRes();

      await addMeasurement(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid ID",
      });
    });

    it("returns 400 if measurement invalid", async () => {
      (validateId as any).mockReturnValueOnce(null);

      (validateMeasurement as any)
        .mockReturnValueOnce("Invalid measurement");

      const req = mockReq(
        {
          clientId: "1",
        },
        {}
      );

      const res = mockRes();

      await addMeasurement(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid measurement",
      });
    });

    it("returns 404 if add fails", async () => {
      (validateId as any).mockReturnValueOnce(null);

      (validateMeasurement as any)
        .mockReturnValueOnce(null);

      (clientService.addMeasurement as any)
        .mockResolvedValueOnce(null);

      const req = mockReq(
        {
          clientId: "1",
        },
        measurement
      );

      const res = mockRes();

      await addMeasurement(req, res);

      expect(clientService.addMeasurement)
        .toHaveBeenCalledWith(1, measurement);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        message:
          "Client not found or measurement already exists",
      });
    });

    it("returns 201 when measurement added", async () => {
      (validateId as any).mockReturnValueOnce(null);

      (validateMeasurement as any)
        .mockReturnValueOnce(null);

      (clientService.addMeasurement as any)
        .mockResolvedValueOnce(measurement);

      const req = mockReq(
        {
          clientId: "1",
        },
        measurement
      );

      const res = mockRes();

      await addMeasurement(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith(
        measurement
      );
    });
  });


  describe("deleteMeasurement", () => {
    it("returns 400 if clientId invalid", async () => {
      (validateId as any).mockReturnValueOnce("Invalid client ID");

      const req = mockReq({
        clientId: "abc",
        measurementId: "1",
      });

      const res = mockRes();

      await deleteMeasurement(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid client ID",
      });
    });

    it("returns 400 if measurementId invalid", async () => {
      (validateId as any)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce("Invalid measurement ID");

      const req = mockReq({
        clientId: "1",
        measurementId: "abc",
      });

      const res = mockRes();

      await deleteMeasurement(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid measurement ID",
      });
    });

    it("returns 404 if delete fails", async () => {
      (validateId as any)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      (clientService.deleteMeasurement as any)
        .mockResolvedValueOnce(null);

      const req = mockReq({
        clientId: "1",
        measurementId: "1",
      });

      const res = mockRes();

      await deleteMeasurement(req, res);

      expect(clientService.deleteMeasurement)
        .toHaveBeenCalledWith(1, 1);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        message: "Client or measurement not found",
      });
    });

    it("returns 200 when measurement deleted", async () => {
      (validateId as any)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      (clientService.deleteMeasurement as any)
        .mockResolvedValueOnce(measurement);

      const req = mockReq({
        clientId: "1",
        measurementId: "1",
      });

      const res = mockRes();

      await deleteMeasurement(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(
        measurement
      );
    });
  });
});