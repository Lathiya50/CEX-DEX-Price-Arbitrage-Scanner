// services/dataProcessor.js
import axios from "axios";

export class DataProcessor {
  constructor(symbol) {
    this.symbol = symbol;
    this.binanceBaseUrl = "https://api.binance.com/api/v3";
  }

  async fetchHistoricalData(limit = 1000) {
    try {
      const response = await axios.get(`${this.binanceBaseUrl}/klines`, {
        params: {
          symbol: this.symbol,
          interval: "1h",
          limit: limit,
        },
      });

      return response.data.map((candle) => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
      }));
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw error;
    }
  }

  prepareTrainingData(data) {
    const processed = [];

    for (let i = 25; i < data.length; i++) {
      const slice = data.slice(i - 25, i + 1);

      // Calculate technical indicators
      const returns = (slice[24].close - slice[23].close) / slice[23].close;
      const volatility = this.calculateVolatility(slice);
      const ma7 = this.calculateMA(slice.slice(-7));
      const ma25 = this.calculateMA(slice);
      const rsi = this.calculateRSI(slice);

      // Calculate target (1 if price went up in next period, 0 if down)
      const target =
        i < data.length - 1
          ? data[i + 1].close > data[i].close
            ? 1
            : 0
          : null;

      // Normalize features
      const normalized = {
        timestamp: slice[24].timestamp,
        close: slice[24].close,
        normalized_returns: this.normalize(returns, -0.1, 0.1),
        normalized_volatility: this.normalize(volatility, 0, 0.1),
        normalized_ma7: this.normalize(
          ma7,
          slice[24].close * 0.8,
          slice[24].close * 1.2
        ),
        normalized_ma25: this.normalize(
          ma25,
          slice[24].close * 0.8,
          slice[24].close * 1.2
        ),
        normalized_rsi: this.normalize(rsi, 0, 100),
        target,
      };

      processed.push(normalized);
    }

    return processed;
  }

  calculateVolatility(data, period = 14) {
    const returns = data
      .slice(-period)
      .map((candle, i, arr) =>
        i === 0 ? 0 : (candle.close - arr[i - 1].close) / arr[i - 1].close
      );

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const squaredDiffs = returns.map((r) => Math.pow(r - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / returns.length);
  }

  calculateMA(data) {
    return data.reduce((acc, candle) => acc + candle.close, 0) / data.length;
  }

  calculateRSI(data, period = 14) {
    const changes = data
      .slice(-period - 1)
      .map((candle, i, arr) => (i === 0 ? 0 : candle.close - arr[i - 1].close))
      .slice(1);

    const gains = changes.map((c) => (c > 0 ? c : 0));
    const losses = changes.map((c) => (c < 0 ? -c : 0));

    const avgGain = gains.reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / period;

    return 100 - 100 / (1 + avgGain / (avgLoss || 1));
  }

  normalize(value, min, max) {
    return (value - min) / (max - min);
  }
}
