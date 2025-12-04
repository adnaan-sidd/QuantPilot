// Domain models mirroring the intended database schema

export enum PlanType {
  FREE = 'free',
  PRO = 'pro',
  ELITE = 'elite'
}

export type DataSource = 'Dukascopy' | 'Yahoo Finance' | 'Binance' | 'Custom Upload';

export type DataDuration = '1M' | '3M' | '6M' | '1Y' | '3Y' | 'ALL';

export type StrategyStatus = 'Active' | 'Draft' | 'Archived';

export type BacktestStage = 'idle' | 'validating' | 'fetching_data' | 'calculating_indicators' | 'simulating' | 'calculating_stats' | 'complete';

export interface User {
  id: string;
  email: string;
  fullName: string;
  plan: PlanType;
}

export interface StrategyConfig {
  asset: string;
  timeframe: string;
  entryRules: string[];
  exitRules: string[];
  stopLoss: string;
  takeProfit: string;
  riskPerTrade: string;
  initialCapital?: number;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  // Optional attachments for UI rendering
  hasBacktestResult?: boolean;
  backtestId?: string;
  backtestSummary?: BacktestStats;
}

export interface ChatResponse {
  message: string;
  config?: StrategyConfig;
  shouldExecute?: boolean;
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description: string;
  parsedConfig: StrategyConfig;
  createdAt: string;
  status: StrategyStatus;
}

export interface Trade {
  id: string;
  entryTime: string;
  exitTime: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
  // Optional OHLC for equity candles
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  value?: number; // Added for line chart compatibility
}

export interface MarketDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface BacktestStats {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalReturn: number;
  sharpeRatio: number;
  startEquity: number;
  endEquity: number;
}

export interface AIReport {
  narrative: string;
  suggestions: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  conciseSummary: string;
}

export interface Backtest {
  id: string;
  strategyId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  dataSource?: DataSource;
  dataDuration?: DataDuration;
  dateRange?: { start: string, end: string };
  customFileName?: string;
  stats: BacktestStats;
  equityCurve: EquityPoint[];
  marketData: MarketDataPoint[];
  trades: Trade[];
  runDate: string;
  report?: AIReport;
}
