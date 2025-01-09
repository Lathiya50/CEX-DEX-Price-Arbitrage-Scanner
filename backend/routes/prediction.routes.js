// routes/prediction.routes.js
import express from "express";
import {
  getPredictions,
  generatePrediction,
  runBacktest,
  getModelStats,
} from "../controllers/prediction.controller.js";

const router = express.Router();

router.get("/predictions", getPredictions);
router.post("/predict/:symbol", generatePrediction);
router.get("/backtest", runBacktest);
router.get("/stats", getModelStats);

export const predictionRoutes = router;
