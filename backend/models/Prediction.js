// models/Prediction.js
import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  predictedDirection: {
    type: Boolean,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  actualDirection: {
    type: Boolean,
    default: null,
  },
  metrics: {
    returns: Number,
    volatility: Number,
    ma7: Number,
    ma25: Number,
    rsi: Number,
  },
  modelVersion: {
    type: String,
    required: true,
  },
  backtest: {
    accuracy: Number,
    pnl: Number,
  },
});

// Create compound indexes for efficient querying
predictionSchema.index({ symbol: 1, timestamp: -1 });
predictionSchema.index({ symbol: 1, modelVersion: 1 });

export const Prediction = mongoose.model("Prediction", predictionSchema);
