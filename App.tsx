import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MetricsCard } from './components/MetricsCard';
import { SignalPanel } from './components/SignalPanel';
import { TradePlanCard } from './components/TradePlanCard';
import { Activity, Wallet, Layers, Terminal } from 'lucide-react';
import { FeatureSet, Signal, TradePlan, LogEntry } from './types';
import { RISK_LIMITS } from './constants';
import { generateFeatureSet, decideSignal, createTradePlan } from './services/simulationEngine';

function App() {
  // State
  const [features, setFeatures] = useState<FeatureSet>(generateFeatureSet());
  const [signal, setSignal] = useState<Signal>({ side: 'NONE', grade: 'C', reason: [] });
  const [activePlan, setActivePlan] = useState<TradePlan | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [spotPrice, setSpotPrice] = useState<number>(24350.00);
  const [pnl, setPnl] = useState<number>(0);
  
  // Refs for simulation loop
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Scroll to bottom of logs
  useEffect(() => {
    // In this layout, logs are newest first, so we don't auto-scroll down, 
    // but if we had a standard terminal, we would.
  }, [logs]);

  // Main Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Market Data (Random Walk)
      setSpotPrice(prev => {
        const change = (Math.random() - 0.5) * 10;
        return parseFloat((prev + change).toFixed(2));
      });

      // 2. Update Features
      const newFeatures = generateFeatureSet();
      setFeatures(newFeatures);

      // 3. Decide Signal
      const newSignal = decideSignal(newFeatures);
      
      // Only update signal state if it changed to reduce re-renders
      setSignal(prev => {
        if (prev.side !== newSignal.side) {
            if (newSignal.side !== 'NONE') {
                 addLog(`Signal Detected: ${newSignal.side} (Grade ${newSignal.grade})`, 'SUCCESS');
            }
            return newSignal;
        }
        return prev;
      });

      // 4. Manage Trade Plan
      if (newSignal.side !== 'NONE' && !activePlan) {
        // Simulate entry delay
        if (Math.random() > 0.7) {
           const plan = createTradePlan(newSignal, spotPrice);
           if (plan) {
               setActivePlan(plan);
               addLog(`Generating Trade Plan for ${plan.symbol}`, 'INFO');
               setTimeout(() => {
                   setActivePlan(p => p ? {...p, status: 'ACTIVE'} : null);
                   addLog(`Order Executed: ${plan.symbol} x${plan.qty} @ ${plan.entry_price}`, 'SUCCESS');
               }, 2000);
           }
        }
      } else if (activePlan && activePlan.status === 'ACTIVE') {
          // Simulate P&L for active plan
          const noise = (Math.random() - 0.5) * 5;
          setPnl(prev => prev + noise);
          
          // Random exit
          if (Math.random() > 0.98) {
              addLog(`Target Hit/Stop Loss: Exiting ${activePlan.symbol}`, 'WARNING');
              setActivePlan(null);
              setPnl(prev => prev + (Math.random() > 0.5 ? 500 : -200)); // realize PnL
          }
      }

    }, 1000); // 1s tick for demo purposes

    return () => clearInterval(interval);
  }, [activePlan, spotPrice]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header connected={true} />

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Stats & Signals (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricsCard 
              title="Day P&L" 
              value={`₹${Math.abs(pnl).toFixed(0)}`} 
              subValue={pnl >= 0 ? "+0.0%" : "-0.0%"} 
              trend={pnl >= 0 ? 'up' : 'down'} 
              icon={Wallet} 
            />
            <MetricsCard 
              title="Active Positions" 
              value={activePlan ? 1 : 0} 
              subValue={`Max ${RISK_LIMITS.max_open_positions}`} 
              trend="neutral" 
              icon={Layers} 
            />
             <MetricsCard 
              title="Spot Price" 
              value={spotPrice} 
              subValue="NIFTY 50" 
              trend={Math.random() > 0.5 ? 'up' : 'down'} 
              icon={Activity} 
            />
          </div>

          {/* Signal Engine Panel */}
          <div className="h-[400px]">
             <SignalPanel features={features} currentSignal={signal} />
          </div>

          {/* Logs Console */}
          <div className="bg-black/40 rounded-xl border border-gray-800 p-4 h-64 overflow-hidden flex flex-col font-mono text-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-3 pb-2 border-b border-gray-800">
                <Terminal size={16} />
                <span className="uppercase font-bold text-xs tracking-wider">System Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-3">
                        <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                        <span className={`
                            ${log.level === 'INFO' ? 'text-blue-400' : ''}
                            ${log.level === 'SUCCESS' ? 'text-green-400' : ''}
                            ${log.level === 'WARNING' ? 'text-yellow-400' : ''}
                            ${log.level === 'ERROR' ? 'text-red-400' : ''}
                        `}>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Trade Plan & Risk (4 cols) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
            <div className="flex-1 min-h-[400px]">
                <TradePlanCard plan={activePlan} />
            </div>
            
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Risk Configuration</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-300">
                        <span>Daily Capital Cap</span>
                        <span className="font-mono">₹{RISK_LIMITS.daily_capital}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-300">
                        <span>Max Day Loss</span>
                        <span className="font-mono text-red-400">-₹{RISK_LIMITS.max_day_loss}</span>
                    </div>
                     <div className="flex justify-between text-sm text-gray-300">
                        <span>Risk Per Trade</span>
                        <span className="font-mono text-yellow-400">₹{RISK_LIMITS.max_trade_risk}</span>
                    </div>
                    <div className="pt-3 mt-2 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Auto Square-off</span>
                            <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded font-bold">15:15 IST</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}

export default App;