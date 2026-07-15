"use client";

import { useMemo } from "react";
import { useMarketData } from "@/lib/useMarketData";
import { detectWhaleActivity } from "@/lib/whaleWatch";
import { formatNaira, formatPercent, formatNumber } from "@/lib/format";

export default function WhaleWatchPage() {
  const { data: marketData, loading } = useMarketData();
  const whales = useMemo(() => detectWhaleActivity(marketData), [marketData]);

  return (
    <div className="max-w-md mx-auto px-5 safe-top">
      <header className="pt-6 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight mb-1">Whale Watch</h1>
        <p className="text-xs text-[var(--text-faint)]">
          Tickers trading well above their average volume
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-[var(--text-faint)] py-8 text-center">Scanning volume…</p>
      ) : whales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-hair)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            No unusual volume activity right now. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {whales.map((asset) => {
            const isGain = asset.change_percent >= 0;
            return (
              <div
                key={asset.ticker}
                className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{asset.ticker}</p>
                    <p className="text-xs text-[var(--text-faint)] truncate">{asset.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono-tabular text-sm font-semibold">
                      {formatNaira(asset.price)}
                    </p>
                    <p
                      className={`text-xs font-mono-tabular ${
                        isGain ? "text-[var(--gain)]" : "text-[var(--loss)]"
                      }`}
                    >
                      {formatPercent(asset.change_percent)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-hair)]">
                  <span className="text-[10px] uppercase tracking-wide text-[var(--text-faint)]">
                    Volume {formatNumber(asset.volume)}
                  </span>
                  <span className="text-[10px] font-mono-tabular font-semibold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    {asset.volume_ratio.toFixed(1)}× avg
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
