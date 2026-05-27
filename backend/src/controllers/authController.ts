import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken,generateRefreshToken,verifyRefreshToken,generateTempToken,verifyTempToken } from "../utils/jwt";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
      client: true
    }
  });

  const passwordMatch = user && await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const tempToken = generateTempToken({ id: user.id });

  return res.status(200).json({
    tempToken,
    securityQuestion: user.securityQuestion
  });
};

export const register = async (req: Request, res: Response) => {
  const { username, password, age, email, securityQuestion, securityAnswer, pin } = req.body;

  if (!username || !password || !age || !email || !securityQuestion || !securityAnswer || !pin) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ message: "PIN must be exactly 4 digits" });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return res.status(409).json({ message: "Username already taken" });
  }

  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
  const hashedPin = await bcrypt.hash(pin, 10);
  const userRole = await prisma.role.findUnique({ where: { name: "user" } });
  if (!userRole) {
    return res.status(500).json({ message: "Default role not found" });
  }

  const client = await prisma.client.create({
    data: { name: username, age: parseInt(age) }
  });

  const user = await prisma.user.create({
    data: { 
      username, 
      password: hashed,
      email,
      securityQuestion,
      securityAnswer: hashedAnswer,
      pin:hashedPin,
      roleId: userRole.id, 
      clientId: client.id 
    },
    include: {
      role: { include: { permissions: { include: { permission: true } } } }
    }
  });

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role.name,
    permissions: user.role.permissions.map((rp: any) => rp.permission.name),
    clientId: client.id
  });

  return res.status(201).json({ 
    token,
    refreshToken: generateRefreshToken(user.id),
    id: user.id,
    username: user.username,
    role: user.role.name,
    permissions: user.role.permissions.map((rp: any) => rp.permission.name),
    clientId: client.id
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: { include: { permissions: { include: { permission: true } } } }
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newToken = generateToken({
      id: user.id,
      username: user.username,
      role: user.role.name,
      permissions: user.role.permissions.map((rp: any) => rp.permission.name),
      clientId: user.clientId ?? null
    });

    return res.status(200).json({ token: newToken });
  } catch {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const verifySecurityQuestion = async (req: Request, res: Response) => {
  const { tempToken, securityAnswer } = req.body;

  if (!tempToken || !securityAnswer) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const decoded = verifyTempToken(tempToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: { include: { permissions: { include: { permission: true } } } }
      }
    });

    if (!user || !user.securityAnswer) {
      return res.status(401).json({ message: "User not found" });
    }

    const answerMatch = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(),
      user.securityAnswer
    );

    if (!answerMatch) {
      return res.status(401).json({ message: "Incorrect security answer" });
    }

    const newTempToken = generateTempToken({ id: user.id }); 
    return res.status(200).json({ tempToken: newTempToken }); 
  } catch {
    return res.status(401).json({ message: "Invalid or expired temp token" });
  }
};

export const forgotPasswordStep1 = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "No account found with that email" });
  }

  const tempToken = generateTempToken({ id: user.id });

  return res.status(200).json({
    tempToken,
    securityQuestion: user.securityQuestion
  });
};

export const forgotPasswordStep2 = async (req: Request, res: Response) => {
  const { tempToken, securityAnswer } = req.body;

  if (!tempToken || !securityAnswer) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const decoded = verifyTempToken(tempToken);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.securityAnswer) {
      return res.status(401).json({ message: "User not found" });
    }

    const answerMatch = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(),
      user.securityAnswer
    );

    if (!answerMatch) {
      return res.status(401).json({ message: "Incorrect security answer" });
    }

    const resetToken = generateTempToken({ id: user.id });

    return res.status(200).json({ resetToken });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const forgotPasswordStep3 = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const decoded = verifyTempToken(resetToken);

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashed }
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const verifyPin = async (req: Request, res: Response) => {
  const { tempToken, pin } = req.body;

  if (!tempToken || !pin) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ message: "PIN must be exactly 4 digits" });
  }

  try {
    const decoded = verifyTempToken(tempToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: { include: { permissions: { include: { permission: true } } } }
      }
    });

    if (!user || !user.pin) {
      return res.status(401).json({ message: "User not found" });
    }

    const pinMatch = await bcrypt.compare(pin, user.pin);
    if (!pinMatch) {
      return res.status(401).json({ message: "Incorrect PIN" });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role.name,
      permissions: user.role.permissions.map((rp: any) => rp.permission.name),
      clientId: user.clientId ?? null
    });

    return res.status(200).json({
      token,
      refreshToken: generateRefreshToken(user.id),
      id: user.id,
      username: user.username,
      role: user.role.name,
      permissions: user.role.permissions.map((rp: any) => rp.permission.name),
      clientId: user.clientId ?? null
    });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
