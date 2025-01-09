// routes/binance.routes.js

import express from "express";
import {
  getBinancePrices,
  getBinanceBalance,
  getTradingPairs,
} from "../controllers/binance.controller.js";

const router = express.Router();

router.get("/prices", getBinancePrices);
router.get("/balance", getBinanceBalance);
router.get("/pairs", getTradingPairs);

export const binanceRoutes = router;
