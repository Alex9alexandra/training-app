import { WebSocketServer } from "ws";

let wss: WebSocketServer;

export function initWebSocket(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

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