import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StrategyConfig, DataSource } from '../types';
import { runMockBacktest } from '../services/mockEngine';
import { Play, ArrowLeft, Loader2, CheckCircle, Database } from 'lucide-react';

const BacktestPreview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>('Yahoo Finance');
  
  // Use state or defaults if accessing directly (dev mode)
  const config: StrategyConfig = state?.config || {
    asset: "EURUSD",
    timeframe: "H1",
    entryRules: ["Price > 200 EMA", "RSI < 30"],
    exitRules: ["RSI > 70", "Stop Loss Hit"],
    stopLoss: "50 pips",
    takeProfit: "100 pips",
    riskPerTrade: "1%"
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
        const result = await runMockBacktest('temp-strategy-id', config, dataSource);
        // Pass result to results page
        navigate(`/app/backtests/${result.id}`, { state: { backtest: result, config } });
    } catch (e) {
        alert("Simulation failed");
        setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Edit
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Config View */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="text-green-500 w-5 h-5" /> AI Parsed Configuration
                </h2>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Asset</span>
                        <div className="text-lg text-white font-mono">{config.asset}</div>
                    </div>
                    <div>
                        <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Timeframe</span>
                        <div className="text-lg text-white font-mono">{config.timeframe}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Entry Conditions</span>
                        <ul className="mt-2 space-y-2">
                            {config.entryRules.map((rule, i) => (
                                <li key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-200 text-sm">
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Exit Conditions</span>
                         <ul className="mt-2 space-y-2">
                            {config.exitRules.map((rule, i) => (
                                <li key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-200 text-sm">
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-900/10 border border-red-900/30 p-3 rounded-lg">
                            <span className="text-xs text-red-400 font-bold uppercase">Stop Loss</span>
                            <div className="text-white">{config.stopLoss}</div>
                        </div>
                        <div className="bg-green-900/10 border border-green-900/30 p-3 rounded-lg">
                             <span className="text-xs text-green-400 font-bold uppercase">Take Profit</span>
                            <div className="text-white">{config.takeProfit}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: Action */}
        <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-4">Ready to test?</h3>
                <p className="text-slate-400 text-sm mb-6">
                    We will run this strategy against the last 30 days of high-fidelity mock data.
                </p>
                <div className="space-y-4 mb-6">
                     <div className="text-sm">
                        <label className="text-slate-500 block mb-1">Data Source</label>
                        <div className="relative">
                            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <select 
                                value={dataSource}
                                onChange={(e) => setDataSource(e.target.value as DataSource)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-2 text-white text-sm focus:ring-1 focus:ring-brand-500 outline-none appearance-none"
                            >
                                <option value="Yahoo Finance">Yahoo Finance</option>
                                <option value="Dukascopy">Dukascopy (Forex)</option>
                                <option value="Binance">Binance (Crypto)</option>
                            </select>
                        </div>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Est. Time</span>
                        <span className="text-white">~5 Seconds</span>
                    </div>
                </div>
                
                <hr className="my-6 border-slate-800" />

                <button 
                    onClick={handleRun}
                    disabled={isRunning}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-900/20"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            Running Simulation...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            Run Backtest
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default BacktestPreview;