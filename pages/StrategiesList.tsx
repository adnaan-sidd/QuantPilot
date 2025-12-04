import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, FileText, ChevronRight } from 'lucide-react';

const StrategiesList = () => {
  // Mock data - in a real app, fetch from Supabase
  const strategies = [
    { id: '1', name: 'RSI Mean Reversion', asset: 'EURUSD', timeframe: 'H1', created: '2023-10-01', status: 'Active' },
    { id: '2', name: 'MACD Crossover V2', asset: 'BTCUSD', timeframe: 'M15', created: '2023-10-05', status: 'Draft' },
    { id: '3', name: 'Bollinger Breakout', asset: 'XAUUSD', timeframe: 'H4', created: '2023-10-10', status: 'Archived' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">My Strategies</h1>
            <p className="text-slate-400">Manage and refine your trading algorithms.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search strategies..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none"
                />
            </div>
            <Link to="/app/strategies/new" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap">
                <Plus className="w-4 h-4" /> New Strategy
            </Link>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Timeframe</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {strategies.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-slate-800 rounded-lg mr-3 text-brand-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <Link to={`/app/strategies/${s.id}`} className="font-medium text-white hover:text-brand-400 transition-colors">
                                  {s.name}
                                </Link>
                            </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300">{s.asset}</td>
                        <td className="px-6 py-4 font-mono text-slate-300">{s.timeframe}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                s.status === 'Active' ? 'bg-green-900/30 text-green-400' : 
                                s.status === 'Draft' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                                {s.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">{s.created}</td>
                        <td className="px-6 py-4 text-right">
                           <Link to={`/app/strategies/${s.id}`} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors inline-block">
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {strategies.length === 0 && (
            <div className="p-12 text-center">
                <p className="text-slate-500">No strategies found. Create your first one!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default StrategiesList;