# Ticker — NGX Portfolio Tracker

A local-first, mobile PWA for tracking a Nigerian Exchange (NGX) portfolio.
No database, no accounts — everything (passcode, holdings, favorites) lives
in the browser's IndexedDB/localStorage on the user's device.

## Stack
Next.js 15 (App Router, TypeScript) · Tailwind CSS · idb-keyval · Web Crypto (SHA-256 passcode hashing) · @ducanh2912/next-pwa (Workbox)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — on first load you'll go through name entry,
passcode setup, then the dashboard.

## Important: mock market data

`src/app/api/market/route.ts` currently generates realistic-looking mock
NGX price/volume data on every request — there's no live NGX data provider
wired in yet, since none was specified. To go live, replace the body of
`getMarketData()` with a real `fetch()` call to your data provider, keeping
the same `MarketAsset[]` return shape:

```ts
interface MarketAsset {
  ticker: string;
  name: string;
  price: number;
  change_percent: number;
  volume: number;
  avg_volume: number;
  sector: string;
}
```

Nothing else in the app needs to change — the dashboard, search, favorites,
and Whale Watch all consume this same shape.

## Deploying

Push to GitHub and import into Vercel — no environment variables or
separate backend needed. If you swap in a real market data API that
requires a key, add it as a Vercel environment variable and read it
server-side inside `route.ts` (it will never reach the client).

For production builds, note this project pins Webpack (not Turbopack) in
`package.json`'s `build` script, since `@ducanh2912/next-pwa` currently
generates its service worker via a Webpack plugin.

## Icons

Placeholder icons are in `public/icons/`. Swap in your own branded
192×192, 512×512, and a maskable 512×512 icon before shipping.

## Fonts

`globals.css` currently falls back to system fonts (Manrope/JetBrains Mono
aren't bundled). To restore the intended cinematic look, re-add
`next/font/google` in `src/app/layout.tsx` once you're building somewhere
with access to fonts.googleapis.com (this was stripped only because the
sandbox this was built in had no internet access to Google Fonts).
