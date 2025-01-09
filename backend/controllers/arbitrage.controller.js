// controllers/arbitrage.controller.js
import { PriceData } from "../models/PriceData.js";

export const getArbitrageOpportunities = async (req, res) => {
  try {
    const opportunities = await PriceData.find({
      profitPercentage: { $gt: 0 },
    })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHistoricalOpportunities = async (req, res) => {
  try {
    const { symbol, startTime, endTime } = req.query;
    const query = {
      symbol,
      timestamp: {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      },
    };

    const data = await PriceData.find(query).sort({ timestamp: 1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await PriceData.aggregate([
      {
        $group: {
          _id: "$symbol",
          avgProfit: { $avg: "$profitPercentage" },
          maxProfit: { $max: "$profitPercentage" },
          totalOpportunities: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
