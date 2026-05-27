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

  it("getAllClients returns paginated data", async () => {
    (clientService.getAllClients as any).mockResolvedValueOnce([
      { id: 1 }, { id: 2 }, { id: 3 },
    ]);

    const req = { query: { page: "1", limit: "2" } } as unknown as Request;
    const res = mockRes();

    await getAllClients(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ id: 1 }, { id: 2 }],
        total: 3,
        page: 1,
      })
    );
  });

  it("getAllClients returns 400 for invalid page", async () => {
    const req = { query: { page: "-1", limit: "2" } } as unknown as Request;
    const res = mockRes();

    await getAllClients(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getAllClients returns 400 for invalid limit", async () => {
    const req = { query: { page: "1", limit: "0" } } as unknown as Request;
    const res = mockRes();

    await getAllClients(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getClient returns 400 if id invalid", async () => {
    (validateId as any).mockReturnValue("invalid id");

    const req = { params: { id: "abc" } } as any;
    const res = mockRes();

    await getClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getClient returns 404 if not found", async () => {
    (validateId as any).mockReturnValue(null);
    (clientService.getClient as any).mockResolvedValueOnce(null);

    const req = { params: { id: "1" } } as any;
    const res = mockRes();

    await getClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("getClient returns client if found", async () => {
    (validateId as any).mockReturnValue(null);
    (clientService.getClient as any).mockResolvedValueOnce({ id: 1 });

    const req = { params: { id: "1" } } as any;
    const res = mockRes();

    await getClient(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("addClient returns 400 if validation fails", async () => {
    (validateClient as any).mockReturnValue("error");

    const req = { body: {} } as any;
    const res = mockRes();

    await addClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("addClient returns 201 when successful", async () => {
    (validateClient as any).mockReturnValue(null);
    (clientService.addClient as any).mockResolvedValueOnce({ id: 1 });

    const req = { body: { name: "A" } } as any;
    const res = mockRes();

    await addClient(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("updateClient returns 400 for invalid id", async () => {
    (validateId as any).mockReturnValue("error");

    const req = { params: { id: "x" }, body: {} } as any;
    const res = mockRes();

    await updateClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updateClient returns 400 for invalid body", async () => {
    (validateId as any).mockReturnValue(null);
    (validateClient as any).mockReturnValue("error");

    const req = { params: { id: "1" }, body: {} } as any;
    const res = mockRes();

    await updateClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updateClient returns 404 if not found", async () => {
    (validateId as any).mockReturnValue(null);
    (validateClient as any).mockReturnValue(null);
    (clientService.updateClient as any).mockResolvedValueOnce(false);

    const req = { params: { id: "1" }, body: { id: 1 } } as any;
    const res = mockRes();

    await updateClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updateClient returns updated client", async () => {
    (validateId as any).mockReturnValue(null);
    (validateClient as any).mockReturnValue(null);
    (clientService.updateClient as any).mockResolvedValueOnce(true);

    const req = { params: { id: "1" }, body: { id: 1 } } as any;
    const res = mockRes();

    await updateClient(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("deleteClient returns 400 for invalid id", async () => {
    (validateId as any).mockReturnValue("error");

    const req = { params: { id: "x" } } as any;
    const res = mockRes();

    await deleteClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deleteClient returns 404 if not found", async () => {
    (validateId as any).mockReturnValue(null);
    (clientService.deleteClient as any).mockResolvedValueOnce(null);

    const req = { params: { id: "1" } } as any;
    const res = mockRes();

    await deleteClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deleteClient returns 200 when successful", async () => {
    (validateId as any).mockReturnValue(null);
    (clientService.deleteClient as any).mockResolvedValueOnce({ id: 1 });

    const req = { params: { id: "1" } } as any;
    const res = mockRes();

    await deleteClient(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });
});
