import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import {
  getAllClients,
  getClient,
  addClient,
  updateClient,
  deleteClient,
} from "./clientController";

vi.mock("../service/clientServiceInstance", () => ({
  clientService: {
    getAllClients: vi.fn(),
    getClient: vi.fn(),
    addClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
  },
}));

import { clientService } from "../service/clientServiceInstance";

vi.mock("../validators/clientValidators", () => ({
  validateClient: vi.fn(),
}));

vi.mock("../validators/idValidators", () => ({
  validateId: vi.fn(),
}));

import { validateClient } from "../validators/clientValidators";
import { validateId } from "../validators/idValidators";

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("Client Controller - FULL COVERAGE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it("getAllClients returns paginated data", () => {
    (clientService.getAllClients as any).mockReturnValue([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);

    const req = {
      query: { page: "1", limit: "2" },
    } as unknown as Request;

    const res = mockRes();

    getAllClients(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ id: 1 }, { id: 2 }],
        total: 3,
        page: 1,
      })
    );
  });

  it("getAllClients returns 400 for invalid page", () => {
    const req = {
      query: { page: "-1", limit: "2" },
    } as unknown as Request;

    const res = mockRes();

    getAllClients(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getAllClients returns 400 for invalid limit", () => {
    const req = {
      query: { page: "1", limit: "0" },
    } as unknown as Request;

    const res = mockRes();

    getAllClients(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getClient returns 400 if id invalid", () => {
    (validateId as any).mockReturnValue("invalid id");

    const req = { params: { id: "abc" } } as any;
    const res = mockRes();

    getClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getClient returns 404 if not found", () => {
    (validateId as any).mockReturnValue(null);
    (clientService.getClient as any).mockReturnValue(null);

    const req = { params: { id: "1" } } as any;
    const res = mockRes();

    getClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("getClient returns client if found", () => {
    (validateId as any).mockReturnValue(null);
    (clientService.getClient as any).mockReturnValue({ id: 1 });

    const req = { params: { id: "1" } } as any;
    const res = mockRes();

    getClient(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("addClient returns 400 if validation fails", () => {
    (validateClient as any).mockReturnValue("error");

    const req = { body: {} } as any;
    const res = mockRes();

    addClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("addClient returns 201 when successful", () => {
    (validateClient as any).mockReturnValue(null);
    (clientService.addClient as any).mockReturnValue({ id: 1 });

    const req = { body: { name: "A" } } as any;
    const res = mockRes();

    addClient(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("updateClient returns 400 for invalid id", () => {
    (validateId as any).mockReturnValue("error");

    const req = { params: { id: "x" }, body: {} } as any;
    const res = mockRes();

    updateClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updateClient returns 400 for invalid body", () => {
    (validateId as any).mockReturnValue(null);
    (validateClient as any).mockReturnValue("error");

    const req = { params: { id: "1" }, body: {} } as any;
    const res = mockRes();

    updateClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updateClient returns 404 if not found", () => {
    (validateId as any).mockReturnValue(null);
    (validateClient as any).mockReturnValue(null);
    (clientService.updateClient as any).mockReturnValue(false);

    const req = { params: { id: "1" }, body: { id: 1 } } as any;
    const res = mockRes();

    updateClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updateClient returns updated client", () => {
    (validateId as any).mockReturnValue(null);
    (validateClient as any).mockReturnValue(null);
    (clientService.updateClient as any).mockReturnValue(true);

    const req = { params: { id: "1" }, body: { id: 1 } } as any;
    const res = mockRes();

    updateClient(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("deleteClient returns 400 for invalid id", () => {
    (validateId as any).mockReturnValue("error");

    const req = { params: { id: "x" } } as any;
    const res = mockRes();

    deleteClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deleteClient returns 404 if not found", () => {
    (validateId as any).mockReturnValue(null);
    (clientService.deleteClient as any).mockReturnValue(null);

    const req = { params: { id: "1" } } as any;
    const res = mockRes();

    deleteClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deleteClient returns 200 when successful", () => {
    (validateId as any).mockReturnValue(null);
    (clientService.deleteClient as any).mockReturnValue({ id: 1 });

    const req = { params: { id: "1" } } as any;
    const res = mockRes();

    deleteClient(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });
}); 