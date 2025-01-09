// controllers/prediction.controller.js
import { DataProcessor } from "../services/dataProcessor.js";
import { PredictionModel } from "../services/predictionModel.js";
import { Prediction } from "../models/Prediction.js";
import { broadcastToClients } from "../websocket/wsHandler.js";

const modelInstances = new Map();
const MODEL_VERSION = "1.0.0";

export const initializeModel = async (symbol) => {
  if (!modelInstances.has(symbol)) {
    const model = new PredictionModel();
    model.createModel();
    modelInstances.set(symbol, model);

    // Train model with historical data
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

    const labels = trainingData.map((d) => d.target);

    await model.train(features, labels);
  }
  return modelInstances.get(symbol);
};

export const getPredictions = async (req, res) => {
  try {
    const { symbol, startTime, endTime, limit = 100 } = req.query;

    const query = {
      symbol,
      ...(startTime && endTime
        ? {
            timestamp: {
              $gte: new Date(startTime),
              $lte: new Date(endTime),
            },
          }
        : {}),
    };

    const predictions = await Prediction.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generatePrediction = async (req, res) => {
  try {
    const { symbol } = req.params;
    const model = await initializeModel(symbol);
    const processor = new DataProcessor(symbol);

    // Fetch latest data
    const data = await processor.fetchHistoricalData();
    const processedData = processor.prepareTrainingData(data);
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
      modelVersion: MODEL_VERSION,
    });

    // Broadcast to WebSocket clients
    broadcastToClients({
      type: "NEW_PREDICTION",
      data: prediction,
    });

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const runBacktest = async (req, res) => {
  try {
    const { symbol, startTime, endTime } = req.query;
    const model = await initializeModel(symbol);
    const processor = new DataProcessor(symbol);

    // Fetch historical data for backtesting
    const historicalData = await processor.fetchHistoricalData();
    const processedData = processor.prepareTrainingData(historicalData);

    // Run backtest
    const backtestResults = await model.backtest(processedData);

    res.json(backtestResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getModelStats = async (req, res) => {
  try {
    const stats = await Prediction.aggregate([
      {
        $match: {
          actualDirection: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$symbol",
          totalPredictions: { $sum: 1 },
          correctPredictions: {
            $sum: {
              $cond: [
                { $eq: ["$predictedDirection", "$actualDirection"] },
                1,
                0,
              ],
            },
          },
          avgConfidence: { $avg: "$confidence" },
        },
      },
      {
        $project: {
          symbol: "$_id",
          accuracy: {
            $multiply: [
              { $divide: ["$correctPredictions", "$totalPredictions"] },
              100,
            ],
          },
          totalPredictions: 1,
          correctPredictions: 1,
          avgConfidence: 1,
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
