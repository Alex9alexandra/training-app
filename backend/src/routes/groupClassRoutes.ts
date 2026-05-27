import { Router, Request, Response } from "express";
import { GroupClassRepo } from "../repository/GroupClassRepo";

const router = Router();
const repo = new GroupClassRepo();

router.get("/stats-naive", async (req: Request, res: Response) => {
  try {
    const start = Date.now();
    const data = await repo.getClassStatsNaive();
    const ms = Date.now() - start;

    res.json({
      durationMs: ms,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch naive stats" });
  }
});

router.get("/stats-optimized", async (req: Request, res: Response) => {
  try {
    const start = Date.now();
    const result = await repo.getClassStatsOptimized();
    const ms = Date.now() - start;

    res.json({
      durationMs: ms,
      fromCache: result.fromCache,
      count: result.data.length,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch optimized stats" });
  }
});

export default router;
