"use client";

import { useEffect, useState, useCallback } from "react";
import { get, set } from "idb-keyval";
import { MarketAsset } from "./types";

const MARKET_CACHE_KEY = "ngx_market_cache";
const POLL_INTERVAL_MS = 45_000;

export function useMarketData() {
  const [data, setData] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // 1. Use the NEXT_PUBLIC_ prefix
      // 2. Fallback to an empty string if it's undefined to prevent "/undefined/..." URLs
      const apiBase = process.env.NEXT_PUBLIC_NGX_API_BASE || "";
      const url = `${apiBase}/api/market`;
      
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Market fetch failed");
      const fresh: MarketAsset[] = await res.json();
      setData(fresh);
      setIsOffline(false);
      const now = Date.now();
      setLastUpdated(now);
      await set(MARKET_CACHE_KEY, { data: fresh, timestamp: now });
    } catch (error) {
      // Offline or request failed — fall back to last cached snapshot.
      const cached = await get<{ data: MarketAsset[]; timestamp: number }>(
        MARKET_CACHE_KEY
      );
      if (cached) {
        setData(cached.data);
        setLastUpdated(cached.timestamp);
      }
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    
    const kickoff = setTimeout(run, 0);
    const interval = setInterval(run, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, [fetchData]);

  return { data, loading, isOffline, lastUpdated, refetch: fetchData };
}