import app from "./app";
import http from "http";
import { initWebSocket } from "./service/websocket";
const PORT=3000;
const server=http.createServer(app);
initWebSocket(server);
server.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});