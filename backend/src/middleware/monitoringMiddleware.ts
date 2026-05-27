
export interface RequestLog {
  ip: string;
  method: string;
  path: string;
  timestamp: number;
  responseTimeMs: number;
  userAgent: string;
  statusCode: number;
}

const MAX_LOGS = 200;
export const requestLogs: RequestLog[] = [];

export function addLog(log: RequestLog) {
  requestLogs.push(log);
  if (requestLogs.length > MAX_LOGS) {
    requestLogs.shift();
  }
}

export function getLogsByIp(): Record<string, RequestLog[]> {
  const grouped: Record<string, RequestLog[]> = {};
  for (const log of requestLogs) {
    if (!grouped[log.ip]) grouped[log.ip] = [];
    grouped[log.ip]!.push(log);
  }
  return grouped;
}

import { Request, Response, NextFunction } from "express";

export function monitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";

  res.on("finish", () => {
    addLog({
      ip,
      method: req.method,
      path: req.path,
      timestamp: Date.now(),
      responseTimeMs: Date.now() - start,
      userAgent: req.headers["user-agent"] || "unknown",
      statusCode: res.statusCode,
    });
  });

  next();
}
