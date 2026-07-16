# Ticker — NGX Portfolio Tracker

A local-first, mobile PWA for tracking a Nigerian Exchange (NGX) portfolio.
No database or accounts: the passcode, holdings, and favorites stay in the
browser's IndexedDB/localStorage on the user's device.

## Stack

Next.js, TypeScript, Tailwind CSS, idb-keyval, Web Crypto, and
@ducanh2912/next-pwa.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first load, enter a name and set a passcode.

## Market data

The app fetches live NGX equity data from NGX Pulse. Add the API key to
`.env.local`:

```bash
NGX_API_KEY=your_key_here
```

The browser requests the app's same-origin `/api/market` route. That route
adds the key server-side before it requests
`https://www.ngxpulse.ng/api/ngxdata/stocks`; never place the key in a
`NEXT_PUBLIC_` variable. To override the upstream root, set `NGX_API_BASE`.

The route maps the NGX Pulse response to this internal shape, which is shared
by the dashboard, search, favorites, and Whale Watch:

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

## Deploying

Push to GitHub and import into Vercel. Configure `NGX_API_KEY` as a Vercel
environment variable so it remains server-side.

For production builds, the project uses Webpack because
`@ducanh2912/next-pwa` generates its service worker through a Webpack plugin.

## Icons

Placeholder icons are in `public/icons/`. Replace the 192×192, 512×512, and
maskable 512×512 icons before shipping.

## Fonts

`globals.css` currently uses system fonts. You can re-add `next/font/google`
in `src/app/layout.tsx` when building with access to Google Fonts.
