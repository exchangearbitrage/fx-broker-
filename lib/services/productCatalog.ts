export type StakingVaultDefinition = { id: string; symbol: string; name: string; apy: number; minUsd: number; lockDays: number; iconBg: string; premium: boolean };
export type StrategyDefinition = { id: string; name: string; handle: string; avatar: string; roi30d: number; winRate: number; copiers: number; riskScore: number; aum: string; sparkline: number[]; description: string; badges: string[]; premium: boolean };

export const stakingVaults: StakingVaultDefinition[] = [
  { id: "stake-btc", symbol: "BTC", name: "Bitcoin Vault", apy: 4.5, minUsd: 100, lockDays: 0, iconBg: "#F7931A", premium: false },
  { id: "stake-eth", symbol: "ETH", name: "Ethereum Yield", apy: 5.8, minUsd: 100, lockDays: 0, iconBg: "#627EEA", premium: false },
  { id: "stake-sol", symbol: "SOL", name: "Solana High-Yield", apy: 7.2, minUsd: 100, lockDays: 30, iconBg: "#14F195", premium: false },
  { id: "stake-usdt", symbol: "USDT", name: "Tether Dollar Pool", apy: 9.0, minUsd: 100, lockDays: 90, iconBg: "#26A17B", premium: false },
  { id: "stake-usdc", symbol: "USDC", name: "USD Coin Reserve", apy: 7.5, minUsd: 100, lockDays: 30, iconBg: "#2775CA", premium: true },
  { id: "stake-ada", symbol: "ADA", name: "Cardano Delegation", apy: 4.2, minUsd: 100, lockDays: 30, iconBg: "#0033AD", premium: true },
  { id: "stake-avax", symbol: "AVAX", name: "Avalanche Validator", apy: 6.4, minUsd: 100, lockDays: 60, iconBg: "#E84142", premium: true },
  { id: "stake-dot", symbol: "DOT", name: "Polkadot Nomination", apy: 8.1, minUsd: 100, lockDays: 60, iconBg: "#E6007A", premium: true },
  { id: "stake-atom", symbol: "ATOM", name: "Cosmos Hub", apy: 10.2, minUsd: 100, lockDays: 90, iconBg: "#2E3148", premium: true },
  { id: "stake-matic", symbol: "POL", name: "Polygon Validator", apy: 5.4, minUsd: 100, lockDays: 30, iconBg: "#8247E5", premium: true },
];

export const strategyProviders: StrategyDefinition[] = [
  { id: "strat-1", name: "Alex 'Alpha' Vance", handle: "@alphavance", avatar: "AV", roi30d: 142.8, winRate: 88.5, copiers: 1842, riskScore: 3, aum: "$3.8M", sparkline: [30,35,42,38,55,68,85,92,110,125,142.8], description: "Multi-timeframe momentum across BTC, ETH, and high-beta equities.", badges: ["Verified", "Stop loss"], premium: false },
  { id: "strat-2", name: "Elena Rostova", handle: "@rostovafx", avatar: "ER", roi30d: 78.4, winRate: 94.2, copiers: 2410, riskScore: 2, aum: "$6.2M", sparkline: [20,25,32,40,48,52,60,68,72,75,78.4], description: "Low-drawdown FX hedging for major pairs and gold.", badges: ["Institutional", "Low drawdown"], premium: true },
  { id: "strat-3", name: "Apex Quant Labs", handle: "@apexquant", avatar: "AQ", roi30d: 215.6, winRate: 82, copiers: 3120, riskScore: 4, aum: "$9.4M", sparkline: [40,48,62,55,80,115,130,160,185,195,215.6], description: "Systematic mean-reversion strategy for liquid crypto markets.", badges: ["Algorithmic", "High risk"], premium: true },
  { id: "strat-4", name: "Marcus Thorne", handle: "@marcusthorne", avatar: "MT", roi30d: 54.2, winRate: 91, copiers: 1105, riskScore: 1, aum: "$2.1M", sparkline: [15,18,22,28,32,36,40,44,48,50,54.2], description: "Conservative macro swing trading with tight risk limits.", badges: ["Conservative", "Verified"], premium: true },
  { id: "strat-5", name: "Nova Delta", handle: "@novadelta", avatar: "ND", roi30d: 66.5, winRate: 76, copiers: 960, riskScore: 3, aum: "$1.7M", sparkline: [16,20,23,35,33,42,48,52,58,61,66.5], description: "Diversified index and commodities trend following.", badges: ["Diversified"], premium: true },
  { id: "strat-6", name: "Orion Systems", handle: "@orionsystems", avatar: "OS", roi30d: 93.1, winRate: 80, copiers: 1320, riskScore: 4, aum: "$4.5M", sparkline: [12,24,31,28,50,49,66,72,70,86,93.1], description: "Quantitative multi-asset momentum model.", badges: ["Quant", "High risk"], premium: true },
  { id: "strat-7", name: "Sable Capital", handle: "@sablecapital", avatar: "SC", roi30d: 41.7, winRate: 89, copiers: 780, riskScore: 2, aum: "$980K", sparkline: [10,13,19,18,22,29,31,34,37,39,41.7], description: "Capital-preservation income strategy.", badges: ["Low risk"], premium: true },
];