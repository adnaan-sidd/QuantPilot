import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Cpu, Zap, Shield, TrendingUp, Check, X as XIcon, Activity, Sparkles, User, Loader2, BookOpen } from 'lucide-react';

const ChatDemo = () => {
    const [messages, setMessages] = useState<any[]>([
        { role: 'ai', content: 'Hello! I am your AI quant. Describe a strategy or pick a template.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // Auto-play sequence
    useEffect(() => {
        let timeoutIds: ReturnType<typeof setTimeout>[] = [];

        const typeMessage = async (text: string) => {
            for (let i = 0; i <= text.length; i++) {
                await new Promise(r => {
                    const id = setTimeout(r, 50);
                    timeoutIds.push(id);
                });
                setInputValue(text.slice(0, i));
            }
        };

        const runSequence = async () => {
            // Wait initial
            await new Promise(r => timeoutIds.push(setTimeout(r, 1000)));

            // 1. User types strategy
            await typeMessage("Backtest a mean reversion strategy on BTCUSD");
            
            // 2. User sends
            await new Promise(r => timeoutIds.push(setTimeout(r, 500)));
            setMessages(prev => [...prev, { role: 'user', content: "Backtest a mean reversion strategy on BTCUSD" }]);
            setInputValue("");
            setIsTyping(true);

            // 3. AI thinks
            await new Promise(r => timeoutIds.push(setTimeout(r, 1500)));
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'ai', content: "I've configured a mean reversion strategy using RSI and Bollinger Bands for BTCUSD (H1). Shall I run the simulation?" }]);

            // 4. User types "Run it"
            await new Promise(r => timeoutIds.push(setTimeout(r, 800)));
            await typeMessage("Yes, run it please.");

            // 5. User sends
            await new Promise(r => timeoutIds.push(setTimeout(r, 500)));
            setMessages(prev => [...prev, { role: 'user', content: "Yes, run it please." }]);
            setInputValue("");
            
            // 6. Simulation UI
            setShowResult(true);

            // 7. Reset loop
            await new Promise(r => timeoutIds.push(setTimeout(r, 6000)));
            setMessages([{ role: 'ai', content: 'Hello! I am your AI quant. Describe a strategy or pick a template.' }]);
            setShowResult(false);
            runSequence(); // Loop
        };

        runSequence();

        return () => {
            timeoutIds.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans text-sm h-[400px] flex flex-col relative">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center gap-2">
                <div className="flex gap-1.5 mr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-md border border-slate-700 ml-auto">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-slate-400">Connected to Engine</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-gradient-to-br from-brand-500 to-brand-700' : 'bg-slate-700'}`}>
                            {msg.role === 'ai' ? <Sparkles className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-white" />}
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-xs max-w-[80%] ${
                             msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex items-center gap-2 text-brand-400 text-xs px-2 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                    </div>
                )}

                {showResult && (
                    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mt-2 animate-in zoom-in-95 duration-500">
                         <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                <Activity className="w-3 h-3 text-brand-500" /> Simulation Complete
                            </span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-2">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Return</div>
                                <div className="text-sm font-bold text-green-400">+142.5%</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Sharpe</div>
                                <div className="text-sm font-bold text-white">2.1</div>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-800">
                            <div className="h-full bg-brand-500 w-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Placeholder */}
            <div className="p-3 bg-slate-900/50 border-t border-slate-800">
                <div className="flex gap-2">
                     <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-500">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white flex items-center justify-between">
                        <span>{inputValue}<span className="animate-pulse">|</span></span>
                        <div className="p-1 bg-brand-600 rounded">
                            <ArrowRight className="w-3 h-3 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-brand-500/30 selection:text-brand-200 overflow-x-hidden">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md text-xs font-mono text-brand-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              v2.0 SYSTEM ONLINE
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              Algo Trading.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-400 to-emerald-400">
                Democratized.
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Describe your strategy in plain English. Our AI kernel compiles it into rigorous backtests and deploys production-grade code for MT5 and Python.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth/signup" className="group relative px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                <span className="relative flex items-center justify-center gap-2">
                  Initialize Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <a href="#pricing" className="px-8 py-4 bg-slate-900/50 border border-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 hover:text-white transition-all backdrop-blur-sm">
                View Pricing
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm font-mono text-slate-500">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" /> Bank-Grade Security
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Latency &lt; 50ms
              </span>
            </div>
          </div>

          {/* Animated Chat Visual */}
          <div className="relative animate-in slide-in-from-right-4 duration-700 delay-200">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl blur opacity-20"></div>
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* Features Stripe */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
                { label: 'Market Data', value: 'Real-time', icon: Activity },
                { label: 'Active Traders', value: '10,000+', icon: Terminal },
                { label: 'Backtests Run', value: '1.2M+', icon: Cpu },
                { label: 'Strategies Exported', value: '850k+', icon: TrendingUp },
            ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-brand-500">
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Execution Packages</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose your level of access. Upgrade anytime as your trading volume increases.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 flex flex-col hover:border-slate-700 transition-colors">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-slate-400 text-sm mt-4">For beginners validating ideas.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>5 Backtests / Month</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Basic Analytics</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Standard Data Sources</span>
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <XIcon className="w-5 h-5 flex-shrink-0" />
                  <span>No Code Export</span>
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <XIcon className="w-5 h-5 flex-shrink-0" />
                  <span>No AI Optimization</span>
                </li>
              </ul>
              <Link to="/auth/signup" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-center transition-colors border border-slate-700">
                Start Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="relative bg-slate-900/80 backdrop-blur-md border border-brand-500/50 rounded-2xl p-8 flex flex-col transform md:-translate-y-4 shadow-2xl shadow-brand-900/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Pro Trader</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-slate-400 text-sm mt-4">For serious quants needing code.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="font-bold">20 Backtests / Month</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Full Code Export (MT5, Python)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>AI Alpha Suggestions</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Advanced Charting</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Priority Support</span>
                </li>
              </ul>
              <Link to="/auth/signup" className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg text-center transition-colors shadow-lg shadow-brand-500/25">
                Get Pro Access
              </Link>
            </div>

            {/* Elite Tier */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 flex flex-col hover:border-slate-700 transition-colors">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Institutional</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$199</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-slate-400 text-sm mt-4">For funds and heavy volume.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Unlimited Backtests</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>API Access</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Tick-level Data</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Dedicated Server</span>
                </li>
              </ul>
              <Link to="/auth/signup" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-center transition-colors border border-slate-700">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="bg-brand-600/20 p-1.5 rounded-lg border border-brand-500/20">
                 <Terminal className="w-4 h-4 text-brand-500" />
             </div>
             <span className="font-mono text-slate-300">QuantPilot AI</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-400 transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Terms of Execution</a>
            <a href="#" className="hover:text-brand-400 transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;