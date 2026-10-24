"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, X, AlertCircle } from "lucide-react";
import type { Position, PendingOrder, ClosedTrade, Transaction } from "./types";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface PositionsTableProps {
  positions: Position[];
  pendingOrders: PendingOrder[];
  closedTrades: ClosedTrade[];
  transactions: Transaction[];
  onClosePosition: (id: string) => void;
  onCancelOrder: (id: string) => void;
  currency?: string;
}

export function PositionsTable({
  positions,
  pendingOrders,
  closedTrades,
  transactions,
  onClosePosition,
  onCancelOrder,
  currency = "USD",
}: PositionsTableProps) {
  const [activeTab, setActiveTab] = useState<"positions" | "orders" | "history" | "transactions">("positions");

  return (
    <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
      {/* Table Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("positions")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "positions"
                ? "bg-brand-primary text-black shadow-sm"
                : "text-brand-secondary hover:text-white"
            }`}
          >
            <span>Open Positions</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "positions" ? "bg-black/20 text-black" : "bg-white/10 text-brand-secondary"
              }`}
            >
              {positions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-brand-primary text-black shadow-sm"
                : "text-brand-secondary hover:text-white"
            }`}
          >
            <span>Pending Orders</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "orders" ? "bg-black/20 text-black" : "bg-white/10 text-brand-secondary"
              }`}
            >
              {pendingOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "history"
                ? "bg-brand-primary text-black shadow-sm"
                : "text-brand-secondary hover:text-white"
            }`}
          >
            <span>Trade History</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "history" ? "bg-black/20 text-black" : "bg-white/10 text-brand-secondary"
              }`}
            >
              {closedTrades.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "transactions"
                ? "bg-brand-primary text-black shadow-sm"
                : "text-brand-secondary hover:text-white"
            }`}
          >
            <span>Transactions</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "transactions" ? "bg-black/20 text-black" : "bg-white/10 text-brand-secondary"
              }`}
            >
              {transactions.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-secondary">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time STP order routing</span>
        </div>
      </div>

      {/* Tab 1: Open Positions */}
      {activeTab === "positions" && (
        <div className="mt-4 overflow-x-auto">
          {positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-brand-secondary">
              <AlertCircle className="h-8 w-8 text-white/30" />
              <p className="mt-2 text-sm font-semibold text-white">No active positions open</p>
              <p className="text-xs">Use the &apos;New Order&apos; button to enter a position with up to 100x leverage.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-brand-secondary">
                <tr>
                  <th className="pb-3 pr-4">Instrument</th>
                  <th className="pb-3 px-3">Side</th>
                  <th className="pb-3 px-3">Leverage</th>
                  <th className="pb-3 px-3">Entry Price</th>
                  <th className="pb-3 px-3">Mark Price</th>
                  <th className="pb-3 px-3">Size / Margin</th>
                  <th className="pb-3 px-3">TP / SL</th>
                  <th className="pb-3 px-3 text-right">Floating P&L</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {positions.map((pos) => {
                  const isPositive = pos.pnl >= 0;
                  return (
                    <tr key={pos.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="py-3.5 pr-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{pos.symbol}</span>
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase text-brand-secondary">
                            {pos.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-brand-secondary">{pos.name}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            pos.type === "BUY"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {pos.type === "BUY" ? "LONG" : "SHORT"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex rounded-md border border-brand-primary/30 bg-brand-primary/10 px-2 py-0.5 text-xs font-bold text-brand-primary">
                          {pos.leverage}x
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-white">
                        {pos.entryPrice < 10 ? pos.entryPrice.toFixed(4) : formatCurrency(pos.entryPrice, currency)}
                      </td>

                      <td className="py-3.5 px-3 text-white">
                        {pos.markPrice < 10 ? pos.markPrice.toFixed(4) : formatCurrency(pos.markPrice, currency)}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-white">{pos.size} {pos.symbol}</div>
                        <div className="text-[11px] text-brand-secondary">
                          Req: {formatCurrency(pos.margin, currency)}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-[11px]">
                        <div className="text-emerald-400">TP: {pos.takeProfit ? pos.takeProfit : "None"}</div>
                        <div className="text-rose-400">SL: {pos.stopLoss ? pos.stopLoss : "None"}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div
                          className={`text-sm font-bold ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}{formatCurrency(pos.pnl, currency)}
                        </div>
                        <div
                          className={`text-[11px] ${
                            isPositive ? "text-emerald-400/80" : "text-rose-400/80"
                          }`}
                        >
                          {isPositive ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                        </div>
                      </td>

                      <td className="py-3.5 pl-4 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => onClosePosition(pos.id)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 hover:border-rose-500/40"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Pending Orders */}
      {activeTab === "orders" && (
        <div className="mt-4 overflow-x-auto">
          {pendingOrders.length === 0 ? (
            <div className="py-12 text-center text-brand-secondary text-sm">
              No pending limit or stop orders.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-brand-secondary">
                <tr>
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 px-3">Instrument</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Target Price</th>
                  <th className="pb-3 px-3">Current Price</th>
                  <th className="pb-3 px-3">Size</th>
                  <th className="pb-3 px-3">Placed At</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {pendingOrders.map((ord) => (
                  <tr key={ord.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-3.5 pr-4 text-brand-secondary">{ord.id}</td>
                    <td className="py-3.5 px-3 font-sans font-bold text-white">{ord.symbol}</td>
                    <td className="py-3.5 px-3">
                      <span className="rounded bg-blue-500/10 px-2 py-0.5 text-blue-400 font-semibold text-[11px]">
                        {ord.type} ({ord.leverage}x)
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-white font-semibold">
                      {formatCurrency(ord.targetPrice, currency)}
                    </td>
                    <td className="py-3.5 px-3 text-brand-secondary">
                      {formatCurrency(ord.currentPrice, currency)}
                    </td>
                    <td className="py-3.5 px-3 text-white">{ord.size}</td>
                    <td className="py-3.5 px-3 text-brand-secondary">{ord.placedAt}</td>
                    <td className="py-3.5 pl-4 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => onCancelOrder(ord.id)}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Trade History */}
      {activeTab === "history" && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-brand-secondary">
              <tr>
                <th className="pb-3 pr-4">Instrument</th>
                <th className="pb-3 px-3">Side</th>
                <th className="pb-3 px-3">Leverage</th>
                <th className="pb-3 px-3">Entry Price</th>
                <th className="pb-3 px-3">Exit Price</th>
                <th className="pb-3 px-3">Size</th>
                <th className="pb-3 px-3">Closed Date</th>
                <th className="pb-3 pl-4 text-right">Realized P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {closedTrades.map((trade) => {
                const isPos = trade.pnl >= 0;
                return (
                  <tr key={trade.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-3.5 pr-4 font-sans font-bold text-white">{trade.symbol}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          trade.type === "BUY" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                        }`}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-brand-primary">{trade.leverage}x</td>
                    <td className="py-3.5 px-3 text-white">{formatCurrency(trade.entryPrice, currency)}</td>
                    <td className="py-3.5 px-3 text-white">{formatCurrency(trade.closePrice, currency)}</td>
                    <td className="py-3.5 px-3 text-brand-secondary">{trade.size}</td>
                    <td className="py-3.5 px-3 text-brand-secondary">{trade.closedAt}</td>
                    <td className="py-3.5 pl-4 text-right font-bold">
                      <span className={isPos ? "text-emerald-400" : "text-rose-400"}>
                        {isPos ? "+" : ""}{formatCurrency(trade.pnl, currency)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Transactions */}
      {activeTab === "transactions" && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-brand-secondary">
              <tr>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 px-3">Asset</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">USD Value</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Tx Hash / Ref</th>
                <th className="pb-3 pl-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {transactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="py-3.5 pr-4 font-sans font-semibold">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        tx.type === "DEPOSIT"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : tx.type === "WITHDRAWAL"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-blue-500/15 text-blue-400"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-white font-sans">{tx.asset}</td>
                  <td className="py-3.5 px-3 text-white">{tx.amount} {tx.asset}</td>
                  <td className="py-3.5 px-3 text-brand-primary">{formatCurrency(tx.amountUsd, currency)}</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                      <CheckCircle2 className="h-3 w-3" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-brand-secondary font-mono text-[11px]">
                    {tx.txHash || "Internal STP"}
                  </td>
                  <td className="py-3.5 pl-4 text-right text-brand-secondary font-sans">{tx.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
