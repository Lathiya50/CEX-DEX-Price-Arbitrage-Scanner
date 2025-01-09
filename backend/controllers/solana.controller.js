// controllers/solana.controller.js
import { Connection, PublicKey } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL);
export const getSolanaPrices = async (req, res) => {
  try {
    const markets = await getSolanaMarkets();
    const prices = await Promise.all(
      markets.map(async (market) => {
        const { symbol, address } = market;
        const price = await getMarketPrice(address);
        return { symbol, price };
      })
    );

    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSolanaMarkets = async (req, res) => {
  try {
    const markets = [
      { symbol: "BTC/USDC", address: process.env.SOL_BTC_USDC_MARKET },
      { symbol: "ETH/USDC", address: process.env.SOL_ETH_USDC_MARKET },
      { symbol: "SOL/USDC", address: process.env.SOL_SOL_USDC_MARKET },
    ];

    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMarketDepth = async (req, res) => {
  try {
    const { market: marketAddress } = req.params;
    const market = await Market.load(
      connection,
      new PublicKey(marketAddress),
      {},
      new PublicKey(process.env.SERUM_PROGRAM_ID)
    );

    const bids = await market.loadBids(connection);
    const asks = await market.loadAsks(connection);

    res.json({
      bids: bids.getL2(20),
      asks: asks.getL2(20),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
