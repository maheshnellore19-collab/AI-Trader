export interface MarketConfig {
  SYMBOL_ROOT: string;
  ENTRY_NOT_BEFORE: string;
  SQUARE_OFF_TIME: string;
}

export interface RiskLimits {
  daily_capital: number;
  max_day_loss: number;
  max_trade_risk: number;
  max_open_positions: number;
  disable_on_vix_above: number;
}

export interface StrategyConfig {
  bar_interval: string;
  use_news: boolean;
  use_global: boolean;
}

export interface FeatureSet {
  vwap_dist: number;
  ema20_slope: number;
  breadth: number;
  fii_5d: number;
  fut_oi_chg: number;
  dxy_chg: number;
  usfut: number;
  iv_rank: number;
  sent: number;
}

export interface Signal {
  side: 'BUY_CALL' | 'BUY_PUT' | 'NONE';
  grade: 'A' | 'B' | 'C';
  reason: string[];
}

export interface TradePlan {
  symbol: string;
  entry_time: string;
  entry_price: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  qty: number;
  reason: string[];
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED';
  pnl?: number;
}

export interface GlobalCues {
  es1h: number;
  dxy1h: number;
  crude1h: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
}