import { Request, Response } from "express";
import { getDb } from "../service/mongodb";

export async function getMessages(req: Request, res: Response) {
  try {
    const db = getDb();
    console.log("DB:", db); 
    const messages = await db
      .collection("messages")
      .find()
      .sort({ timestamp: 1 })
      .limit(100)
      .toArray();
    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}