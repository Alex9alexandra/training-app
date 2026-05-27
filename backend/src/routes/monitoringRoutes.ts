
import { Router, Request, Response } from "express";
import { requestLogs, getLogsByIp } from "../middleware/monitoringMiddleware";
import https from "https";
import fetch from "node-fetch";

const router = Router();

router.get("/logs", (req: Request, res: Response) => {
  const byIp = getLogsByIp();
  const summary = Object.entries(byIp).map(([ip, logs]) => ({
    ip,
    totalRequests: logs.length,
    uniquePaths: [...new Set(logs.map((l) => l.path))],
    timeSpanSeconds:
      logs.length < 2
        ? 0
        : Math.round((logs[logs.length - 1]!.timestamp - logs[0]!.timestamp) / 1000),
    logs,
  }));

  res.json({
    totalLogged: requestLogs.length,
    byIp: summary,
  });
});

router.get("/analyse", async (req: Request, res: Response) => {
  try {
    const byIp = getLogsByIp();

    const summaries = Object.entries(byIp).map(([ip, logs]) => {
      const paths = logs.map((l) => l.path);
      const uniquePaths = [...new Set(paths)];
      const timeSpanMs =
        logs.length < 2
          ? 0
          : logs[logs.length - 1]!.timestamp - logs[0]!.timestamp;
      const requestsPerSecond =
        timeSpanMs > 0 ? ((logs.length / timeSpanMs) * 1000).toFixed(2) : "N/A";
      const failedLogins = logs.filter(
        (l) => l.path.includes("/auth/login") && l.statusCode === 401
      ).length;

      return {
        ip,
        totalRequests: logs.length,
        uniqueEndpointsHit: uniquePaths.length,
        endpointsHit: uniquePaths,
        requestsPerSecond,
        failedLoginAttempts: failedLogins,
        timeSpanSeconds: Math.round(timeSpanMs / 1000),
      };
    });

    const prompt = `
You are a cybersecurity AI monitoring a fitness web application.
Analyse the following HTTP request logs grouped by IP address and identify any suspicious behaviour.

For each IP, decide if the behaviour is:
- NORMAL: typical user browsing
- SUSPICIOUS: unusual patterns like rapid requests, mass data scraping, repeated login attempts
- MALICIOUS: clear attack patterns like credential stuffing, DDoS, data harvesting

Request log summary:
${JSON.stringify(summaries, null, 2)}

For each IP address provide:
1. A verdict: NORMAL, SUSPICIOUS, or MALICIOUS
2. A brief reason (1-2 sentences)
3. A recommended action (e.g. monitor, rate-limit, block)

Be concise and specific. Reference the actual numbers from the data.
`;

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt,
        stream: false,
      }),
    } as any);

    if (!ollamaRes.ok) {
      return res.status(500).json({ error: "Ollama request failed", details: await ollamaRes.text() });
    }

    const ollamaData = await ollamaRes.json() as any;

    return res.json({
      analysedAt: new Date().toISOString(),
      totalIpsAnalysed: summaries.length,
      logSummary: summaries,
      aiAnalysis: ollamaData.response,
    });
  } catch (err) {
    console.error("[Monitoring] Analysis error:", err);
    res.status(500).json({ error: "Analysis failed", details: String(err) });
  }
});

export default router;
