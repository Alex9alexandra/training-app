import { WebSocketServer } from "ws";
import { getDb } from "./mongodb";

let wss: WebSocketServer;

export function initWebSocket(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    ws.on("message", async (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "CHAT_MESSAGE") {
          const message = {
            userId: msg.userId,
            username: msg.username,
            text: msg.text,
            timestamp: new Date(),
          };

          const db = getDb();
          await db.collection("messages").insertOne(message);

          broadcast({ type: "CHAT_MESSAGE", ...message });
        }
      } catch (err) {
        console.error("WS message error:", err);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
}

export function broadcast(message: any) {
  if (!wss) return;

  const data = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}