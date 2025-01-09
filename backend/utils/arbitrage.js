// utils/arbitrage.js
export const calculateArbitrageOpportunity = ({
  binancePrice,
  dexPrice,
  symbol,
  binanceFees,
  dexFees,
  networkFees,
}) => {
  // Calculate total costs
  const totalFees = binanceFees + dexFees + networkFees;

  // Calculate price difference
  const priceDiff = Math.abs(binancePrice - dexPrice);
  const basePrice = Math.min(binancePrice, dexPrice);
  const profitPercentage = (priceDiff / basePrice) * 100 - totalFees * 100;

  // Calculate estimated profit for 1 unit
  const estimatedProfit = priceDiff - basePrice * totalFees;

  return {
    symbol,
    binancePrice,
    dexPrice,
    profitPercentage,
    estimatedProfit,
    isProfitable: profitPercentage > 0,
    timestamp: new Date(),
    fees: {
      binance: binanceFees * 100,
      dex: dexFees * 100,
      network: networkFees * 100,
    },
  };
};
