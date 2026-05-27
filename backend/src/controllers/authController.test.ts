import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";


vi.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
    },
    client: {
      create: vi.fn(),
    },
  };

  return {
    PrismaClient: class {
      user = mockPrisma.user;
      role = mockPrisma.role;
      client = mockPrisma.client;
    },
    __mockPrisma: mockPrisma,
  };
});


vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("../utils/jwt", () => ({
  generateToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  generateTempToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
  verifyTempToken: vi.fn(),
}));

import * as prismaModule from "@prisma/client";
import bcrypt from "bcrypt";
import * as jwt from "../utils/jwt";

import {
  login,
  register,
  refresh,
  verifySecurityQuestion,
  forgotPasswordStep1,
  forgotPasswordStep2,
  forgotPasswordStep3,
  verifyPin,
} from "./authController";

const mockPrisma = (prismaModule as any).__mockPrisma;


const mockReq = (body: any): Request =>
  ({ body } as Request);

const mockRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};


describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it("login → 400 missing fields", async () => {
    const res = mockRes();
    await login(mockReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("login → 401 user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = mockRes();
    await login(mockReq({ username: "u", password: "p" }), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("login → 401 wrong password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ password: "hash" });
    (bcrypt.compare as any).mockResolvedValue(false);

    const res = mockRes();
    await login(mockReq({ username: "u", password: "p" }), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("login → success", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      password: "hash",
      securityQuestion: "Pet?",
    });

    (bcrypt.compare as any).mockResolvedValue(true);
    (jwt.generateTempToken as any).mockReturnValue("temp");

    const res = mockRes();
    await login(mockReq({ username: "u", password: "p" }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      tempToken: "temp",
      securityQuestion: "Pet?",
    });
  });

  it("register → 400 missing fields", async () => {
    const res = mockRes();
    await register(mockReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("register → invalid PIN", async () => {
    const res = mockRes();
    await register(mockReq({ pin: "12" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("register → username exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({});

    const res = mockRes();
    await register(mockReq({
      username: "u",
      password: "p",
      age: 20,
      email: "e",
      securityQuestion: "q",
      securityAnswer: "a",
      pin: "1234"
    }), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("register → success", async () => {
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    (bcrypt.hash as any).mockResolvedValue("hashed");

    mockPrisma.role.findUnique.mockResolvedValue({ id: 1, name: "user" });
    mockPrisma.client.create.mockResolvedValue({ id: 10 });

    mockPrisma.user.create.mockResolvedValue({
      id: 1,
      username: "u",
      role: { name: "user", permissions: [] },
    });

    (jwt.generateToken as any).mockReturnValue("token");
    (jwt.generateRefreshToken as any).mockReturnValue("refresh");

    const res = mockRes();

    await register(mockReq({
      username: "u",
      password: "p",
      age: 20,
      email: "e",
      securityQuestion: "q",
      securityAnswer: "a",
      pin: "1234"
    }), res);

    expect(res.status).toHaveBeenCalledWith(201);
  });


  it("refresh → missing token", async () => {
    const res = mockRes();
    await refresh(mockReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("refresh → invalid token", async () => {
    (jwt.verifyRefreshToken as any).mockImplementation(() => { throw new Error(); });

    const res = mockRes();
    await refresh(mockReq({ refreshToken: "bad" }), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });


  it("verifySecurityQuestion → wrong answer", async () => {
    (jwt.verifyTempToken as any).mockReturnValue({ id: 1 });

    mockPrisma.user.findUnique.mockResolvedValue({
      securityAnswer: "hash",
      role: { permissions: [] },
    });

    (bcrypt.compare as any).mockResolvedValue(false);

    const res = mockRes();

    await verifySecurityQuestion(
      mockReq({ tempToken: "t", securityAnswer: "wrong" }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
  });


  it("forgotStep1 → no email", async () => {
    const res = mockRes();
    await forgotPasswordStep1(mockReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("forgotStep1 → user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = mockRes();
    await forgotPasswordStep1(mockReq({ email: "e" }), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("verifyPin → invalid pin format", async () => {
    const res = mockRes();
    await verifyPin(mockReq({ tempToken: "t", pin: "12" }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("verifyPin → wrong pin", async () => {
    (jwt.verifyTempToken as any).mockReturnValue({ id: 1 });

    mockPrisma.user.findUnique.mockResolvedValue({
      pin: "hash",
      role: { permissions: [] },
    });

    (bcrypt.compare as any).mockResolvedValue(false);

    const res = mockRes();
    await verifyPin(mockReq({ tempToken: "t", pin: "1234" }), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  
});

