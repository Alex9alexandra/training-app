import { Request, Response } from "express";
import { statisticsService } from "../service/statisticsServiceInstance";

export const getStatistics = (req: Request, res: Response) => {
  try {
    const stats = statisticsService.getStatistics();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error computing statistics" });
  }
};