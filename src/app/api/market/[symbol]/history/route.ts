import { NextRequest, NextResponse } from "next/server";
import { HistoricalPrice } from "@/lib/types";

interface NGXPulsePrice {
  trade_date: string;
  close_price: number | string;
}

function getPrices(payload: unknown): NGXPulsePrice[] | null {
  if (typeof payload !== "object" || payload === null) return null;
  const prices = (payload as { prices?: unknown }).prices;
  return Array.isArray(prices) ? (prices as NGXPulsePrice[]) : null;
}

function isDate(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();
  const apiKey = process.env.NGX_API_KEY;
  const apiBase = process.env.NGX_API_BASE ?? "https://www.ngxpulse.ng";

  if (!/^[A-Z0-9.-]+$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid ticker symbol" }, { status: 400 });
  }

  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json({ error: "NGX_API_KEY is not configured." }, { status: 503 });
  }

  const query = request.nextUrl.searchParams;
  const upstreamUrl = new URL(`/api/ngxdata/prices/${encodeURIComponent(symbol)}`, apiBase);
  const days = query.get("days");
  const from = query.get("from");
  const to = query.get("to");

  if (days) {
    const parsedDays = Number(days);
    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 2520) {
      return NextResponse.json({ error: "days must be between 1 and 2520" }, { status: 400 });
    }
    upstreamUrl.searchParams.set("days", String(parsedDays));
  }

  if (from) {
    if (!isDate(from)) return NextResponse.json({ error: "Invalid from date" }, { status: 400 });
    upstreamUrl.searchParams.set("from", from);
  }

  if (to) {
    if (!isDate(to)) return NextResponse.json({ error: "Invalid to date" }, { status: 400 });
    upstreamUrl.searchParams.set("to", to);
  }

  try {
    const response = await fetch(upstreamUrl, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`[history] NGX Pulse returned ${response.status} for ${symbol}`);
      return NextResponse.json(
        { error: `NGX Pulse returned ${response.status}` },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const rawPrices = getPrices(await response.json());
    if (!rawPrices) {
      console.error(`[history] Unexpected NGX Pulse response shape for ${symbol}`);
      return NextResponse.json({ error: "Unexpected response from NGX Pulse" }, { status: 502 });
    }

    const prices: HistoricalPrice[] = rawPrices
      .filter((price) => typeof price.trade_date === "string" && Number.isFinite(Number(price.close_price)))
      .map((price) => ({ date: price.trade_date, close_price: Number(price.close_price) }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ symbol, prices }, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error(`[history] Fetch failed for ${symbol}:`, error);
    return NextResponse.json({ error: "Failed to reach NGX Pulse API" }, { status: 502 });
  }
}
