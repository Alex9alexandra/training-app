import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import app from "./app";
import https from "https";
import fs from "fs";
import { initWebSocket } from "./service/websocket";

const PORT = 3000;

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on https://192.168.0.102:${PORT}`);
});