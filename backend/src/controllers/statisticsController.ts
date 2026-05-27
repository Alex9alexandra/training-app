import { Request, Response } from "express";
import { clientService } from "../service/clientServiceInstance";

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const stats = await clientService.getStatistics();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error computing statistics" });
  }
};