"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { useMarketData } from "@/lib/useMarketData";
import { calculatePortfolio } from "@/lib/calculatePortfolio";
import { formatNaira, formatPercent } from "@/lib/format";
import HoldingSheet from "@/components/HoldingSheet";
import { MarketAsset } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const { appData } = useAppData();
  const { data: marketData, loading, isOffline, lastUpdated } = useMarketData();
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);

  const summary = useMemo(
    () => calculatePortfolio(appData.portfolio.holdings, marketData),
    [appData.portfolio.holdings, marketData]
  );

  const isGain = summary.total_profit_loss >= 0;
  const firstName = appData.user_profile.display_name.split(" ")[0];

  function openHolding(ticker: string) {
    const asset = marketData.find((a) => a.ticker === ticker);
    if (asset) setSelectedAsset(asset);
  }

  return (
    <div className="max-w-md mx-auto px-5 safe-top">
      <header className="pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--text-faint)]">Welcome back</p>
          <h1 className="text-xl font-extrabold tracking-tight">{firstName || "there"}</h1>
        </div>
        {isOffline && (
          <span className="text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--bg-surface-raised)] text-[var(--text-faint)] border border-[var(--border-hair)]">
            Offline
          </span>
        )}
      </header>

      <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hair)] p-5 mb-5">
        <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1">
          Portfolio value
        </p>
        <p className="font-mono-tabular text-3xl font-bold tracking-tight mb-3">
          {loading ? "···" : formatNaira(summary.total_value)}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold font-mono-tabular ${
              isGain ? "text-[var(--gain)]" : "text-[var(--loss)]"
            }`}
          >
            {isGain ? "▲" : "▼"} {formatNaira(Math.abs(summary.total_profit_loss))}
          </span>
          <span
            className={`text-xs font-mono-tabular px-1.5 py-0.5 rounded ${
              isGain
                ? "bg-[var(--gain)]/10 text-[var(--gain)]"
                : "bg-[var(--loss)]/10 text-[var(--loss)]"
            }`}
          >
            {formatPercent(summary.total_percentage_return)}
          </span>
        </div>
      </section>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">Holdings</h2>
        {lastUpdated && (
          <span className="text-[10px] text-[var(--text-faint)] font-mono-tabular">
            Updated {new Date(lastUpdated).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {summary.holdings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-hair)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-4">
            No holdings yet. Add your first position from the Stocks tab.
          </p>
          <Link
            href="/stocks"
            className="inline-block text-sm font-semibold text-[var(--accent)]"
          >
            Browse stocks →
          </Link>
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {summary.holdings.map((h) => {
            const gain = h.profit_loss >= 0;
            return (
              <button
                key={h.ticker}
                onClick={() => openHolding(h.ticker)}
                className="w-full flex items-center justify-between rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3.5 text-left active:scale-[0.99] transition"
              >
                <div>
                  <p className="font-semibold text-sm">{h.ticker}</p>
                  <p className="text-xs text-[var(--text-faint)] font-mono-tabular">
                    {h.shares.toLocaleString()} shares
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono-tabular font-semibold text-sm">
                    {formatNaira(h.current_value)}
                  </p>
                  <p
                    className={`text-xs font-mono-tabular ${
                      gain ? "text-[var(--gain)]" : "text-[var(--loss)]"
                    }`}
                  >
                    {formatPercent(h.percentage_return)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <HoldingSheet
        open={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
        hasExistingHolding={
          !!selectedAsset &&
          appData.portfolio.holdings.some((h) => h.ticker === selectedAsset.ticker)
        }
      />
    </div>
  );
}
