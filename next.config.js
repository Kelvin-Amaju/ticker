const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        // Live prices: try the network first, fall back to the last cached
        // response when offline — keeps holdings viewable without a
        // connection, per the PWA offline requirement.
        urlPattern: /\/api\/market/,
        handler: "NetworkFirst",
        options: {
          cacheName: "market-data",
          networkTimeoutSeconds: 4,
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-images",
          expiration: {
            maxEntries: 40,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack config silences the Next.js 16 error that fires when a
  // webpack config (injected by @ducanh2912/next-pwa) is present but no
  // turbopack config is set.  PWA is disabled in development so this is safe.
  turbopack: {},
};

module.exports = withPWA(nextConfig);
