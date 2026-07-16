import { NextResponse } from "next/server";
import { MarketAsset } from "@/lib/types";

// NGX Pulse API — https://ngxpulse.ng/api#overview
// Endpoint: GET /api/ngxdata/stocks
// Auth:     X-API-Key header
// Refresh:  every 20 minutes during market hours (data is live from NGX)
//
// Response shape from the API:
// [
//   {
//     symbol:            string   — NGX ticker (e.g. "DANGCEM")
//     name:              string   — Full company name
//     current_price:     number   — Latest trade price in NGN
//     change_percent:    number   — % change from previous close
//     volume:            number   — Shares traded today
//     shares_outstanding:number   — Total issued shares
//     sector:            string   — NGX sector classification
//     pe_ratio:          number   — Price-to-earnings ratio
//   }
// ]

interface NGXPulseStock {
  symbol: string;
  name: string;
  current_price: number;
  change_percent: number;
  volume: number;
  shares_outstanding: number;
  sector: string;
  pe_ratio: number | null;
}

/** Map NGX Pulse's field names onto our internal MarketAsset shape.
 *  avg_volume is not provided by the API, so we estimate it as the
 *  current volume (sufficient for the Whale Watch heuristic which
 *  compares volume to avg_volume at the same snapshot). */
function toMarketAsset(stock: NGXPulseStock): MarketAsset {
  return {
    ticker: stock.symbol,
    name: stock.name,
    price: stock.current_price ?? 0,
    change_percent: stock.change_percent ?? 0,
    volume: stock.volume ?? 0,
    // avg_volume is not in the NGX Pulse stocks endpoint; we use the
    // current volume as a neutral fallback so the Whale Watch ratio
    // stays at 1× for every stock until we have a rolling window.
    avg_volume: stock.volume ?? 0,
    sector: stock.sector ?? "Unknown",
  };
}

export async function GET() {
  const apiKey = process.env.NGX_API_KEY;
  const apiBase = process.env.NGX_API_BASE ?? "https://www.ngxpulse.ng";

  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json(
      { error: "NGX_API_KEY is not configured. Add it to .env.local." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${apiBase}/api/ngxdata/stocks`, {
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      // Revalidate every 60 seconds server-side.
      // The client also polls every 45 s (useMarketData.ts).
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[market] NGX Pulse returned ${res.status}: ${body}`);
      return NextResponse.json(
        { error: `NGX Pulse returned ${res.status}` },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }

    const raw: NGXPulseStock[] = await res.json();

    if (!Array.isArray(raw)) {
      console.error("[market] Unexpected NGX Pulse response shape:", raw);
      return NextResponse.json(
        { error: "Unexpected response from NGX Pulse" },
        { status: 502 }
      );
    }

    const data: MarketAsset[] = raw
      .filter((stock) => typeof stock.symbol === "string" && stock.symbol.length > 0)
      .map(toMarketAsset);

    if (data.length === 0 && raw.length > 0) {
      console.error("[market] NGX Pulse returned stocks without ticker symbols");
      return NextResponse.json(
        { error: "NGX Pulse returned invalid stock records" },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        // Allow the client-side IDB cache to serve stale data while
        // a background refresh is in flight (up to 2 minutes).
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("[market] Fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to reach NGX Pulse API" },
      { status: 502 }
    );
  }
}
