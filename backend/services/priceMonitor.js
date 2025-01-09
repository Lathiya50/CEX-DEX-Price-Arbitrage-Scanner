// services/priceMonitor.js
import Binance from "binance-api-node";
import { Connection, PublicKey } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import { calculateArbitrageOpportunity } from "../utils/arbitrage.js";
import { PriceData } from "../models/PriceData.js";
import { broadcastToClients } from "../websocket/wsHandler.js";
import { DataProcessor } from "./dataProcessor.js";
import { PredictionModel } from "./predictionModel.js";
import { Prediction } from "../models/Prediction.js";
import updateQueue from "./updateQueue.js";

const esmBinanceHack = Binance.default;

const SYMBOLS = ["BTCUSDC", "ETHUSDC", "SOLUSDC"];
const models = new Map();

const createBinanceClient = (apiKey, apiSecret) => {
  return esmBinanceHack({
    apiKey,
    apiSecret,
    options: {
      reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: true,
      },
      wsOptions: {
        timeout: 60000,
      },
    },
  });
};

const binanceClients = [
  createBinanceClient(
    process.env.BINANCE_API_KEY,
    process.env.BINANCE_API_SECRET
  ),
];

let currentClientIndex = 0;
const getCurrentClient = () => {
  const client = binanceClients[currentClientIndex];
  currentClientIndex = (currentClientIndex + 1) % binanceClients.length;
  return client;
};

const solanaConnection = new Connection(process.env.SOLANA_RPC_URL);

async function processTradeUpdate(trade) {
  const { symbol, price } = trade;

  try {
    const solanaDexPrice = await getSolanaDexPrice(symbol);

    const opportunity = calculateArbitrageOpportunity({
      binancePrice: parseFloat(price),
      dexPrice: solanaDexPrice,
      symbol,
      binanceFees: 0.001,
      dexFees: 0.003,
      networkFees: 0.000005,
    });

    if (opportunity.isProfitable) {
      await PriceData.create({
        symbol,
        binancePrice: parseFloat(price),
        dexPrice: solanaDexPrice,
        profitPercentage: opportunity.profitPercentage,
        timestamp: new Date(),
      });

      broadcastToClients({
        type: "ARBITRAGE_OPPORTUNITY",
        data: opportunity,
      });
    }
  } catch (error) {
    if (error.message?.includes("Too many requests")) {
      await new Promise((resolve) => setTimeout(resolve, 60000));
      throw new Error(`Rate limit hit for ${symbol}: ${error.message}`);
    }
    throw error;
  }
}

export const startPriceMonitor = async () => {
  let streams = [];

  const initializeStream = async (symbol) => {
    const client = getCurrentClient();

    try {
      const stream = await client.ws.trades([symbol], (trade) => {
        updateQueue.add(trade);
      });

      streams.push(stream);
      console.log(`Stream initialized for ${symbol}`);
    } catch (error) {
      console.error(`Failed to initialize stream for ${symbol}:`, error);
      await new Promise((resolve) => setTimeout(resolve, 30000));
      await initializeStream(symbol);
    }
  };

  for (const symbol of SYMBOLS) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await initializeStream(symbol);
  }
};

const getSolanaDexPrice = async (symbol) => {
  try {
    const marketAddress = getMarketAddress(symbol);
    const market = await Market.load(
      solanaConnection,
      new PublicKey(marketAddress),
      {},
      new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")
    );

    // Get asks and bids separately
    const asks = await market.loadAsks(solanaConnection);
    const bids = await market.loadBids(solanaConnection);

    // Get best ask and bid prices
    const bestAsk = asks.getL2(1)[0]?.[0] || 0;
    const bestBid = bids.getL2(1)[0]?.[0] || 0;

    return (bestAsk + bestBid) / 2;
  } catch (error) {
    console.error("Error fetching Solana DEX price:", error);
    throw error;
  }
};

const getMarketAddress = (symbol) => {
  const marketAddresses = {
    BTCUSDC: process.env.SOL_BTC_USDC_MARKET,
    ETHUSDC: process.env.SOL_ETH_USDC_MARKET,
    SOLUSDC: process.env.SOL_SOL_USDC_MARKET,
  };
  return marketAddresses[symbol];
};

export const startPricePredictionMonitor = async () => {
  // Initialize models for each symbol
  for (const symbol of SYMBOLS) {
    const model = new PredictionModel();
    model.createModel();
    models.set(symbol, model);

    // Initial training
    await trainModel(symbol, model);
  }

  // Start monitoring
  setInterval(monitorPrices, 5000);
  monitorPrices(); // Initial run
};

const trainModel = async (symbol, model) => {
  try {
    const processor = new DataProcessor(symbol);
    const historicalData = await processor.fetchHistoricalData();
    const trainingData = processor.prepareTrainingData(historicalData);

    const features = trainingData.map((d) => [
      d.normalized_returns,
      d.normalized_volatility,
      d.normalized_ma7,
      d.normalized_ma25,
      d.normalized_rsi,
    ]);

    const labels = trainingData.map((d) => d.target).filter((t) => t !== null);

    await model.train(features.slice(0, -1), labels);
    console.log(`Model trained for ${symbol}`);
  } catch (error) {
    console.error(`Error training model for ${symbol}:`, error);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await trainModel(symbol, model);
  }
};

const monitorPrices = async () => {
  for (const symbol of SYMBOLS) {
    try {
      const model = models.get(symbol);
      const processor = new DataProcessor(symbol);

      // Get latest data
      const historicalData = await processor.fetchHistoricalData(100);
      const processedData = processor.prepareTrainingData(historicalData);
      const latestData = processedData[processedData.length - 1];

      // Generate prediction
      const features = [
        latestData.normalized_returns,
        latestData.normalized_volatility,
        latestData.normalized_ma7,
        latestData.normalized_ma25,
        latestData.normalized_rsi,
      ];

      const confidence = await model.predict(features);
      const predictedDirection = confidence > 0.5;

      // Save prediction
      const prediction = await Prediction.create({
        symbol,
        timestamp: new Date(),
        predictedDirection,
        confidence,
        currentPrice: latestData.close,
        metrics: {
          returns: latestData.returns,
          volatility: latestData.volatility,
          ma7: latestData.ma7,
          ma25: latestData.ma25,
          rsi: latestData.rsi,
        },
        modelVersion: "1.0.0",
      });

      // Broadcast to WebSocket clients
      broadcastToClients({
        type: "NEW_PREDICTION",
        data: prediction,
      });

      console.log(
        `Generated prediction for ${symbol}: ${confidence.toFixed(4)}`
      );
    } catch (error) {
      console.error(`Error monitoring ${symbol}:`, error);
    }
  }
};
