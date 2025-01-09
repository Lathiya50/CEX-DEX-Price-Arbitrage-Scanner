// controllers/binance.controller.js
import Binance from "binance-api-node";

const esmBinanceHack = Binance.default;

const binanceClient = esmBinanceHack({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

export const getBinancePrices = async (req, res) => {
  try {
    const prices = await binanceClient.prices();
    const usdcPairs = Object.entries(prices)
      .filter(([symbol]) => symbol.endsWith("USDC"))
      .reduce(
        (acc, [symbol, price]) => ({
          ...acc,
          [symbol]: parseFloat(price),
        }),
        {}
      );

    res.json(usdcPairs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBinanceBalance = async (req, res) => {
  try {
    const accountInfo = await binanceClient.accountInfo();
    res.json(accountInfo.balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTradingPairs = async (req, res) => {
  try {
    const exchangeInfo = await binanceClient.exchangeInfo();
    const usdcPairs = exchangeInfo.symbols
      .filter((symbol) => symbol.quoteAsset === "USDC")
      .map((symbol) => ({
        symbol: symbol.symbol,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        filters: symbol.filters,
      }));

    res.json(usdcPairs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
