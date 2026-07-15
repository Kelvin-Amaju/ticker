import { Holding, MarketAsset, PortfolioSummary } from "./types";

export function calculatePortfolio(
  holdings: Holding[],
  marketData: MarketAsset[]
): PortfolioSummary {
  let totalValue = 0;
  let totalCostBasis = 0;

  const holdingsPerformance = holdings.map((holding) => {
    const liveAsset = marketData.find((item) => item.ticker === holding.ticker);
    const currentPrice = liveAsset ? Number(liveAsset.price) : holding.average_buy_price;

    const currentVal = holding.shares * currentPrice;
    const totalCost = holding.shares * holding.average_buy_price;
    const profitLoss = currentVal - totalCost;
    const percentageReturn = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    totalValue += currentVal;
    totalCostBasis += totalCost;

    return {
      ...holding,
      current_price: currentPrice,
      current_value: currentVal,
      profit_loss: profitLoss,
      percentage_return: percentageReturn,
    };
  });

  const totalProfitLoss = totalValue - totalCostBasis;
  const totalPercentageReturn =
    totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;

  return {
    holdings: holdingsPerformance,
    total_value: totalValue,
    total_profit_loss: totalProfitLoss,
    total_percentage_return: totalPercentageReturn,
  };
}
