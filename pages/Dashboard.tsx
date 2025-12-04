import React from 'react';
import { Plus, TrendingUp, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon, trend }: any) => (
  <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="p-2 bg-slate-800 rounded-lg text-brand-400">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline">
      <h2 className="text-2xl font-bold text-white">{value}</h2>
      {trend && <span className="ml-2 text-sm text-green-400">{trend}</span>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {displayName}.</p>
        </div>
        <Link to="/app/strategies/new" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Strategy
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Backtests" 
          value="12" 
          trend="+3 this week" 
          icon={<Clock className="w-5 h-5" />} 
        />
        <StatCard 
          title="Highest Win Rate" 
          value="68.5%" 
          icon={<TrendingUp className="w-5 h-5" />} 
        />
        <StatCard 
          title="Best Strategy Score" 
          value="92/100" 
          icon={<Award className="w-5 h-5" />} 
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase">
              <tr>
                <th className="px-6 py-3">Strategy Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Result</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'RSI Mean Reversion', status: 'Completed', asset: 'EURUSD', res: '+12.4%', date: '2 mins ago' },
                { name: 'MACD Crossover V2', status: 'Completed', asset: 'BTCUSD', res: '-3.2%', date: 'Yesterday' },
                { name: 'Bollinger Breakout', status: 'Failed', asset: 'XAUUSD', res: '-', date: '3 days ago' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-white">{row.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      row.status === 'Completed' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>{row.status}</span>
                  </td>
                  <td className="px-6 py-4">{row.asset}</td>
                  <td className={`px-6 py-4 ${row.res.startsWith('+') ? 'text-green-400' : row.res.startsWith('-') ? 'text-red-400' : ''}`}>
                    {row.res}
                  </td>
                  <td className="px-6 py-4">{row.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-brand-400 hover:text-brand-300">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;