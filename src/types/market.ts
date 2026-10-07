export type MarketCategory = 'overview' | 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'bonds' | 'heatmaps' | 'news';

export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'bonds';

export type ChartType = 'candlestick' | 'area' | 'line' | 'baseline';

export type TimeFrame = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolData {
  symbol: string;
  name: string;
  category: AssetCategory;
  sector?: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high24h: number;
  low24h: number;
  volume: string;
  volumeNum: number;
  avgVolume3M?: string;
  marketCap?: string;
  marketCapNum?: number;
  peRatio?: number | null;
  divYield?: number | null;
  eps?: number | null;
  beta?: number | null;
  week52High: number;
  week52Low: number;
  rating: TechnicalRating;
  ratingScores?: {
    buy: number;
    neutral: number;
    sell: number;
  };
  sparkline: number[];
  candles: Record<TimeFrame, CandleData[]>;
  description?: string;
}

export interface SectorItem {
  id: string;
  name: string;
  weight: number; // percentage of S&P 500
  changePercent: number;
  marketCap: string;
  leader: string;
  leaderChange: number;
  stocksCount: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: 'All' | 'Stocks' | 'Crypto' | 'Macro' | 'Forex';
  relatedSymbols: string[];
  url?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  flag: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface WatchlistAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  created: string;
  triggered: boolean;
}
