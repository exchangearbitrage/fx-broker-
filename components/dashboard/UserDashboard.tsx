"use client";

import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { PortfolioMetrics } from "./PortfolioMetrics";
import { PerformanceChart } from "./PerformanceChart";
import { AssetAllocation } from "./AssetAllocation";
import { PositionsTable } from "./PositionsTable";
import { CopyTradingDesk } from "./CopyTradingDesk";
import { StakingVaultsDesk } from "./StakingVaultsDesk";
import {
  DepositModal,
  WithdrawModal,
  NewOrderModal,
  CopyTraderModal,
  StakeModal,
} from "./Modals";
import {
  initialPositions,
  initialPendingOrders,
  initialClosedTrades,
  strategyProviders,
  stakingVaults as initialStakingVaults,
  initialTransactions,
} from "./data";
import type { AccountMode, Position, StrategyProvider, StakingVault, Transaction } from "./types";
import Link from "next/link";
import type { BrandConfig } from "@/config/brand.schema";
import { useCopyTrading } from "@/lib/services/copyTrading";
import { useCurrency } from "@/context/CurrencyContext";

interface UserDashboardProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: string;
    kycStatus?: string;
  };
  brand: BrandConfig;
}

export function UserDashboard({ user, brand }: UserDashboardProps) {
  const { currency, formatMoney } = useCurrency();
  // Mode: Live vs Demo
  const [mode, setMode] = useState<AccountMode>("live");

  // Account Balances per mode
  const [liveBalance, setLiveBalance] = useState(124580.4);
  const [demoBalance, setDemoBalance] = useState(100000.0);

  // Active positions & orders
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [pendingOrders, setPendingOrders] = useState(initialPendingOrders);
  const [closedTrades, setClosedTrades] = useState(initialClosedTrades);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [vaults, setVaults] = useState<StakingVault[]>(initialStakingVaults);

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<StrategyProvider | null>(null);
  const [selectedVault, setSelectedVault] = useState<StakingVault | null>(null);
  const { copyProvider, isCopied } = useCopyTrading();
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Balance & Margin calculations
  const balance = mode === "live" ? liveBalance : demoBalance;
  const setBalance = mode === "live" ? setLiveBalance : setDemoBalance;

  const totalUsedMargin = positions.reduce((acc, pos) => acc + pos.margin, 0);
  const totalUnrealizedPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const netEquity = balance + totalUnrealizedPnl;
  const freeMargin = Math.max(0, netEquity - totalUsedMargin);
  const marginLevel = totalUsedMargin > 0 ? (netEquity / totalUsedMargin) * 100 : 999;
  const totalRealizedPnl = closedTrades.reduce((acc, trade) => acc + trade.pnl, 0);

  // 24h P&L stats
  const pnl24h = mode === "live" ? 4120.5 : 2450.0;
  const pnl24hPercent = (pnl24h / (netEquity - pnl24h)) * 100;

  // Handlers
  const handleDepositSuccess = (amount: number, asset: string) => {
    // Deposits remain pending until an administrator approves the payment request.
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "DEPOSIT",
      asset,
      amount,
      amountUsd: amount,
      status: "PENDING",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleWithdrawSuccess = (amount: number, asset: string) => {
    setBalance((prev) => Math.max(0, prev - amount));
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "WITHDRAWAL",
      asset,
      amount,
      amountUsd: amount,
      status: "PENDING",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    setPositions((prev) => prev.filter((p) => p.id !== id));
    setBalance((prev) => prev + pos.pnl);

    const closedItem = {
      id: `cl-${Date.now()}`,
      symbol: pos.symbol,
      type: pos.type,
      leverage: pos.leverage,
      entryPrice: pos.entryPrice,
      closePrice: pos.markPrice,
      size: pos.size,
      pnl: pos.pnl,
      closedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    setClosedTrades((prev) => [closedItem, ...prev]);
  };

  const handleCancelOrder = (id: string) => {
    setPendingOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handlePlaceOrder = (newOrderData: Omit<Position, "id" | "pnl" | "pnlPercent" | "openedAt">) => {
    const newPos: Position = {
      ...newOrderData,
      id: `pos-${Date.now()}`,
      pnl: 0,
      pnlPercent: 0,
      openedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    setPositions((prev) => [newPos, ...prev]);
  };

  const handleConfirmCopy = async (providerId: string, amount: number, maxDrawdown = 15) => {
    const provider = strategyProviders.find((item) => item.id === providerId);
    if (!provider) return;
    await copyProvider(provider, amount, maxDrawdown);
    setCopyNotice(`Trade Mirroring Active for ${provider.name}! Allocated: ${formatMoney(amount)}`);
  };

  const handleConfirmStake = (vaultId: string, amount: number) => {
    setVaults((prev) =>
      prev.map((v) => (v.id === vaultId ? { ...v, userStaked: (v.userStaked ?? 0) + amount } : v))
    );
  };

  return (
    <div className="space-y-8">
      <Link href="/dashboard/assistance" className={`flex items-center justify-between gap-4 rounded-xl border p-4 text-sm transition-colors ${user.kycStatus === "APPROVED" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : user.kycStatus === "REJECTED" ? "border-rose-400/30 bg-rose-400/10 text-rose-100" : "border-amber-400/30 bg-amber-400/10 text-amber-100"}`}><span><strong>Verification & Support:</strong> {user.kycStatus === "APPROVED" ? "Identity verification approved." : user.kycStatus === "REJECTED" ? "Your identity document needs an update." : "Your identity documents are under manual review."}</span><span className="shrink-0 font-semibold underline">View status</span></Link>
      {/* 1. Header with Mode Toggle & Quick Actions */}
      <DashboardHeader
        user={user}
        mode={mode}
        onModeChange={setMode}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        kycStatus={user.kycStatus}
      />

      {/* 2. Top Portfolio Metrics Grid */}
      <PortfolioMetrics
        equity={netEquity}
        balance={balance}
        freeMargin={freeMargin}
        usedMargin={totalUsedMargin}
        marginLevel={marginLevel}
        pnl24h={pnl24h}
        pnl24hPercent={pnl24hPercent}
        unrealizedPnl={totalUnrealizedPnl}
        realizedPnl={totalRealizedPnl}
        currency={currency}
      />

      {/* 3. Equity Performance Chart + Multi-Asset Allocation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart currency={currency} />
        </div>
        <div className="lg:col-span-1">
          <AssetAllocation totalValue={netEquity} currency={currency} />
        </div>
      </div>

      {/* 4. Active Trading Desk: Positions & History */}
      <PositionsTable
        positions={positions}
        pendingOrders={pendingOrders}
        closedTrades={closedTrades}
        transactions={transactions}
        onClosePosition={handleClosePosition}
        onCancelOrder={handleCancelOrder}
        currency={currency}
      />

      {/* 5. One-Click Copy Trading Section */}
      <CopyTradingDesk
        providers={strategyProviders}
        onSelectProvider={(p) => setSelectedProvider(p)}
        isCopied={isCopied}
      />

      {/* 6. Staking & Yield Vaults Section */}
      <StakingVaultsDesk
        vaults={vaults}
        onSelectVault={(v) => setSelectedVault(v)}
        currency={currency}
      />

      {/* Interactive Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDepositSuccess={handleDepositSuccess}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableBalance={freeMargin}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onPlaceOrder={handlePlaceOrder}
        availableMargin={freeMargin}
      />

      <CopyTraderModal
        provider={selectedProvider}
        isOpen={selectedProvider !== null}
        onClose={() => setSelectedProvider(null)}
        onConfirmCopy={handleConfirmCopy}
      />
      {copyNotice && <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-emerald-500/30 bg-brand-surface p-4 text-sm text-emerald-400 shadow-2xl">{copyNotice} <a className="ml-2 font-semibold underline" href="/dashboard/copy">View & Manage in Copy Trading Desk →</a></div>}

      <StakeModal
        vault={selectedVault}
        isOpen={selectedVault !== null}
        onClose={() => setSelectedVault(null)}
        onConfirmStake={handleConfirmStake}
      />
    </div>
  );
}

