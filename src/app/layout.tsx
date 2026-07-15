import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppDataProvider } from "@/context/AppDataContext";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Ticker — NGX Portfolio Tracker",
  description: "Track your Nigerian Exchange portfolio, entirely on-device.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ticker",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppDataProvider>
          <AuthGate>{children}</AuthGate>
        </AppDataProvider>
      </body>
    </html>
  );
}
