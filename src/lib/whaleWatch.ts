import { MarketAsset } from "./types";

// A ticker qualifies as a "whale" when today's volume exceeds its trailing
// average volume by this multiple.
const WHALE_VOLUME_MULTIPLIER = 1.75;

export interface WhaleAsset extends MarketAsset {
  volume_ratio: number;
}

export function detectWhaleActivity(marketData: MarketAsset[]): WhaleAsset[] {
  return marketData
    .filter((asset) => asset.avg_volume > 0)
    .map((asset) => ({
      ...asset,
      volume_ratio: asset.volume / asset.avg_volume,
    }))
    .filter((asset) => asset.volume_ratio >= WHALE_VOLUME_MULTIPLIER)
    .sort((a, b) => b.volume_ratio - a.volume_ratio);
}
