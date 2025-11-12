import React from 'react';
import { TradePlan } from '../types';
import { ScrollText, Target, ShieldAlert, Clock } from 'lucide-react';

interface TradePlanCardProps {
  plan: TradePlan | null;
}

export const TradePlanCard: React.FC<TradePlanCardProps> = ({ plan }) => {
  if (!plan) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 h-full flex flex-col items-center justify-center text-gray-500 border-dashed">
        <ScrollText size={48} className="mb-4 opacity-50" />
        <p>No Active Trade Plan</p>
        <p className="text-xs mt-2">Waiting for signal validation...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden h-full">
      <div className="p-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ScrollText size={18} className="text-yellow-500" />
          Trade Plan
        </h3>
        <span className="text-xs font-mono bg-gray-700 text-gray-300 px-2 py-1 rounded">
          {plan.status}
        </span>
      </div>
      
      <div className="p-5 space-y-5">
        <div className="flex justify-between items-baseline">
          <h2 className="text-2xl font-bold text-yellow-400 font-mono tracking-tight">{plan.symbol}</h2>
          <div className="text-right">
            <span className="text-gray-400 text-xs block uppercase">Entry Price</span>
            <span className="text-xl font-bold text-white">₹{plan.entry_price}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={14} className="text-red-400" />
              <span className="text-xs text-red-300 uppercase font-bold">Stop Loss</span>
            </div>
            <span className="text-lg font-mono font-bold text-red-400">₹{plan.stop_loss}</span>
            <span className="text-xs text-red-500/60 block mt-1">Max Risk</span>
          </div>
          
          <div className="bg-green-900/20 border border-green-900/50 p-3 rounded-lg">
             <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-green-400" />
              <span className="text-xs text-green-300 uppercase font-bold">Target 1</span>
            </div>
            <span className="text-lg font-mono font-bold text-green-400">₹{plan.target_1}</span>
            <span className="text-xs text-green-500/60 block mt-1">1:1.3 R:R</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-700/50">
          <div className="flex justify-between text-sm">
             <span className="text-gray-400 flex items-center gap-2"><Clock size={14}/> Entry Time</span>
             <span className="text-gray-200 font-mono">{plan.entry_time}</span>
          </div>
          <div className="flex justify-between text-sm">
             <span className="text-gray-400">Quantity</span>
             <span className="text-gray-200 font-mono">{plan.qty} ({(plan.qty/50).toFixed(0)} Lots)</span>
          </div>
          <div className="flex justify-between text-sm">
             <span className="text-gray-400">Target 2 (Extension)</span>
             <span className="text-gray-200 font-mono">₹{plan.target_2}</span>
          </div>
        </div>
        
        <div className="mt-4 bg-gray-900 p-3 rounded font-mono text-xs text-gray-400 overflow-x-auto">
           {JSON.stringify({
               symbol: plan.symbol,
               stops: "35% premium",
               targets: ["+30%", "trail ATR"],
               logic: plan.reason
           }, null, 2)}
        </div>
      </div>
    </div>
  );
};