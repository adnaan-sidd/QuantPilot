import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode } from 'lightweight-charts';
import { Backtest, StrategyConfig, DataSource, AIReport, MarketDataPoint, Trade } from '../types';
import { generateBotCode, generateReportNarrative } from '../services/aiService';
import { runMockBacktest } from '../services/mockEngine';
import { Download, Terminal, FileText, Copy, AlertTriangle, Loader2, Database, Lightbulb, ArrowRight, Activity, TrendingDown, FileSpreadsheet, ThumbsUp, ThumbsDown, Award, Quote, DollarSign, Percent, BarChart, Info } from 'lucide-react';

const GradeBadge = ({ grade }: { grade: string }) => {
    const colors = {
        'A': 'bg-green-500 text-slate-900',
        'B': 'bg-brand-500 text-white',
        'C': 'bg-yellow-500 text-slate-900',
        'D': 'bg-orange-500 text-white',
        'F': 'bg-red-500 text-white'
    };
    // @ts-ignore
    const colorClass = colors[grade] || 'bg-slate-500 text-white';

    return (
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl font-black shadow-lg ${colorClass}`}>
            {grade}
        </div>
    );
};

// --- LIGHTWEIGHT CHART WRAPPER ---
const LightweightChart = ({ 
    type, 
    data, 
    chartType = 'Line',
    markers = [], 
    colors = { up: '#4ade80', down: '#f87171' } 
}: { 
    type: 'Equity' | 'Price', 
    data: any[], 
    chartType?: 'Area' | 'Line' | 'Candlestick',
    markers?: any[],
    colors?: { up: string, down: string }
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current || !data || data.length === 0) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: '#1e293b' },
                horzLines: { color: '#1e293b' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 350,
            timeScale: {
                borderColor: '#1e293b',
            },
            rightPriceScale: {
                borderColor: '#1e293b',
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
        });
        chartRef.current = chart;

        let series: ISeriesApi<any>;

        if (chartType === 'Area') {
            series = chart.addAreaSeries({
                lineColor: colors.up,
                topColor: 'rgba(74, 222, 128, 0.4)',
                bottomColor: 'rgba(74, 222, 128, 0.0)',
            });
            // Area expects { time, value }
            series.setData(data.map(d => ({ time: d.time || d.date, value: d.value || d.close || d.equity })));
        } else if (chartType === 'Line') {
            series = chart.addLineSeries({
                color: colors.up,
                lineWidth: 2,
            });
             // Line expects { time, value }
             series.setData(data.map(d => ({ time: d.time || d.date, value: d.value || d.close || d.equity })));
        } else {
            // Candlestick
            series = chart.addCandlestickSeries({
                upColor: colors.up,
                downColor: colors.down,
                borderVisible: false,
                wickUpColor: colors.up,
                wickDownColor: colors.down,
            });
            // Candle expects { time, open, high, low, close }
            series.setData(data.map(d => ({ 
                time: d.time || d.date, 
                open: d.open, 
                high: d.high, 
                low: d.low, 
                close: d.close || d.value // Fallback for equity if we fake it
            })));
        }

        if (markers.length > 0) {
            series.setMarkers(markers);
        }

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, chartType, markers, colors]);

    return <div ref={chartContainerRef} className="w-full h-[350px]" />;
};


// --- INFO TOOLTIP COMPONENT ---
const InfoTooltip = ({ text }: { text: string }) => (
    <div className="relative group inline-block ml-1">
        <Info className="w-3 h-3 text-slate-500 hover:text-brand-400 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-slate-300 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center border border-slate-700">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </div>
    </div>
);


const BacktestResult = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [backtest, setBacktest] = useState<Backtest | null>(state?.backtest || null);
  const [config, setConfig] = useState<StrategyConfig | null>(state?.config || null);
  const [status, setStatus] = useState<'pending' | 'running' | 'completed' | 'failed'>(state?.status || 'completed');
  
  // Data Params
  const [dataSource, setDataSource] = useState<DataSource>(state?.dataSource || 'Yahoo Finance');
  const [customFileName, setCustomFileName] = useState<string | undefined>(state?.customFileName);
  const [dateRange, setDateRange] = useState<{start: string, end: string} | undefined>(state?.dateRange);
  
  // Chart Types
  const [equityChartType, setEquityChartType] = useState<'Area' | 'Line' | 'Candlestick'>('Area');
  const [priceChartType, setPriceChartType] = useState<'Line' | 'Candlestick'>('Candlestick');

  const [activeTab, setActiveTab] = useState<'report' | 'code'>('report');
  const [codeLanguage, setCodeLanguage] = useState<'mt5' | 'pinescript' | 'python'>('mt5');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);

  // Polling / Simulation Effect
  useEffect(() => {
    let isMounted = true;

    // Safety: If accessed directly without state, we need to handle it.
    // In a real app we'd fetch by ID. Here, we can fallback to mock if ID exists but no state.
    if (!state && !backtest && id) {
         // Fallback re-run mock if refreshed
         const mockConfig: StrategyConfig = {
             asset: "EURUSD", timeframe: "H1", entryRules: ["Simulated"], exitRules: ["Simulated"],
             stopLoss: "50 pips", takeProfit: "100 pips", riskPerTrade: "1%"
         };
         setConfig(mockConfig);
         setStatus('pending');
    } else if (!state && !backtest && !id) {
        navigate('/app/dashboard');
        return;
    }

    const performBacktest = async () => {
      if (status === 'pending' || status === 'running') {
        setStatus('running');
        try {
            await new Promise(resolve => setTimeout(resolve, 3000)); 

            if (isMounted) {
                // If we have config, use it. Else use default.
                const useConfig = config || {
                    asset: "EURUSD", timeframe: "H1", entryRules: [], exitRules: [], stopLoss: "50 pips", takeProfit: "100 pips", riskPerTrade: "1%"
                };
                const result = await runMockBacktest(id || 'temp', useConfig, dataSource, undefined, customFileName, dateRange);
                setBacktest(result);
                setStatus('completed');
            }
        } catch (error) {
            console.error(error);
            if (isMounted) setStatus('failed');
        }
      }
    };

    if ((status === 'pending' || status === 'running')) {
        performBacktest();
    } 

    return () => { isMounted = false; };
  }, [status, config, id, navigate, dataSource, customFileName, dateRange, state, backtest]);

  // Auto-generate report on completion
  useEffect(() => {
      if (status === 'completed' && backtest && !report) {
          const cfg = config || (backtest as any).config || { asset: "Unknown", timeframe: "Unknown" }; 
          generateReportNarrative(backtest.stats, backtest.trades, cfg as StrategyConfig).then(setReport).catch(e => console.error(e));
      }
  }, [status, backtest, config, report]);

  const handleGenerateCode = async () => {
      if (!config && !backtest) return;
      setIsGeneratingCode(true);
      // @ts-ignore
      const code = await generateBotCode(config || backtest.config, codeLanguage);
      setGeneratedCode(code);
      setIsGeneratingCode(false);
  };

  const handleDownloadCode = () => {
      if (!generatedCode) return;
      const element = document.createElement("a");
      const file = new Blob([generatedCode], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      let extension = 'txt';
      if (codeLanguage === 'mt5') extension = 'mq5';
      if (codeLanguage === 'python') extension = 'py';
      if (codeLanguage === 'pinescript') extension = 'pine';
      element.download = `bot_strategy_${id}.${extension}`;
      document.body.appendChild(element); 
      element.click();
      document.body.removeChild(element);
  };

  const handleDownloadReport = () => {
      if (!backtest || !report) return;
      const reportData = {
          strategyConfig: config,
          backtestStats: backtest.stats,
          aiReport: report,
          trades: backtest.trades,
          equityCurve: backtest.equityCurve
      };
      
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(reportData, null, 2)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = `full_report_${id}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  }

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header];
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return val;
      }).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Data Preparation for Charts
  const equityData = useMemo(() => {
      if (!backtest?.equityCurve) return [];
      return backtest.equityCurve.map(p => ({
          time: p.date,
          value: p.equity, // For Area/Line
          open: p.open || p.equity,
          high: p.high || p.equity,
          low: p.low || p.equity,
          close: p.close || p.equity
      }));
  }, [backtest?.equityCurve]);

  const priceData = useMemo(() => {
      if (!backtest?.marketData) return [];
      return backtest.marketData.map(d => ({
          time: d.date,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          value: d.close // For Line
      }));
  }, [backtest?.marketData]);

  const priceMarkers = useMemo(() => {
      if (!backtest?.trades) return [];
      const markers: any[] = [];
      backtest.trades.forEach(t => {
          // Entry Marker
          markers.push({
              time: t.entryTime.split('T')[0], // Lightweight charts match by time string
              position: t.side === 'BUY' ? 'belowBar' : 'aboveBar',
              color: t.side === 'BUY' ? '#4ade80' : '#f87171',
              shape: t.side === 'BUY' ? 'arrowUp' : 'arrowDown',
              text: `${t.side} @ ${t.entryPrice.toFixed(4)}`
          });
          // Exit Marker with circle
          markers.push({
              time: t.exitTime.split('T')[0],
              position: t.side === 'BUY' ? 'aboveBar' : 'belowBar',
              color: t.pnl > 0 ? '#fbbf24' : '#94a3b8', // Gold for profit, Slate for loss
              shape: 'circle',
              text: `Exit (${t.pnl > 0 ? '+' : ''}${t.pnl.toFixed(1)})`
          });
      });
      // Sort by time to avoid Lightweight Charts errors
      return markers.sort((a, b) => (new Date(a.time).getTime() - new Date(b.time).getTime()));
  }, [backtest?.trades]);


  // Extended Financial Calculations
  const wins = backtest?.trades.filter(t => t.pnl > 0).length || 0;
  const losses = backtest?.trades.filter(t => t.pnl <= 0).length || 0;
  const netProfit = (backtest?.stats.endEquity || 0) - (backtest?.stats.startEquity || 0);
  const grossProfit = backtest?.trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0) || 0;
  const grossLoss = backtest?.trades.filter(t => t.pnl <= 0).reduce((acc, t) => acc + t.pnl, 0) || 0;
  const avgWin = wins > 0 ? grossProfit / wins : 0;
  const avgLoss = losses > 0 ? grossLoss / losses : 0;
  const largestWin = Math.max(...(backtest?.trades.map(t => t.pnl) || [0]));
  const largestLoss = Math.min(...(backtest?.trades.map(t => t.pnl) || [0]));
  const winLossRatio = losses > 0 ? (wins / losses).toFixed(2) : (wins > 0 ? "∞" : "0");

  const pieData = [
      { name: 'Wins', value: wins, color: '#4ade80' },
      { name: 'Losses', value: losses, color: '#f87171' },
  ];

  if (status === 'pending' || status === 'running') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Loader2 className="w-16 h-16 text-brand-500 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Running Simulation...</h2>
              <p className="text-slate-400 max-w-md">
                  Thinking Mode Active: Analyzing market conditions and executing strategy rules for {config?.asset || "your asset"}.
              </p>
          </div>
      );
  }

  if (status === 'failed' || !backtest) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Backtest Failed</h2>
            <p className="text-slate-400 mb-4">Could not retrieve simulation data.</p>
            <button onClick={() => navigate('/app/strategies')} className="text-brand-400 hover:text-white underline">
                Return to Strategies
            </button>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header Actions */}
      <div className="flex justify-end mb-4">
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition-colors"
          >
              <Download className="w-4 h-4" /> Download Full Report
          </button>
      </div>

      {/* AI Strategy Verdict Section */}
      {report && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-in slide-in-from-top-4">
            <div className="absolute top-0 right-0 p-32 bg-brand-600/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <GradeBadge grade={report.grade} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Grade</span>
                </div>
                
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                            <Award className="w-5 h-5 text-yellow-500" /> 
                            AI Strategy Verdict
                        </h3>
                        <p className="text-lg font-medium text-brand-300">
                            "{report.conciseSummary}"
                        </p>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                             <Quote className="w-5 h-5 text-slate-600 flex-shrink-0" />
                             <p className="text-slate-300 text-sm leading-relaxed italic">
                                {report.narrative.split('\n')[0]}... 
                                <button 
                                    onClick={() => setActiveTab('report')} 
                                    className="text-brand-400 hover:text-white underline ml-1 not-italic"
                                >
                                    Read Full Analysis
                                </button>
                             </p>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block w-px bg-slate-800 self-stretch"></div>

                <div className="flex flex-col gap-4 min-w-[180px]">
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center">
                            Profit Factor <InfoTooltip text="Ratio of Gross Profit to Gross Loss. > 1.5 is good." />
                        </div>
                        <div className={`text-2xl font-bold ${backtest.stats.profitFactor >= 1.5 ? 'text-green-400' : backtest.stats.profitFactor >= 1 ? 'text-white' : 'text-red-400'}`}>
                            {backtest.stats.profitFactor.toFixed(2)}
                        </div>
                    </div>
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center">
                            Total Return <InfoTooltip text="Percentage growth of initial capital." />
                        </div>
                        <div className={`text-2xl font-bold ${backtest.stats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {backtest.stats.totalReturn > 0 ? '+' : ''}{backtest.stats.totalReturn.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Financial Overview Cards - Expanded Context */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {/* Row 1: Balances & Net PnL */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> Opening Balance
            </div>
            <div className="text-xl font-mono text-slate-300">${backtest.stats.startEquity.toLocaleString()}</div>
        </div>
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> Closing Balance
            </div>
            <div className={`text-xl font-mono font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${backtest.stats.endEquity.toLocaleString()}
            </div>
        </div>
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <Activity className="w-3 h-3" /> Net Profit
                <InfoTooltip text="Total profit minus total loss." />
            </div>
            <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit > 0 ? '+' : ''}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
        </div>
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-600 transition-colors">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <Percent className="w-3 h-3" /> Return
                <InfoTooltip text="Net profit / Initial Capital." />
            </div>
            <div className={`text-xl font-bold ${backtest.stats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {backtest.stats.totalReturn.toFixed(2)}%
            </div>
        </div>

        {/* Row 2: Deep Dive Stats */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                 Gross Profit <InfoTooltip text="Sum of all winning trades." />
             </div>
             <div className="text-lg font-mono text-green-400">+${grossProfit.toFixed(2)}</div>
        </div>
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                 Gross Loss <InfoTooltip text="Sum of all losing trades." />
             </div>
             <div className="text-lg font-mono text-red-400">${grossLoss.toFixed(2)}</div>
        </div>
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                 Max Drawdown <InfoTooltip text="Maximum observed loss from a peak to a trough." />
             </div>
             <div className="text-lg font-bold text-red-400">{backtest.stats.maxDrawdown.toFixed(2)}%</div>
        </div>
        <div className="col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                 Win/Loss Ratio <InfoTooltip text="Ratio of number of winning trades to losing trades." />
             </div>
             <div className="text-lg font-bold text-brand-400">{winLossRatio}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Equity Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Equity Growth</h3>
                <div className="flex gap-2 items-center">
                    <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 mr-2">
                        {['Area', 'Line', 'Candlestick'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setEquityChartType(t as any)}
                                className={`px-3 py-1 text-xs font-medium rounded ${equityChartType === t ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => downloadCSV(backtest.equityCurve, 'equity.csv')} className="p-2 hover:bg-slate-800 rounded text-slate-400">
                        <FileSpreadsheet className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <LightweightChart 
                type="Equity" 
                data={equityData} 
                chartType={equityChartType}
                colors={{ up: netProfit >= 0 ? '#4ade80' : '#f87171', down: '#f87171' }}
            />
          </div>

          {/* Win/Loss Pie Chart & Trade Stats */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-between">
             <div className="w-full">
                <h3 className="text-lg font-bold text-white mb-2 text-left">Trade Analysis</h3>
             </div>
             
             <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} itemStyle={{color: '#fff'}} />
                        <Legend verticalAlign="bottom" height={36} iconSize={8}/>
                    </PieChart>
                 </ResponsiveContainer>
             </div>
             
             <div className="w-full pt-4 border-t border-slate-800 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Avg Win</span>
                     <span className="text-green-400 font-mono">+${avgWin.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Avg Loss</span>
                     <span className="text-red-400 font-mono">${avgLoss.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Largest Win</span>
                     <span className="text-green-400 font-mono font-bold">+${largestWin.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Largest Loss</span>
                     <span className="text-red-400 font-mono font-bold">${largestLoss.toFixed(2)}</span>
                 </div>
             </div>
          </div>
      </div>

       {/* Price & Entry/Exit Visualization */}
       {priceData.length > 0 && (
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-white">Price Action & Signals</h3>
                   <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                        {['Line', 'Candlestick'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setPriceChartType(t as any)}
                                className={`px-3 py-1 text-xs font-medium rounded ${priceChartType === t ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
               </div>
               
               <LightweightChart 
                   type="Price"
                   data={priceData}
                   chartType={priceChartType}
                   markers={priceMarkers} // distinct markers
                   colors={{ up: '#4ade80', down: '#f87171' }}
               />
               <div className="mt-2 text-xs text-slate-500 flex gap-4 justify-end">
                   <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> Buy Entry</span>
                   <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span> Sell Entry</span>
                   <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Profitable Exit</span>
               </div>
           </div>
       )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('report')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'report' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="inline w-4 h-4 mr-2" />
            AI Report
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'code' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400 hover:text-white'}`}
          >
            <Terminal className="inline w-4 h-4 mr-2" />
            Bot Code Export
          </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-b-xl min-h-[400px]">
        
        {activeTab === 'report' && (
            <div className="space-y-8">
               {!report ? (
                   <div className="flex flex-col items-center justify-center h-48 text-slate-500 animate-pulse">
                       <Lightbulb className="w-8 h-8 mb-2 text-yellow-500" />
                       Thinking... Gemini 3.0 Pro is analyzing market context...
                   </div>
               ) : (
                   <>
                       <div className="grid md:grid-cols-3 gap-8">
                           <div className="md:col-span-2 prose prose-invert max-w-none">
                               <h3 className="text-xl font-bold text-white mb-4">Market Context Analysis</h3>
                               <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                   {report.narrative}
                               </p>
                           </div>
                           <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 h-fit">
                               <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Quick Stats</h4>
                               <ul className="space-y-3 text-sm">
                                   <li className="flex justify-between">
                                       <span className="text-slate-500">Expectancy</span>
                                       <span className="text-white">{(backtest.stats.winRate * (backtest.stats.totalReturn/wins) - (100-backtest.stats.winRate) * 1).toFixed(2)}</span>
                                   </li>
                                   <li className="flex justify-between">
                                       <span className="text-slate-500">Sharpe</span>
                                       <span className="text-white">{backtest.stats.sharpeRatio}</span>
                                   </li>
                                    <li className="flex justify-between">
                                       <span className="text-slate-500">Max DD</span>
                                       <span className="text-red-400">{backtest.stats.maxDrawdown.toFixed(2)}%</span>
                                   </li>
                               </ul>
                           </div>
                       </div>
                       
                       <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Alpha Improvements</h3>
                            </div>
                            
                            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/50 p-6 rounded-xl shadow-lg relative overflow-hidden">
                                <div className="space-y-4 relative z-10">
                                    {report.suggestions.split('\n').filter(s => s.trim().length > 0).map((suggestion, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-brand-500/30 transition-colors">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 rounded-full bg-brand-900/30 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xs">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-slate-200 leading-relaxed">
                                                    {suggestion.replace(/^\d+\.\s*/, '')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                       </div>
                   </>
               )}
            </div>
        )}

        {activeTab === 'code' && (
            <div>
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex space-x-2">
                        {['mt5', 'pinescript', 'python'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => {
                                    setCodeLanguage(lang as any);
                                    setGeneratedCode('');
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                                    codeLanguage === lang 
                                    ? 'bg-brand-600 text-white border-brand-500' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                {lang === 'mt5' ? 'MetaTrader 5' : lang === 'pinescript' ? 'TradingView Pine' : 'Python'}
                            </button>
                        ))}
                    </div>
                    {generatedCode && (
                        <div className="flex gap-2">
                            <button onClick={() => navigator.clipboard.writeText(generatedCode)} className="flex items-center text-slate-400 hover:text-white text-sm bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                                <Copy className="w-4 h-4 mr-2" /> Copy
                            </button>
                            <button onClick={handleDownloadCode} className="flex items-center text-white text-sm bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg font-medium">
                                <Download className="w-4 h-4 mr-2" /> Download File
                            </button>
                        </div>
                    )}
                </div>
                {!generatedCode ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
                        <Terminal className="w-12 h-12 text-slate-600 mb-4" />
                        <h4 className="text-lg font-medium text-white mb-2">Generate Code</h4>
                        <button onClick={handleGenerateCode} disabled={isGeneratingCode} className="px-6 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-gray-100 flex items-center gap-2">
                             {isGeneratingCode ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing...</> : 'Generate Now'}
                        </button>
                    </div>
                ) : (
                    <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed max-h-[600px] overflow-y-auto">
                        {generatedCode}
                    </pre>
                )}
            </div>
        )}
      </div>

      {/* Trade History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-800 flex justify-between">
            <h3 className="text-lg font-bold text-white">Trade History</h3>
            <button onClick={() => downloadCSV(backtest.trades, 'trades.csv')} className="text-sm text-brand-400">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3">Entry Time</th>
                <th className="px-6 py-3">Exit Time</th>
                <th className="px-6 py-3">Direction</th>
                <th className="px-6 py-3 text-right">Entry Price</th>
                <th className="px-6 py-3 text-right">Exit Price</th>
                <th className="px-6 py-3 text-right">PnL</th>
              </tr>
            </thead>
            <tbody>
              {backtest.trades.map((trade) => (
                <tr key={trade.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                   <td className="px-6 py-4 font-mono text-xs">{trade.entryTime.replace('T', ' ').substring(0, 16)}</td>
                   <td className="px-6 py-4 font-mono text-xs">{trade.exitTime.replace('T', ' ').substring(0, 16)}</td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold border ${trade.side === 'BUY' ? 'bg-green-900/20 text-green-400 border-green-900/30' : 'bg-red-900/20 text-red-400 border-red-900/30'}`}>
                       {trade.side}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right font-mono">{trade.entryPrice.toFixed(5)}</td>
                   <td className="px-6 py-4 text-right font-mono">{trade.exitPrice.toFixed(5)}</td>
                   <td className={`px-6 py-4 text-right font-mono font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                     {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
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

export default BacktestResult;