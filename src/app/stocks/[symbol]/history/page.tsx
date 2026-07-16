"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatNaira } from "@/lib/format";
import { HistoricalPrice } from "@/lib/types";

type Period = "1d" | "1w" | "1m" | "1y" | "custom";

const PERIODS: { id: Exclude<Period, "custom">; label: string; days: number }[] = [
  { id: "1d", label: "1 day", days: 1 },
  { id: "1w", label: "1 week", days: 5 },
  { id: "1m", label: "1 month", days: 22 },
  { id: "1y", label: "1 year", days: 252 },
];

interface HistoryResponse {
  symbol: string;
  prices: HistoricalPrice[];
  error?: string;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PriceHistoryPage() {
  const params = useParams<{ symbol: string }>();
  const router = useRouter();
  const symbol = params.symbol?.toUpperCase() ?? "";
  const [period, setPeriod] = useState<Period>("1m");
  const [customDate, setCustomDate] = useState("");
  const [prices, setPrices] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrices = useCallback(async (query: string) => {
    if (!symbol) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/market/${encodeURIComponent(symbol)}/history?${query}`, {
        cache: "no-store",
      });
      const payload: HistoryResponse = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not load price history");
      setPrices(payload.prices);
    } catch (reason) {
      setPrices([]);
      setError(reason instanceof Error ? reason.message : "Could not load price history");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    const selectedPeriod = PERIODS.find((item) => item.id === period);
    if (!selectedPeriod) return;

    const request = window.setTimeout(() => {
      void loadPrices(`days=${selectedPeriod.days}`);
    }, 0);

    return () => window.clearTimeout(request);
  }, [loadPrices, period]);

  function selectPeriod(nextPeriod: Exclude<Period, "custom">) {
    setPeriod(nextPeriod);
  }

  function loadCustomDate() {
    if (!customDate) return;
    setPeriod("custom");
    loadPrices(`from=${customDate}&to=${customDate}`);
  }

  const latestPrice = prices[0];

  return (
    <div className="max-w-md mx-auto px-5 safe-top pb-8">
      <header className="pt-6 pb-5">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide">Historical price</p>
        <h1 className="text-2xl font-extrabold tracking-tight mt-1">{symbol}</h1>
      </header>

      <section className="mb-5">
        <p className="text-xs font-medium text-[var(--text-faint)] mb-2">Quick range</p>
        <div className="grid grid-cols-4 gap-2">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              onClick={() => selectPeriod(item.id)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                period === item.id
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border-hair)] bg-[var(--bg-surface)] text-[var(--text-muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] p-4 mb-5">
        <label htmlFor="historical-date" className="text-xs font-medium text-[var(--text-faint)] block mb-2">
          Find a specific date
        </label>
        <div className="flex gap-2">
          <input
            id="historical-date"
            type="date"
            value={customDate}
            onChange={(event) => setCustomDate(event.target.value)}
            className="min-w-0 flex-1 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-hair)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={loadCustomDate}
            disabled={!customDate}
            className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[#04140d] disabled:opacity-30"
          >
            View
          </button>
        </div>
      </section>

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--text-faint)]">Loading price history…</p>
      ) : error ? (
        <div className="rounded-xl bg-[var(--loss)]/10 px-4 py-3 text-sm text-[var(--loss)]">{error}</div>
      ) : prices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-hair)] p-7 text-center text-sm text-[var(--text-muted)]">
          No trading price is available for this selection.
        </div>
      ) : (
        <>
          <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hair)] p-5 mb-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-faint)] mb-1">
              {period === "custom" ? "Close on selected date" : "Latest close in selection"}
            </p>
            <p className="font-mono-tabular text-3xl font-bold tracking-tight">{formatNaira(latestPrice.close_price)}</p>
            <p className="mt-2 text-xs text-[var(--text-faint)]">{formatDate(latestPrice.date)}</p>
          </section>

          <div className="space-y-2">
            {prices.map((price) => (
              <div key={price.date} className="flex items-center justify-between rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3">
                <span className="text-sm text-[var(--text-muted)]">{formatDate(price.date)}</span>
                <span className="font-mono-tabular text-sm font-semibold">{formatNaira(price.close_price)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
