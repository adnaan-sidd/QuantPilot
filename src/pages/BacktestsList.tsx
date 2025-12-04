import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Calendar, ChevronRight, TrendingUp } from 'lucide-react';

const BacktestsList = () => {
  // Initialized empty for fresh account
  const [backtests, setBacktests] = useState<any[]>([]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Backtest History</h1>
        <p className="text-slate-400">Review past performance simulations.</p>
      </div>

      <div className="min-h-[400px]">
        {backtests.length > 0 ? (
            <div className="grid gap-4">
                {backtests.map((bk) => (
                    <div key={bk.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-slate-700 transition-colors group">
                        <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                            <div className={`p-3 rounded-xl ${bk.status === 'Completed' ? 'bg-slate-800 text-brand-400' : 'bg-red-900/20 text-red-400'}`}>
                                <BarChart2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{bk.strategy}</h3>
                                <div className="flex items-center text-sm text-slate-500 gap-4 mt-1">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {bk.date}</span>
                                    <span>{bk.trades} Trades</span>
                                    <span className="font-mono text-xs text-slate-600">ID: {bk.id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Net Profit</span>
                                <span className={`text-xl font-bold ${bk.result > 0 ? 'text-green-400' : bk.result < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                    {bk.result > 0 ? '+' : ''}{bk.result}%
                                </span>
                            </div>
                            
                            <Link to={`/app/backtests/${bk.id}`} className="p-2 bg-slate-800 hover:bg-brand-600 rounded-full text-slate-400 hover:text-white transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-xl p-12 text-center h-[400px]">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No simulations run</h3>
                <p className="text-slate-400 max-w-sm mb-8">
                    Your history is empty. Run a backtest on any strategy to see performance metrics here.
                </p>
                <Link to="/app/strategies/new" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all border border-slate-700">
                    Go to Strategy Lab
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default BacktestsList;