import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js"; // Note le .js
import candidateRoutes from "./routes/candidate.route.js";
const app = express();

// MIDDLEWARES (Ordre important)
app.use(cors());
app.use(express.json()); // <--- Remplis req.body
app.use(cookieParser());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
const PORT = 3200;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});