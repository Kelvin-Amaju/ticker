"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { useMarketData } from "@/lib/useMarketData";
import { useAppData } from "@/context/AppDataContext";
import { toggleFavorite } from "@/lib/storage";
import { formatNaira, formatPercent } from "@/lib/format";
import HoldingSheet from "@/components/HoldingSheet";
import { MarketAsset } from "@/lib/types";

export default function StocksPage() {
  const { data: marketData, loading } = useMarketData();
  const { appData, refreshAppData } = useAppData();
  const [query, setQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(marketData, {
        keys: ["ticker", "name"],
        threshold: 0.35,
      }),
    [marketData]
  );

  const results = useMemo(() => {
    if (!query.trim()) return marketData;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, marketData]);

  async function handleToggleFavorite(e: React.MouseEvent, ticker: string) {
    e.stopPropagation();
    await toggleFavorite(ticker);
    await refreshAppData();
  }

  return (
    <div className="max-w-md mx-auto px-5 safe-top">
      <header className="pt-6 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight mb-4">All Stocks</h1>
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
          >
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 20L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker or company"
            className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition"
          />
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-[var(--text-faint)] py-8 text-center">Loading market data…</p>
      ) : (
        <div className="space-y-2 pb-6">
          {results.map((asset) => {
            const isFav = appData.favorites.includes(asset.ticker);
            const isGain = asset.change_percent >= 0;
            return (
              <div
                key={asset.ticker}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedAsset(asset)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedAsset(asset)}
                className="relative w-full flex items-center gap-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3.5 text-left active:scale-[0.99] transition cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{asset.ticker}</p>
                  <p className="text-xs text-[var(--text-faint)] truncate">{asset.name}</p>
                </div>
                <div className="text-right">
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
                <button
                  onClick={(e) => handleToggleFavorite(e, asset.ticker)}
                  className="p-1.5 shrink-0"
                  aria-label="Toggle favorite"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav ? "var(--accent)" : "none"}>
                    <path
                      d="M12 19l-1.1-1C6 13.9 3 11.2 3 7.9 3 5.7 4.8 4 7 4c1.3 0 2.6.6 3.5 1.7l1.5 1.6 1.5-1.6C14.4 4.6 15.7 4 17 4c2.2 0 4 1.7 4 3.9 0 3.3-3 6-7.9 10.1L12 19z"
                      stroke={isFav ? "var(--accent)" : "var(--text-faint)"}
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
          {results.length === 0 && (
            <p className="text-sm text-[var(--text-faint)] py-8 text-center">
              No matches for &quot;{query}&quot;
            </p>
          )}
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
