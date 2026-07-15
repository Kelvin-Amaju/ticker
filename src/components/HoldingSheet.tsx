"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { addHolding, removeHolding } from "@/lib/storage";
import { useAppData } from "@/context/AppDataContext";
import { MarketAsset } from "@/lib/types";
import { formatNaira } from "@/lib/format";

interface HoldingSheetProps {
  open: boolean;
  onClose: () => void;
  asset: MarketAsset | null;
  hasExistingHolding: boolean;
}

export default function HoldingSheet({
  open,
  onClose,
  asset,
  hasExistingHolding,
}: HoldingSheetProps) {
  const { refreshAppData } = useAppData();
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");

  if (!asset) return null;

  const shareCount = Number(shares);
  const buyPrice = price ? Number(price) : asset.price;
  const totalCost = shareCount > 0 ? shareCount * buyPrice : 0;

  async function handleBuy() {
    if (!asset || shareCount <= 0) return;
    await addHolding({
      ticker: asset.ticker,
      shares: shareCount,
      average_buy_price: buyPrice,
    });
    await refreshAppData();
    setShares("");
    setPrice("");
    onClose();
  }

  async function handleRemove() {
    if (!asset) return;
    await removeHolding(asset.ticker);
    await refreshAppData();
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={asset.ticker}>
      <p className="text-sm text-[var(--text-muted)] -mt-3 mb-5">{asset.name}</p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1.5 block">
            Shares
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-hair)] px-4 py-3 font-mono-tabular text-base outline-none focus:border-[var(--accent)] transition"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1.5 block">
            Price per share (₦)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={asset.price.toFixed(2)}
            className="w-full rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-hair)] px-4 py-3 font-mono-tabular text-base outline-none focus:border-[var(--accent)] transition"
          />
        </div>

        {shareCount > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-raised)] px-4 py-3">
            <span className="text-sm text-[var(--text-muted)]">Total cost</span>
            <span className="font-mono-tabular font-semibold">{formatNaira(totalCost)}</span>
          </div>
        )}

        <button
          onClick={handleBuy}
          disabled={shareCount <= 0}
          className="w-full rounded-xl bg-[var(--accent)] text-[#04140d] font-semibold py-3.5 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition"
        >
          Add buy transaction
        </button>

        {hasExistingHolding && (
          <button
            onClick={handleRemove}
            className="w-full rounded-xl border border-[var(--loss)]/40 text-[var(--loss)] font-semibold py-3.5 active:scale-[0.98] transition"
          >
            Remove holding
          </button>
        )}
      </div>
    </Sheet>
  );
}
