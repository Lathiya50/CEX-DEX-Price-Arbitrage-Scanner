// routes/arbitrage.routes.js
import express from "express";
import {
  getArbitrageOpportunities,
  getHistoricalOpportunities,
  getStats,
} from "../controllers/arbitrage.controller.js";

const router = express.Router();

router.get("/opportunities", getArbitrageOpportunities);
router.get("/historical", getHistoricalOpportunities);
router.get("/stats", getStats);

export const arbitrageRoutes = router;
