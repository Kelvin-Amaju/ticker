export interface Holding {
  ticker: string;
  shares: number;
  average_buy_price: number;
}

export interface UserProfile {
  display_name: string;
  pin_hash: string;
  setup_completed: boolean;
}

export interface AppSettings {
  theme: "dark";
}

export interface AppData {
  user_profile: UserProfile;
  portfolio: {
    holdings: Holding[];
  };
  favorites: string[];
  settings: AppSettings;
}

export const EMPTY_APP_DATA: AppData = {
  user_profile: {
    display_name: "",
    pin_hash: "",
    setup_completed: false,
  },
  portfolio: {
    holdings: [],
  },
  favorites: [],
  settings: {
    theme: "dark",
  },
};

export interface MarketAsset {
  ticker: string;
  name: string;
  price: number;
  change_percent: number;
  volume: number;
  avg_volume: number;
  sector: string;
}

export interface HistoricalPrice {
  date: string;
  close_price: number;
}

export interface HoldingPerformance extends Holding {
  current_price: number;
  current_value: number;
  profit_loss: number;
  percentage_return: number;
}

export interface PortfolioSummary {
  holdings: HoldingPerformance[];
  total_value: number;
  total_profit_loss: number;
  total_percentage_return: number;
}
