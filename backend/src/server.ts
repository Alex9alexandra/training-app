import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import app from "./app";
import http from "http";
import { initWebSocket } from "./service/websocket";

const PORT = parseInt(process.env.PORT || "3000");

const server = http.createServer(app);

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});