import { get, set } from "idb-keyval";
import { AppData, EMPTY_APP_DATA, Holding } from "./types";

const STORAGE_KEY = "ngx_portfolio_app";

export async function loadAppData(): Promise<AppData> {
  try {
    const data = await get<AppData>(STORAGE_KEY);
    if (!data) return structuredClone(EMPTY_APP_DATA);
    // Defensive merge in case of partial/older payloads
    return {
      user_profile: { ...EMPTY_APP_DATA.user_profile, ...data.user_profile },
      portfolio: {
        holdings: data.portfolio?.holdings ?? [],
      },
      favorites: data.favorites ?? [],
      settings: { ...EMPTY_APP_DATA.settings, ...data.settings },
    };
  } catch {
    return structuredClone(EMPTY_APP_DATA);
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await set(STORAGE_KEY, data);
}

export async function updateAppData(
  mutator: (data: AppData) => AppData
): Promise<AppData> {
  const current = await loadAppData();
  const next = mutator(current);
  await saveAppData(next);
  return next;
}

export async function completeOnboarding(
  displayName: string,
  pinHash: string
): Promise<AppData> {
  return updateAppData((data) => ({
    ...data,
    user_profile: {
      display_name: displayName,
      pin_hash: pinHash,
      setup_completed: true,
    },
  }));
}

export async function addHolding(holding: Holding): Promise<AppData> {
  return updateAppData((data) => {
    const existingIndex = data.portfolio.holdings.findIndex(
      (h) => h.ticker === holding.ticker
    );
    const holdings = [...data.portfolio.holdings];
    if (existingIndex >= 0) {
      const existing = holdings[existingIndex];
      const totalShares = existing.shares + holding.shares;
      const blendedCost =
        (existing.shares * existing.average_buy_price +
          holding.shares * holding.average_buy_price) /
        totalShares;
      holdings[existingIndex] = {
        ticker: existing.ticker,
        shares: totalShares,
        average_buy_price: blendedCost,
      };
    } else {
      holdings.push(holding);
    }
    return { ...data, portfolio: { holdings } };
  });
}

export async function removeHolding(ticker: string): Promise<AppData> {
  return updateAppData((data) => ({
    ...data,
    portfolio: {
      holdings: data.portfolio.holdings.filter((h) => h.ticker !== ticker),
    },
  }));
}

export async function toggleFavorite(ticker: string): Promise<AppData> {
  return updateAppData((data) => {
    const isFav = data.favorites.includes(ticker);
    return {
      ...data,
      favorites: isFav
        ? data.favorites.filter((t) => t !== ticker)
        : [...data.favorites, ticker],
    };
  });
}

export { STORAGE_KEY };
