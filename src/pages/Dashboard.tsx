import React from 'react';
import { Plus, TrendingUp, Clock, Award, Activity } from 'lucide-react';
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
      {trend && <span className="ml-2 text-sm text-slate-500">{trend}</span>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader';

  // In a real app, we would fetch these stats from Supabase here.
  // For a fresh account, they start at 0.
  const stats = {
      totalBacktests: 0,
      winRate: '0%',
      score: '-'
  };

  const recentActivity: any[] = []; // Empty for fresh account

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {displayName}. Ready to deploy alpha?</p>
        </div>
        <Link to="/app/strategies/new" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-900/20">
          <Plus className="w-4 h-4" /> New Strategy
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Backtests" 
          value={stats.totalBacktests} 
          icon={<Clock className="w-5 h-5" />} 
        />
        <StatCard 
          title="Avg Win Rate" 
          value={stats.winRate} 
          icon={<TrendingUp className="w-5 h-5" />} 
        />
        <StatCard 
          title="Strategy Score" 
          value={stats.score} 
          icon={<Award className="w-5 h-5" />} 
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[300px] flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        </div>
        
        {recentActivity.length > 0 ? (
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
                {recentActivity.map((row, i) => (
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
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-lg font-medium text-slate-300 mb-2">No activity yet</p>
                <p className="text-sm max-w-xs text-center mb-6">Create your first strategy to start generating backtest data.</p>
                <Link to="/app/strategies/new" className="text-brand-400 hover:text-white underline">
                    Create Strategy &rarr;
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;