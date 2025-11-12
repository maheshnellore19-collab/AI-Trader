import React from 'react';
import { FeatureSet, Signal } from '../types';
import { SIGNAL_THRESHOLDS } from '../constants';
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';

interface SignalPanelProps {
  features: FeatureSet;
  currentSignal: Signal;
}

const ConditionRow: React.FC<{ label: string; value: number; threshold: string; met: boolean }> = ({ label, value, threshold, met }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
    <div className="flex flex-col">
      <span className="text-gray-300 text-sm font-medium">{label}</span>
      <span className="text-gray-500 text-xs">Thresh: {threshold}</span>
    </div>
    <div className="flex items-center space-x-3">
      <span className={`font-mono font-bold ${met ? 'text-green-400' : 'text-red-400'}`}>
        {value.toFixed(2)}
      </span>
      {met ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-600" />}
    </div>
  </div>
);

export const SignalPanel: React.FC<SignalPanelProps> = ({ features, currentSignal }) => {
  const t = SIGNAL_THRESHOLDS;
  
  // Determine which set of rules to highlight based on bias or potential
  // For visualization, we show "Long Call" conditions if metrics lean positive, else "Long Put"
  const showCall = features.vwap_dist > -0.1; 
  
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center rounded-t-xl">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity size={18} className="text-blue-400" />
          Signal Engine
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1
          ${currentSignal.side === 'BUY_CALL' ? 'bg-green-900/50 text-green-400 border border-green-700' : 
            currentSignal.side === 'BUY_PUT' ? 'bg-red-900/50 text-red-400 border border-red-700' : 
            'bg-gray-700 text-gray-400'}`}>
           {currentSignal.side === 'NONE' ? 'NO SIGNAL' : currentSignal.side}
           {currentSignal.side !== 'NONE' && <span className="ml-1 text-[10px] bg-black/30 px-1 rounded">Grade {currentSignal.grade}</span>}
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
        {/* CALL CONDITIONS */}
        <div className={`p-4 rounded-lg border ${showCall ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-800/20 border-gray-700 opacity-50'}`}>
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Bullish Logic (Long Call)</h4>
          <ConditionRow label="VWAP Dist" value={features.vwap_dist} threshold={`> ${t.LONG_CALL.vwap_dist}`} met={features.vwap_dist > t.LONG_CALL.vwap_dist} />
          <ConditionRow label="EMA20 Slope" value={features.ema20_slope} threshold={`> ${t.LONG_CALL.ema20_slope}`} met={features.ema20_slope > t.LONG_CALL.ema20_slope} />
          <ConditionRow label="Market Breadth" value={features.breadth} threshold={`> ${t.LONG_CALL.breadth}`} met={features.breadth > t.LONG_CALL.breadth} />
          <ConditionRow label="FII 5D Net" value={features.fii_5d} threshold={`> ${t.LONG_CALL.fii_5d}`} met={features.fii_5d > t.LONG_CALL.fii_5d} />
          <ConditionRow label="Global US Fut" value={features.usfut} threshold={`> ${t.LONG_CALL.usfut}`} met={features.usfut > t.LONG_CALL.usfut} />
        </div>

        {/* PUT CONDITIONS */}
        <div className={`p-4 rounded-lg border ${!showCall ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-800/20 border-gray-700 opacity-50'}`}>
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Bearish Logic (Long Put)</h4>
          <ConditionRow label="VWAP Dist" value={features.vwap_dist} threshold={`< ${t.LONG_PUT.vwap_dist}`} met={features.vwap_dist < t.LONG_PUT.vwap_dist} />
          <ConditionRow label="EMA20 Slope" value={features.ema20_slope} threshold={`< ${t.LONG_PUT.ema20_slope}`} met={features.ema20_slope < t.LONG_PUT.ema20_slope} />
          <ConditionRow label="Market Breadth" value={features.breadth} threshold={`< ${t.LONG_PUT.breadth}`} met={features.breadth < t.LONG_PUT.breadth} />
          <ConditionRow label="FII 5D Net" value={features.fii_5d} threshold={`< ${t.LONG_PUT.fii_5d}`} met={features.fii_5d < t.LONG_PUT.fii_5d} />
           <ConditionRow label="Global US Fut" value={features.usfut} threshold={`< ${t.LONG_PUT.usfut}`} met={features.usfut < t.LONG_PUT.usfut} />
        </div>
      </div>
      
      {currentSignal.reason.length > 0 && currentSignal.side !== 'NONE' && (
        <div className="px-4 pb-4">
            <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={16} />
                <div>
                    <span className="text-blue-200 text-sm font-semibold block mb-1">Signal Generated:</span>
                    <ul className="list-disc list-inside text-xs text-blue-300/80 space-y-1">
                        {currentSignal.reason.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};