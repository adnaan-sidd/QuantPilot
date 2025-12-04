import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Calendar, ChevronRight } from 'lucide-react';

const BacktestsList = () => {
  // Mock data
  const backtests = [
    { id: 'bk-101', strategy: 'RSI Mean Reversion', result: 12.4, trades: 142, date: '2023-10-25', status: 'Completed' },
    { id: 'bk-102', strategy: 'RSI Mean Reversion', result: -2.1, trades: 88, date: '2023-10-24', status: 'Completed' },
    { id: 'bk-103', strategy: 'MACD Crossover V2', result: 5.8, trades: 34, date: '2023-10-22', status: 'Completed' },
    { id: 'bk-104', strategy: 'Bollinger Breakout', result: 0, trades: 0, date: '2023-10-20', status: 'Failed' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Backtest History</h1>
        <p className="text-slate-400">Review past performance simulations.</p>
      </div>

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
    </div>
  );
};

export default BacktestsList;