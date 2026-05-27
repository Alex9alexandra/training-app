import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import clientRoutes from "./routes/clientRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import cors from "cors";
import statisticsRoutes from "./routes/statisticsRoutes";
import generatorRoutes from "./routes/generatorRoutes";
import measurementRoutes from "./routes/measurementRoutes";
import authRoutes from "./routes/authRoutes";
import { connectMongo } from "./service/mongodb";
import chatRoutes from "./routes/chatRoutes";
import groupClassRoutes from "./routes/groupClassRoutes";
import { monitoringMiddleware } from "./middleware/monitoringMiddleware";
import monitoringRoutes from "./routes/monitoringRoutes";

const app = express();
app.use(monitoringMiddleware);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.use("/clients", clientRoutes);
app.use("/clients", workoutRoutes);
app.use("/clients", exerciseRoutes);
app.use("/statistics", statisticsRoutes);
app.use("/generator", generatorRoutes);
app.use("/clients",measurementRoutes);
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

app.use("/group-classes", groupClassRoutes);
app.use("/monitoring", monitoringRoutes);
app.get('/ping', (req, res) => {
  res.json({ok:true});
});

connectMongo();

export default app;