import { FeatureSet, Signal, TradePlan } from '../types';
import { MARKET_CONFIG, SIGNAL_THRESHOLDS, RISK_LIMITS } from '../constants';

// Generates random market noise to simulate live data
export const generateFeatureSet = (): FeatureSet => {
  // We add some bias to make it oscillate between conditions
  const time = Date.now() / 10000; 
  
  return {
    vwap_dist: parseFloat((Math.sin(time) * 0.5).toFixed(2)), // -0.5 to 0.5
    ema20_slope: parseFloat((Math.cos(time) * 0.2).toFixed(2)), // -0.2 to 0.2
    breadth: parseFloat((1.0 + Math.sin(time * 0.5) * 0.5).toFixed(2)), // 0.5 to 1.5
    fii_5d: Math.floor(Math.random() * 1000 - 400), // -400 to 600
    fut_oi_chg: parseFloat((Math.random() * 4 - 2).toFixed(1)), // -2 to 2
    dxy_chg: parseFloat((Math.random() * 0.4 - 0.2).toFixed(2)), // -0.2 to 0.2
    usfut: parseFloat((Math.random() * 1.0 - 0.4).toFixed(1)), // -0.4 to 0.6
    iv_rank: parseFloat(Math.random().toFixed(2)),
    sent: parseFloat((Math.random() * 0.4 - 0.2).toFixed(1))
  };
};

// Logic from engine/signal_rules.py
export const decideSignal = (f: FeatureSet): Signal => {
  const t = SIGNAL_THRESHOLDS;

  const long_call = (
    f.vwap_dist > t.LONG_CALL.vwap_dist &&
    f.ema20_slope > t.LONG_CALL.ema20_slope &&
    f.breadth > t.LONG_CALL.breadth &&
    (f.fii_5d > t.LONG_CALL.fii_5d || f.fut_oi_chg > t.LONG_CALL.fut_oi_chg) &&
    f.usfut > t.LONG_CALL.usfut &&
    f.dxy_chg <= t.LONG_CALL.dxy_chg
  );

  if (long_call) {
    return {
      side: "BUY_CALL",
      grade: "A",
      reason: [
        "Above VWAP & EMA20 rising",
        "Breadth strong",
        "FII flows positive or OI supp",
        "Global cues not adverse"
      ]
    };
  }

  const long_put = (
    f.vwap_dist < t.LONG_PUT.vwap_dist &&
    f.ema20_slope < t.LONG_PUT.ema20_slope &&
    f.breadth < t.LONG_PUT.breadth &&
    (f.fii_5d < t.LONG_PUT.fii_5d || f.fut_oi_chg < t.LONG_PUT.fut_oi_chg) &&
    f.usfut < t.LONG_PUT.usfut
  );

  if (long_put) {
    return {
      side: "BUY_PUT",
      grade: "A",
      reason: [
        "Below VWAP & EMA20 falling",
        "Breadth weak",
        "FII flows negative",
        "Global risk-off"
      ]
    };
  }

  return {
    side: "NONE",
    grade: "C",
    reason: ["Filters not met"]
  };
};

// Logic from engine/plan.py and portfolio.py
export const createTradePlan = (signal: Signal, currentSpot: number): TradePlan | null => {
  if (signal.side === "NONE") return null;

  const expiry = "WEEKLY";
  // Simplified ATM selection
  const strike = Math.round(currentSpot / 50) * 50;
  const type = signal.side === "BUY_CALL" ? "CE" : "PE";
  const symbol = `${MARKET_CONFIG.SYMBOL_ROOT}${expiry}${strike}${type}`;
  
  // Simulated Premium (usually 0.5-1% of spot for ATM roughly, simplified here)
  const premium = parseFloat((Math.random() * 50 + 100).toFixed(2));

  // Logic from plan.py
  const sl = Math.max(0.35 * premium, 15.0);
  const tp1 = premium * 1.30;
  const tp2 = premium * 1.60;

  // Logic from portfolio.py
  // qty = int(max_trade_risk // stop_loss_cash)
  // stop_loss_cash is effectively the per-share SL amount
  // Assuming lot_size 50 for NIFTY (simplified)
  const lotSize = 50; 
  // NOTE: The PDF logic for PositionSize calculates qty as number of lots or raw qty?
  // "qty = qty * lot_size" suggests final raw quantity.
  // "qty = int(max_trade_risk // stop_loss_cash)" - here stop_loss_cash usually means risk per unit * units? 
  // Actually looking at PDF: `qty = int(max_trade_risk // stop_loss_cash)` where stop_loss_cash is passed in.
  // In `build_plan` it passes `sl` (price diff) as `stop_loss`. 
  // Let's assume `sl` in build_plan is price difference.
  // Wait, in `build_plan` sl is a price level or a difference?
  // `sl = max(0.35 * premium, 15.0)` -> This looks like a width (points).
  // `stop_loss=sl` in TradePlan.
  // Then `est_loss = max(plan.entry_price - plan.stop_loss, 0)` in run.py...
  // Wait, if `sl` is width (e.g. 30 pts), then `entry - sl` would be `120 - 30 = 90`.
  // Then `est_loss` calculation in run.py is `120 - 90 = 30`. Correct.
  // So `stop_loss_cash` in `size_option` call seems to be the risk per share?
  // run.py: `est_loss = max(plan.entry_price - plan.stop_loss, 0)` -> this is actually `entry - (entry-width) = width`.
  // Actually the PDF says: `est_loss = max(plan.entry_price - plan.stop_loss, 0)`.
  // If `stop_loss` in plan is the PRICE LEVEL, then this matches.
  // In `build_plan`: `sl = max(0.35 * premium, 15.0)`. This calculates a scalar value (width).
  // Then `stop_loss=sl`. 
  // This looks like a bug in the PDF or ambiguity. `stop_loss=sl` usually implies the level.
  // If `sl` is calculated as `0.35 * premium`, it is likely the risk amount.
  // Let's assume `stop_loss` in TradePlan is the Price Level.
  // So `stop_loss_level = premium - width`.
  
  const slWidth = Math.max(0.35 * premium, 15.0);
  const slLevel = parseFloat((premium - slWidth).toFixed(2));
  
  // Re-calculating risk per share for sizing
  const riskPerShare = premium - slLevel; // should be equal to slWidth
  
  let qtyLots = Math.floor(RISK_LIMITS.max_trade_risk / (riskPerShare * lotSize));
  qtyLots = Math.max(1, Math.min(qtyLots, RISK_LIMITS.max_open_positions)); // Simple cap
  const qty = qtyLots * lotSize;

  return {
    symbol,
    entry_time: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: "2-digit", minute: "2-digit" }),
    entry_price: premium,
    stop_loss: slLevel,
    target_1: parseFloat(tp1.toFixed(2)),
    target_2: parseFloat(tp2.toFixed(2)),
    qty,
    reason: signal.reason,
    status: 'PLANNED'
  };
};