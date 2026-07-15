"use client";

import { useMemo } from "react";
import { useMarketData } from "@/lib/useMarketData";
import { useAppData } from "@/context/AppDataContext";
import { toggleFavorite } from "@/lib/storage";
import { formatNaira, formatPercent } from "@/lib/format";
import Link from "next/link";

export default function FavoritesPage() {
  const { data: marketData, loading } = useMarketData();
  const { appData, refreshAppData } = useAppData();

  const favoriteAssets = useMemo(
    () => marketData.filter((a) => appData.favorites.includes(a.ticker)),
    [marketData, appData.favorites]
  );

  async function handleRemove(ticker: string) {
    await toggleFavorite(ticker);
    await refreshAppData();
  }

  return (
    <div className="max-w-md mx-auto px-5 safe-top">
      <header className="pt-6 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight">Favorites</h1>
      </header>

      {loading ? (
        <p className="text-sm text-[var(--text-faint)] py-8 text-center">Loading…</p>
      ) : favoriteAssets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-hair)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Tap the heart on any stock to track it here.
          </p>
          <Link href="/stocks" className="inline-block text-sm font-semibold text-[var(--accent)]">
            Browse stocks →
          </Link>
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {favoriteAssets.map((asset) => {
            const isGain = asset.change_percent >= 0;
            return (
              <div
                key={asset.ticker}
                className="flex items-center gap-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3.5"
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
                  onClick={() => handleRemove(asset.ticker)}
                  className="p-1.5 shrink-0"
                  aria-label="Remove from favorites"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)">
                    <path d="M12 19l-1.1-1C6 13.9 3 11.2 3 7.9 3 5.7 4.8 4 7 4c1.3 0 2.6.6 3.5 1.7l1.5 1.6 1.5-1.6C14.4 4.6 15.7 4 17 4c2.2 0 4 1.7 4 3.9 0 3.3-3 6-7.9 10.1L12 19z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
