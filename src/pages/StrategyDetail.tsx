import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, BarChart2, Edit, Trash2, Calendar, Upload, ChevronDown, Shield, Target } from 'lucide-react';
import { StrategyConfig, DataSource, DataDuration, StrategyStatus } from '../types';

const StrategyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<DataSource>('Yahoo Finance');
  const [customFile, setCustomFile] = useState<File | null>(null);
  
  // Date Range State
  // Default to last 30 days
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);

  // Status State
  const [status, setStatus] = useState<StrategyStatus>('Active');

  // Mock Data: In production, fetch using `id` from Supabase
  const strategy = {
    id,
    name: 'RSI Mean Reversion',
    description: 'A classic mean reversion strategy that buys when RSI is oversold and sells when RSI is overbought.',
    config: {
      asset: "EURUSD",
      timeframe: "H1",
      entryRules: ["RSI(14) < 30", "Close < Lower Bollinger Band(20, 2)"],
      exitRules: ["RSI(14) > 70", "Stop Loss 50 pips"],
      stopLoss: "50 pips",
      takeProfit: "100 pips",
      riskPerTrade: "1%"
    } as StrategyConfig,
    created: '2023-10-01',
  };

  // State for editable config
  const [config, setConfig] = useState<StrategyConfig>(strategy.config);

  const setDatePreset = (preset: '1M' | '3M' | 'YTD' | 'ALL') => {
      const end = new Date();
      const start = new Date();
      
      if (preset === '1M') {
          start.setMonth(start.getMonth() - 1);
      } else if (preset === '3M') {
          start.setMonth(start.getMonth() - 3);
      } else if (preset === 'YTD') {
          start.setMonth(0, 1); // Jan 1st of current year
      } else if (preset === 'ALL') {
          start.setFullYear(start.getFullYear() - 3); // Arbitrary long range
      }

      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
  };

  const handleRunBacktest = () => {
    // 1. In a real app, POST to /api/backtests to create a pending job
    // 2. We mock this by creating a mock ID and status
    const mockBacktestId = `bk-${Date.now()}`;
    
    if (dataSource === 'Custom Upload' && !customFile) {
        alert("Please upload a CSV file or select a different data source.");
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after end date.");
        return;
    }

    // Navigate to results page with 'pending' status and selected dataSource
    navigate(`/app/backtests/${mockBacktestId}`, { 
        state: { 
            status: 'pending', // Indicate polling is needed
            config: config, // Use the editable config state
            dataSource,
            dateRange: { start: startDate, end: endDate },
            customFileName: customFile?.name
        } 
    });
  };

  const getStatusColor = (s: StrategyStatus) => {
      switch(s) {
          case 'Active': return 'bg-green-900/30 text-green-400 border-green-900/50';
          case 'Draft': return 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50';
          case 'Archived': return 'bg-slate-800 text-slate-400 border-slate-700';
          default: return 'bg-slate-800 text-slate-400';
      }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/app/strategies" className="flex items-center text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Strategies
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{strategy.name}</h1>
                <div className="relative group">
                    <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value as StrategyStatus)}
                        className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 ${getStatusColor(status)}`}
                    >
                        <option value="Active" className="bg-slate-900 text-green-400">Active</option>
                        <option value="Draft" className="bg-slate-900 text-yellow-400">Draft</option>
                        <option value="Archived" className="bg-slate-900 text-slate-400">Archived</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-70" />
                </div>
            </div>
            <p className="text-slate-400 max-w-2xl">{strategy.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center transition-colors">
                <Edit className="w-4 h-4 mr-2" /> Edit Details
            </button>
            <button 
                onClick={handleRunBacktest}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold flex items-center shadow-lg shadow-brand-900/20 transition-all hover:scale-105"
            >
                <Play className="w-4 h-4 mr-2 fill-current" /> Run Backtest
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Config */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <BarChart2 className="w-5 h-5 mr-2 text-brand-400" /> 
                    Strategy Rules
                </h2>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Entry Conditions</h3>
                        <div className="space-y-2">
                            {config.entryRules.map((rule, i) => (
                                <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-200 font-mono text-sm border-l-4 border-l-green-500">
                                    {rule}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Exit Conditions</h3>
                        <div className="space-y-2">
                            {config.exitRules.map((rule, i) => (
                                <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-200 font-mono text-sm border-l-4 border-l-red-500">
                                    {rule}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Management Section - New */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-brand-400" />
                    Risk Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Stop Loss</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={config.stopLoss || "50 pips"} // Default fallback
                                onChange={(e) => setConfig({...config, stopLoss: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="e.g. 50 pips"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                <Shield className="w-4 h-4 text-red-500" />
                            </div>
                        </div>
                         <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                             <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> 
                             Defines max loss per trade
                         </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Take Profit</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={config.takeProfit || "100 pips"} // Default fallback
                                onChange={(e) => setConfig({...config, takeProfit: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="e.g. 100 pips"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                <Target className="w-4 h-4 text-green-500" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 
                             Defines target exit price
                         </p>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-brand-400" />
                    Backtest Settings
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Data Source Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Data Source</label>
                        <div className="relative">
                            <select 
                                value={dataSource}
                                onChange={(e) => setDataSource(e.target.value as DataSource)}
                                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg py-3 pl-3 pr-8 text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="Yahoo Finance">Yahoo Finance</option>
                                <option value="Dukascopy">Dukascopy (Forex)</option>
                                <option value="Binance">Binance (Crypto)</option>
                                <option value="Custom Upload">Custom Upload (CSV/JSON)</option>
                            </select>
                             <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Input: File or Date Range */}
                    <div>
                        {dataSource === 'Custom Upload' ? (
                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Upload History File</label>
                                <label className="flex flex-col items-center justify-center w-full h-12 border border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-950 hover:bg-slate-900">
                                    <div className="flex items-center justify-center pt-5 pb-6">
                                        {customFile ? (
                                             <span className="text-sm text-green-400 font-medium truncate px-2">{customFile.name}</span>
                                        ) : (
                                            <div className="flex items-center text-slate-500 gap-2">
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm">Click to upload</span>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".csv,.json"
                                        onChange={(e) => e.target.files && setCustomFile(e.target.files[0])}
                                    />
                                </label>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Duration</label>
                                {/* Quick Presets */}
                                <div className="flex gap-2 mb-3">
                                    {['1M', '3M', 'YTD', 'ALL'].map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => setDatePreset(preset as any)}
                                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-medium border border-slate-700 transition-colors"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <input 
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2.5 text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2.5 text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Summary</h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400">Asset Class</span>
                        <span className="text-white font-medium">{strategy.config.asset}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400">Timeframe</span>
                        <span className="text-white font-medium">{strategy.config.timeframe}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400">Risk Per Trade</span>
                        <span className="text-white font-medium">{strategy.config.riskPerTrade}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400">Created On</span>
                        <span className="text-white font-medium">{strategy.created}</span>
                    </div>
                </div>
            </div>

            <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6">
                <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
                <p className="text-red-400/70 text-sm mb-4">Deleting a strategy is permanent and cannot be undone.</p>
                <button className="w-full py-2 border border-red-900/50 text-red-400 rounded-lg hover:bg-red-900/20 text-sm font-medium flex items-center justify-center">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Strategy
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyDetail;