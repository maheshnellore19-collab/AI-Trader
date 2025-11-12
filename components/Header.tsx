import React from 'react';
import { Zap, Settings, User, Bell } from 'lucide-react';
import { MARKET_CONFIG } from '../constants';

interface HeaderProps {
  connected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ connected }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 h-16 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
            <Zap className="text-white" size={20} fill="currentColor" />
        </div>
        <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AI Intraday Trader</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-gray-800 px-1.5 rounded text-gray-300">{MARKET_CONFIG.SYMBOL_ROOT}</span>
                <span>•</span>
                <span>SQUARE OFF {MARKET_CONFIG.SQUARE_OFF_TIME} IST</span>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium text-gray-300">{connected ? 'System Armed' : 'Disconnected'}</span>
        </div>
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings size={20} />
        </button>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
            AI
        </div>
      </div>
    </header>
  );
};