// routes/solana.routes.js
import express from "express";
import {
  getSolanaPrices,
  getSolanaMarkets,
  getMarketDepth,
} from "../controllers/solana.controller.js";

const router = express.Router();

router.get("/prices", getSolanaPrices);
router.get("/markets", getSolanaMarkets);
router.get("/depth/:market", getMarketDepth);

export const solanaRoutes = router;
