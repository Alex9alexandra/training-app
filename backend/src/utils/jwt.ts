import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret-key";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret";

export function generateToken(payload: {
  id: number;
  username: string;
  role: string;
  permissions: string[];
  clientId: number | null;
}) {
  return jwt.sign(payload, SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: number) {
  return jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as { id: number };
}

export function generateTempToken(payload: { id: number }): string {
  return jwt.sign(payload, process.env.JWT_SECRET + "_temp", { expiresIn: "5m" }); 
}

export function verifyTempToken(token: string): { id: number } {
  return jwt.verify(token, process.env.JWT_SECRET + "_temp") as { id: number };
}