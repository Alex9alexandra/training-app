import app from "../app";
import { repo } from "../service/clientServiceInstance";
import { startGenerator } from "../service/generatorService";
import { stopGenerator } from "../service/generatorService";
import {broadcast} from "../service/websocket";

app.post("/generator/start", (req, res) => {
  startGenerator(repo, broadcast );
  res.send("started");
});

app.post("/generator/stop", (req, res) => {
  stopGenerator();
  res.send("stopped");
});