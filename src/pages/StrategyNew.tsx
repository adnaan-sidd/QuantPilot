import React, { useState, useRef, useEffect } from 'react';
import { continueStrategyChat } from '../services/aiService';
import { runMockBacktest } from '../services/mockEngine';
import { ChatMessage, StrategyConfig, DataSource, DataDuration, BacktestStats, BacktestStage, Backtest } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Loader2, Sparkles, User, Bot, Play, Settings, Database, Calendar, DollarSign, BookOpen, ChevronRight, Zap, CheckCircle, BarChart2, X, Download, Eye, Activity } from 'lucide-react';

const COMMON_INDICATORS = [
    "RSI", "MACD", "EMA", "SMA", "Bollinger Bands", "Stochastic", "ATR", "VWAP", 
    "Ichimoku", "Volume", "Supertrend", "Parabolic SAR", "ADX", "CCI", "Williams %R"
];

const STRATEGY_TEMPLATES = {
    "Scalping": [
        { name: "1-Min Stochastic Scalp", desc: "Buy when Stoch < 20, Sell > 80 on M1. Target 5 pips, Stop 3 pips." },
        { name: "Bollinger Band Squeeze", desc: "Trade breakout when volatility expands. Buy if price closes above upper band." },
        { name: "VWAP Reversion", desc: "Fade moves far from VWAP on M5. Buy when price hits VWAP - 2SD." }
    ],
    "Day Trading": [
        { name: "Gap and Go", desc: "Trade morning gap continuation. Buy if price breaks opening range high." },
        { name: "RSI Trend Following", desc: "Buy on RSI > 50 pullback in uptrend. Filter with 200 EMA." },
        { name: "MACD Cross", desc: "Classic trend following on H1. Buy when MACD line crosses signal line upward." }
    ],
    "Swing Trading": [
        { name: "Golden Cross", desc: "Buy when SMA 50 crosses above SMA 200. Hold until death cross." },
        { name: "3-Bar Play", desc: "Momentum continuation pattern. Buy above high of resting bar." },
        { name: "Support/Resistance Bounce", desc: "Trade retests of key levels. Buy at support with bullish engulfing." }
    ]
};

const BacktestProgress = ({ stage }: { stage: BacktestStage }) => {
    const steps = [
        { id: 'validating', label: 'Validating Strategy' },
        { id: 'fetching_data', label: 'Fetching Historical Data' },
        { id: 'calculating_indicators', label: 'Calculating Indicators' },
        { id: 'simulating', label: 'Running Backtest Engine' },
        { id: 'calculating_stats', label: 'Generating Report' }
    ];

    const getCurrentIndex = () => {
        if (stage === 'complete') return 5;
        return steps.findIndex(s => s.id === stage);
    };

    const activeIndex = getCurrentIndex();

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 my-2 animate-in fade-in zoom-in-95 duration-300">
            <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-bounce text-brand-500" />
                Simulation in Progress
            </h4>
            <div className="space-y-3">
                {steps.map((step, idx) => {
                    const isCompleted = idx < activeIndex;
                    const isActive = idx === activeIndex;
                    return (
                        <div key={step.id} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                isCompleted ? 'bg-green-500 text-slate-900 scale-100' : 
                                isActive ? 'bg-brand-500 text-white animate-pulse scale-110' : 
                                'bg-slate-800 text-slate-500 scale-90'
                            }`}>
                                {isCompleted ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                            </div>
                            <span className={`text-sm transition-colors duration-300 ${
                                isCompleted ? 'text-green-400' :
                                isActive ? 'text-white font-medium' :
                                'text-slate-500'
                            }`}>
                                {step.label}
                            </span>
                            {isActive && <Loader2 className="w-3 h-3 text-brand-500 animate-spin ml-auto" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ResultCard = ({ stats, id }: { stats: BacktestStats, id: string }) => {
    const navigate = useNavigate();
    return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mt-2">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Backtest Complete
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {id.slice(-6)}</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Total Return</div>
                    <div className={`text-lg font-bold ${stats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.totalReturn > 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
                    </div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Win Rate</div>
                    <div className="text-lg font-bold text-white">
                        {stats.winRate.toFixed(1)}%
                    </div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Max Drawdown</div>
                    <div className="text-lg font-bold text-red-400">
                        {stats.maxDrawdown.toFixed(2)}%
                    </div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Profit Factor</div>
                    <div className="text-lg font-bold text-brand-400">
                        {stats.profitFactor.toFixed(2)}
                    </div>
                </div>
            </div>
            <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                <button 
                    onClick={() => navigate(`/app/backtests/${id}`, { state: { backtest: { stats, id } } })}
                    className="flex items-center gap-2 text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Eye className="w-4 h-4" /> View Full Report
                </button>
            </div>
        </div>
    );
};

const StrategyNew = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: 'Hello! I am your AI quant. Describe a strategy or pick a template.', timestamp: Date.now() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [parsedConfig, setParsedConfig] = useState<StrategyConfig | null>(null);
  
  // Backtest Execution State
  const [backtestStage, setBacktestStage] = useState<BacktestStage>('idle');
  const [lastBacktestId, setLastBacktestId] = useState<string | null>(null);

  // UI State
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Execution Settings
  const [dataSource, setDataSource] = useState<DataSource>('Yahoo Finance');
  const [duration, setDuration] = useState<DataDuration>('3M');
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  
  // Auto-suggestion state
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, backtestStage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputMessage(val);
      const lowerVal = val.toLowerCase();

      // Indicator Logic (Last Word)
      const words = val.split(' ');
      const lastWord = words[words.length - 1];
      
      let newSuggestions: string[] = [];

      if (lastWord.length >= 2) {
          const matches = COMMON_INDICATORS.filter(ind => 
              ind.toLowerCase().includes(lastWord.toLowerCase()) && 
              ind.toLowerCase() !== lastWord.toLowerCase()
          );
          newSuggestions = [...matches];
      }

      // Template Logic (Full Phrase / Semantic Context)
      if (val.length > 3) {
           const tempMatches = Object.values(STRATEGY_TEMPLATES).flat().filter(t => 
              t.name.toLowerCase().includes(lowerVal) || 
              t.desc.toLowerCase().includes(lowerVal)
          ).slice(0, 2).map(t => `Template: ${t.name}`);
          newSuggestions = [...newSuggestions, ...tempMatches];
      }

      setSuggestions(newSuggestions.slice(0, 5));
  };

  const applySuggestion = (suggestion: string) => {
      if (suggestion.startsWith('Template: ')) {
          const templateName = suggestion.replace('Template: ', '');
          const template = Object.values(STRATEGY_TEMPLATES).flat().find(t => t.name === templateName);
          if (template) {
              setInputMessage(template.desc);
          }
      } else {
          const words = inputMessage.split(' ');
          words.pop();
          words.push(suggestion);
          setInputMessage(words.join(' ') + ' ');
      }
      setSuggestions([]);
  };

  const applyTemplate = (templateDesc: string) => {
      setInputMessage(templateDesc);
      setShowTemplatesModal(false);
  };

  const runBacktestSequence = async (config: StrategyConfig) => {
      setBacktestStage('validating');
      await new Promise(r => setTimeout(r, 600));

      setBacktestStage('fetching_data');
      await new Promise(r => setTimeout(r, 1000));
      
      setBacktestStage('calculating_indicators');
      await new Promise(r => setTimeout(r, 800));

      setBacktestStage('simulating');

      try {
        const mockId = `bk-${Date.now()}`;
        // Actually run the mock logic to get stats
        const result = await runMockBacktest(mockId, config, dataSource, duration);
        
        setBacktestStage('calculating_stats');
        await new Promise(r => setTimeout(r, 600));
        
        setBacktestStage('complete');
        setLastBacktestId(mockId);

        // Add result message to chat
        const resultMsg: ChatMessage = { 
            role: 'ai', 
            content: "I've completed the simulation. Here is the performance summary.", 
            timestamp: Date.now(),
            hasBacktestResult: true,
            backtestId: result.id,
            backtestSummary: result.stats
        };
        setMessages(prev => [...prev, resultMsg]);
        
        const cardWithData = { ...resultMsg, fullBacktestData: result };
        setMessages(prev => {
             const newMsgs = [...prev];
             newMsgs[newMsgs.length - 1] = cardWithData;
             return newMsgs;
        });

      } catch (e) {
          console.error(e);
          setMessages(prev => [...prev, { role: 'ai', content: "Simulation failed due to an error.", timestamp: Date.now() }]);
          setBacktestStage('idle');
      }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: inputMessage, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    setSuggestions([]);
    setBacktestStage('idle'); // Reset if new message

    try {
      const response = await continueStrategyChat([...messages, userMsg]);
      
      const aiMsg: ChatMessage = { role: 'ai', content: response.message, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      
      if (response.config) {
        setParsedConfig(response.config);
        if (response.shouldExecute) {
            runBacktestSequence({ ...response.config, initialCapital });
        }
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error analyzing that.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-5xl mx-auto gap-4 relative">
      
      {/* Templates Modal */}
      {showTemplatesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-brand-400" /> Strategy Templates
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Select a template to populate the chat.</p>
                      </div>
                      <button onClick={() => setShowTemplatesModal(false)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="overflow-y-auto p-6 space-y-8">
                    {Object.entries(STRATEGY_TEMPLATES).map(([category, templates]) => (
                        <div key={category}>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="w-3 h-3" /> {category}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                                {templates.map((t, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => applyTemplate(t.desc)}
                                        className="text-left p-4 rounded-xl bg-slate-800/50 hover:bg-brand-900/20 border border-slate-800 hover:border-brand-500/50 transition-all group hover:shadow-lg hover:shadow-brand-900/20"
                                    >
                                        <div className="font-bold text-slate-200 group-hover:text-brand-300 mb-1">{t.name}</div>
                                        <div className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300">{t.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                  </div>
              </div>
          </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header / Settings */}
        <div className="bg-slate-900/50 border-b border-slate-800 p-3 flex flex-wrap items-center gap-3 backdrop-blur-md">
            <div className="flex items-center text-slate-400 gap-2 mr-auto">
                <Bot className="w-5 h-5 text-brand-400" />
                <span className="font-bold text-white text-sm">AI Architect</span>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                <Database className="w-3 h-3 text-brand-400" />
                <select 
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value as DataSource)}
                    className="bg-transparent text-white text-xs outline-none cursor-pointer"
                >
                    <option value="Yahoo Finance">Yahoo Finance</option>
                    <option value="Dukascopy">Dukascopy</option>
                    <option value="Binance">Binance</option>
                </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                <Calendar className="w-3 h-3 text-brand-400" />
                <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as DataDuration)}
                    className="bg-transparent text-white text-xs outline-none cursor-pointer"
                >
                    <option value="1M">1 Month</option>
                    <option value="3M">3 Months</option>
                    <option value="1Y">1 Year</option>
                </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                <DollarSign className="w-3 h-3 text-brand-400" />
                <input 
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    className="bg-transparent text-white text-xs outline-none w-16"
                    step={1000}
                />
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
            {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'ai' ? 'bg-gradient-to-br from-brand-500 to-brand-700' : 'bg-slate-700'}`}>
                {msg.role === 'ai' ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                </div>
                
                <div className="flex flex-col gap-2 max-w-[85%]">
                    <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-md ${
                    msg.role === 'user' 
                        ? 'bg-brand-600 text-white rounded-tr-sm' 
                        : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-sm'
                    }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Render Backtest Result Card if attached */}
                    {msg.hasBacktestResult && msg.backtestSummary && (
                        // @ts-ignore - passing full data via closure hack in handleRunBacktest or just relying on stats here
                         <div className="w-full max-w-md">
                            <div className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mt-1 shadow-xl">
                                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                        <BarChart2 className="w-4 h-4 text-brand-400" /> Performance Report
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">#{msg.backtestId?.slice(-4)}</span>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Return</div>
                                        <div className={`text-xl font-bold ${msg.backtestSummary.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {msg.backtestSummary.totalReturn > 0 ? '+' : ''}{msg.backtestSummary.totalReturn.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Win Rate</div>
                                        <div className="text-xl font-bold text-white">
                                            {msg.backtestSummary.winRate.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Max Drawdown</div>
                                        <div className="text-xl font-bold text-red-400">
                                            {msg.backtestSummary.maxDrawdown.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Profit Factor</div>
                                        <div className="text-xl font-bold text-brand-400">
                                            {msg.backtestSummary.profitFactor.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-950/30 border-t border-slate-800 flex justify-end">
                                    <button 
                                        onClick={() => navigate(`/app/backtests/${msg.backtestId}`, { state: { backtest: (msg as any).fullBacktestData } })}
                                        className="flex items-center gap-2 text-xs bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-brand-900/20"
                                    >
                                        <Eye className="w-3 h-3" /> View Charts & Logs
                                    </button>
                                </div>
                            </div>
                         </div>
                    )}
                </div>
            </div>
            ))}
            
            {isTyping && (
            <div className="flex items-start gap-4 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-5 py-4 shadow-md">
                    <div className="flex items-center gap-2 text-brand-400 text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                </div>
            </div>
            )}

            {/* In-Chat Backtest Progress */}
            {backtestStage !== 'idle' && backtestStage !== 'complete' && (
                <div className="flex items-start gap-4 animate-in fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                         <div className="w-2 h-2 bg-brand-500 rounded-full animate-ping" />
                    </div>
                    <div className="max-w-xs w-full">
                         <BacktestProgress stage={backtestStage} />
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/50 backdrop-blur-md border-t border-slate-800 relative z-20">
            {suggestions.length > 0 && (
                <div className="absolute bottom-full left-4 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 animate-in slide-in-from-bottom-2">
                    <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-2 bg-slate-950 border-b border-slate-800">
                        Suggested
                    </div>
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => applySuggestion(s)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-brand-600 hover:text-white transition-colors"
                        >
                            {s.startsWith('Template:') ? (
                                <>
                                    <span className="text-brand-400 font-bold">Template:</span> {s.replace('Template:', '')}
                                </>
                            ) : s}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative flex gap-2">
                <button 
                    onClick={() => setShowTemplatesModal(true)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors tooltip-trigger"
                    title="Strategy Templates"
                >
                    <BookOpen className="w-5 h-5" />
                </button>
                
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a strategy (e.g., 'Buy EURUSD when RSI < 30')..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none shadow-inner transition-all"
                        autoFocus
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-900/20"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-600">AI can make mistakes. Review generated strategies carefully.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyNew;