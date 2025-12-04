import { Backtest, BacktestStats, EquityPoint, StrategyConfig, Trade, DataSource, DataDuration, MarketDataPoint } from "../types";

// This simulates the Python 'backtester.py' and 'data_fetcher.py' modules.
// Since we don't have a real Python environment here, we generate plausible synthetic data
// based on the strategy configuration to demonstrate the UI flow.

const generateRandomOHLCV = (duration: DataDuration, dateRange: { start: string, end: string } | undefined, startPrice: number) => {
  let days = 30;

  if (dateRange && dateRange.start && dateRange.end) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  } else {
    switch (duration) {
        case '1M': days = 30; break;
        case '3M': days = 90; break;
        case '6M': days = 180; break;
        case '1Y': days = 365; break;
        case '3Y': days = 365 * 3; break;
        case 'ALL': days = 365 * 5; break;
        default: days = 30;
    }
  }

  const data = [];
  let currentPrice = startPrice;
  // Use explicit start date if provided, otherwise count back from now
  const startDate = (dateRange && dateRange.start) 
    ? new Date(dateRange.start) 
    : new Date();
  
  if (!dateRange) {
      startDate.setDate(startDate.getDate() - days);
  }

  // Generate 4-hour bars for simulation speed but realistic enough for charts
  for (let i = 0; i < days * 6; i++) { 
    const time = new Date(startDate.getTime() + i * 4 * 3600 * 1000);
    const volatility = currentPrice * 0.008; // 0.8% volatility
    const change = (Math.random() - 0.5) * volatility;
    
    // Create realistic OHLC
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;

    data.push({ time, open, high, low, close });
    currentPrice = close;
  }
  return data;
};

export const runMockBacktest = async (
    strategyId: string, 
    config: StrategyConfig, 
    dataSource: DataSource = 'Yahoo Finance',
    dataDuration: DataDuration = '1M',
    customFileName?: string,
    dateRange?: { start: string, end: string }
): Promise<Backtest> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const initialEquity = config.initialCapital || 10000;
  let currentEquity = initialEquity;
  const equityCurve: EquityPoint[] = [];
  const trades: Trade[] = [];
  const marketDataPoints: MarketDataPoint[] = [];

  // Generate data based on duration or specific date range
  const marketData = generateRandomOHLCV(dataDuration, dateRange, 1.1000); // e.g., EURUSD price
  
  // Simple simulation logic: Randomly enter trades based on "volatility" to simulate strategy hits
  
  let winRateBias = 0.45; // Default slightly losing
  if (config.entryRules.some(r => r.toLowerCase().includes('rsi') || r.toLowerCase().includes('trend'))) {
    winRateBias = 0.55; // Bonus for "sensible" indicators
  }

  for (let i = 0; i < marketData.length; i++) { 
    const currentBar = marketData[i];
    
    // Always record market data for charting
    // We record all points generated for the candlestick chart
    marketDataPoints.push({
        date: currentBar.time.toISOString().split('T')[0], // YYYY-MM-DD
        open: currentBar.open,
        high: currentBar.high,
        low: currentBar.low,
        close: currentBar.close
    });

    if (Math.random() > 0.85) { // 15% chance to trade per bar
        const isWin = Math.random() < winRateBias;
        const riskAmount = currentEquity * 0.01; // 1% risk
        const rewardRatio = 1.5 + Math.random(); // 1.5 to 2.5 RR
        
        const pnl = isWin ? riskAmount * rewardRatio : -riskAmount;
        currentEquity += pnl;

        const entryTime = currentBar.time.toISOString();
        // Exit time is random 1-5 bars later
        const exitBarIdx = Math.min(marketData.length - 1, i + Math.floor(Math.random() * 5) + 1);
        const exitTime = marketData[exitBarIdx].time.toISOString();

        trades.push({
            id: `trade-${i}`,
            entryTime: entryTime,
            exitTime: exitTime,
            side: Math.random() > 0.5 ? 'BUY' : 'SELL',
            entryPrice: currentBar.open,
            exitPrice: currentBar.open + (isWin ? 0.0050 : -0.0020), // Simplified visual price
            pnl: pnl,
            pnlPercent: (pnl / initialEquity) * 100
        });
    }
    
    // Record equity point
    equityCurve.push({
        date: currentBar.time.toISOString().split('T')[0],
        equity: currentEquity,
        // Synthetic OHLC for equity candles
        open: currentEquity - (Math.random() * 50),
        high: currentEquity + (Math.random() * 50),
        low: currentEquity - (Math.random() * 50),
        close: currentEquity
    });
  }

  const wins = trades.filter(t => t.pnl > 0);
  const totalReturn = ((currentEquity - initialEquity) / initialEquity) * 100;
  
  const stats: BacktestStats = {
      totalTrades: trades.length,
      winRate: (wins.length / trades.length) * 100,
      profitFactor: Math.abs(wins.reduce((a, b) => a + b.pnl, 0) / trades.filter(t => t.pnl < 0).reduce((a, b) => a + b.pnl, 0)) || 0,
      maxDrawdown: 12.5, // Mocked for simplicity
      totalReturn: totalReturn,
      sharpeRatio: 1.2,
      startEquity: initialEquity,
      endEquity: currentEquity
  };

  return {
      id: `bk-${Date.now()}`,
      strategyId,
      status: 'completed',
      dataSource,
      dataDuration,
      dateRange,
      customFileName,
      runDate: new Date().toISOString(),
      stats,
      equityCurve,
      marketData: marketDataPoints,
      trades
  };
};