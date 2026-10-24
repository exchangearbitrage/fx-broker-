export type AccountMode = "live" | "demo";

export interface Position {
  id: string;
  symbol: string;
  name: string;
  category: "crypto" | "forex" | "shares" | "indices" | "commodities";
  type: "BUY" | "SELL";
  leverage: number;
  entryPrice: number;
  markPrice: number;
  size: number;
  margin: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  type: "BUY_LIMIT" | "SELL_LIMIT" | "BUY_STOP" | "SELL_STOP";
  targetPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  placedAt: string;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  leverage: number;
  entryPrice: number;
  closePrice: number;
  size: number;
  pnl: number;
  closedAt: string;
}

export interface StrategyProvider {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  roi30d: number;
  winRate: number;
  copiers: number;
  riskScore: number; // 1-5
  aum: string;
  sparkline: number[];
  description: string;
  badges: string[];
}

export interface StakingVault {
  id: string;
  symbol: string;
  name: string;
  iconBg: string;
  apy: number;
  minAmount: number;
  period: "Flexible" | "30 days" | "60 days" | "90 days";
  totalStaked: string;
  userStaked?: number;
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRADE_PNL" | "STAKING_REWARD";
  asset: string;
  amount: number;
  amountUsd: number;
  status: "COMPLETED" | "PENDING" | "PROCESSING";
  timestamp: string;
  txHash?: string;
}
