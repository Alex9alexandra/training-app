import express from "express";
import clientRoutes from "./routes/clientRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/clients", clientRoutes);
app.use("/clients", workoutRoutes);
app.use("/clients", exerciseRoutes);

export default app;