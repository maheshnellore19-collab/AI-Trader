import { MarketConfig, RiskLimits, StrategyConfig } from './types';

export const MARKET_CONFIG: MarketConfig = {
  SYMBOL_ROOT: "NIFTY",
  ENTRY_NOT_BEFORE: "09:25",
  SQUARE_OFF_TIME: "15:15"
};

export const RISK_LIMITS: RiskLimits = {
  daily_capital: 20000,
  max_day_loss: 400,
  max_trade_risk: 200,
  max_open_positions: 2,
  disable_on_vix_above: 22
};

export const STRATEGY_CONFIG: StrategyConfig = {
  bar_interval: "5min",
  use_news: true,
  use_global: true
};

// Thresholds from signal_rules.py
export const SIGNAL_THRESHOLDS = {
  LONG_CALL: {
    vwap_dist: 0,
    ema20_slope: 0,
    breadth: 1.2,
    fii_5d: 0,
    fut_oi_chg: 0,
    usfut: -0.3,
    dxy_chg: 0.2 // <= this
  },
  LONG_PUT: {
    vwap_dist: 0,
    ema20_slope: 0,
    breadth: 0.9,
    fii_5d: 0,
    fut_oi_chg: 0,
    usfut: 0.0
  }
};