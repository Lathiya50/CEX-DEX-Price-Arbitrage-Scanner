// models/PriceData.js
import mongoose from "mongoose";

const priceDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true,
  },
  binancePrice: {
    type: Number,
    required: true,
  },
  dexPrice: {
    type: Number,
    required: true,
  },
  profitPercentage: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create compound index for efficient querying
priceDataSchema.index({ symbol: 1, timestamp: -1 });

export const PriceData = mongoose.model("PriceData", priceDataSchema);
