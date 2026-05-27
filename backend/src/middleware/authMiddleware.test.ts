import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";

import { authMiddleware } from "./authMiddleware";
import * as jwt from "../utils/jwt";

vi.mock("../utils/jwt", () => ({
  verifyToken: vi.fn(),
}));

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("authMiddleware", () => {

  it("returns 401 if no header", () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 if invalid format", () => {
    const req = { headers: { authorization: "Invalid" } } as Request;
    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 if token invalid", () => {
    (jwt.verifyToken as any).mockImplementation(() => {
      throw new Error();
    });

    const req = {
      headers: { authorization: "Bearer token" }
    } as Request;

    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("calls next if token valid", () => {
    (jwt.verifyToken as any).mockReturnValue({ id: 1 });

    const req: any = {
      headers: { authorization: "Bearer token" }
    };

    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: 1 });
    expect(next).toHaveBeenCalled();
  });
});