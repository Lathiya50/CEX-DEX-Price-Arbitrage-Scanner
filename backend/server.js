//server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { binanceRoutes } from "./routes/binance.routes.js";
import { solanaRoutes } from "./routes/solana.routes.js";
import { arbitrageRoutes } from "./routes/arbitrage.routes.js";
import { initializeWebSocket } from "./websocket/wsHandler.js";
import {
  startPriceMonitor,
  startPricePredictionMonitor,
} from "./services/priceMonitor.js";
import { predictionRoutes } from "./routes/prediction.routes.js";

dotenv.config();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: "Too many requests, please try again later",
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Middleware
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/binance", binanceRoutes);
app.use("/api/solana", solanaRoutes);
app.use("/api/arbitrage", arbitrageRoutes);
app.use("/api/prediction", predictionRoutes);

// Initialize WebSocket handler
initializeWebSocket(wss);

// Start price monitoring service
startPriceMonitor();

// Start price prediction monitoring service
startPricePredictionMonitor();

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
