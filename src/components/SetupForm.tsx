import React, { useState, useEffect, useCallback } from 'react';
import type { TradeSetup, Timeframe, IndianStockPreset } from '../types';
import { POPULAR_INDIAN_STOCKS, formatIndianTicker, findStockPreset } from '../utils/indianStocks';
import { fetchRealMarketData, fetchStockSnapshot, type StockSnapshot } from '../services/marketDataApi';
import { 
  RefreshCw, 
  Clock, 
  Target, 
  ShieldAlert, 
  Bell, 
  User, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Settings, 
  ChevronDown, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowRight, 
  Activity, 
  Info,
  Menu,
  Sparkles,
  CheckCircle2,
  Radio,
  Zap,
  ArrowUpRight
} from 'lucide-react';

interface SetupFormProps {
  onStartTrading: (setup: TradeSetup) => void;
  onOpenSettings?: () => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onStartTrading, onOpenSettings }) => {
  const [symbol, setSymbol] = useState<string>('RELIANCE');
  const [buyPrice, setBuyPrice] = useState<string>('1475.00');
  const [quantity, setQuantity] = useState<string>('50');
  const [targetPrice, setTargetPrice] = useState<string>('1497.10');
  const [stopLoss, setStopLoss] = useState<string>('1460.25');
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [strategyMode, setStrategyMode] = useState<string>('Intraday');
  const [activeNav, setActiveNav] = useState<string>('configure');
  const [activeRatioPreset, setActiveRatioPreset] = useState<string>('2.5 / 1.5');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState<boolean>(false);
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Real-time live snapshot state
  const [snapshot, setSnapshot] = useState<StockSnapshot | null>(null);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState<boolean>(false);
  
  // Toast notifications for header buttons
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load real-time snapshot whenever symbol changes
  const loadSnapshot = useCallback(async (sym: string) => {
    setIsLoadingSnapshot(true);
    try {
      const snap = await fetchStockSnapshot(sym);
      setSnapshot(snap);
    } catch {
      setSnapshot(null);
    } finally {
      setIsLoadingSnapshot(false);
    }
  }, []);

  useEffect(() => {
    loadSnapshot(symbol);
  }, [symbol, loadSnapshot]);

  const handleSelectPreset = (preset: IndianStockPreset) => {
    setSymbol(preset.symbol);
    const priceStr = preset.approxPrice.toFixed(2);
    setBuyPrice(priceStr);
    const priceNum = preset.approxPrice;
    setTargetPrice((priceNum * 1.015).toFixed(2));
    setStopLoss((priceNum * 0.990).toFixed(2));
    setIsPresetDropdownOpen(false);
    setErrorMsg(null);
  };

  const handleSelectAndLoadPreset = (preset: IndianStockPreset) => {
    handleSelectPreset(preset);
    setActiveNav('configure');
  };

  const handlePresetTargetStopLoss = (targetPct: number, slPct: number, presetLabel: string) => {
    setActiveRatioPreset(presetLabel);
    const base = parseFloat(buyPrice);
    if (!isNaN(base) && base > 0) {
      setTargetPrice((base * (1 + targetPct / 100)).toFixed(2));
      setStopLoss((base * (1 - slPct / 100)).toFixed(2));
    }
  };

  const handleFetchCurrentMarketPrice = async () => {
    if (!symbol.trim()) return;
    setIsFetchingPrice(true);
    setErrorMsg(null);
    try {
      const data = await fetchRealMarketData(symbol, timeframe, parseFloat(buyPrice) || 1000);
      if (data.currentPrice > 0) {
        const fetched = data.currentPrice;
        setBuyPrice(fetched.toFixed(2));
        setTargetPrice((fetched * 1.015).toFixed(2));
        setStopLoss((fetched * 0.990).toFixed(2));
        loadSnapshot(symbol);
      }
    } catch {
      setErrorMsg('Could not fetch live market price. Using entered price.');
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(buyPrice);
    const parsedQty = quantity ? parseInt(quantity, 10) : undefined;
    const parsedTarget = targetPrice ? parseFloat(targetPrice) : undefined;
    const parsedSL = stopLoss ? parseFloat(stopLoss) : undefined;

    if (!symbol.trim()) {
      setErrorMsg('Please enter a valid stock symbol (e.g. RELIANCE)');
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg('Please enter a valid positive entry price');
      return;
    }

    setErrorMsg(null);
    onStartTrading({
      symbol: symbol.trim().toUpperCase(),
      buyPrice: parsedPrice,
      quantity: parsedQty && parsedQty > 0 ? parsedQty : undefined,
      targetPrice: parsedTarget && parsedTarget > 0 ? parsedTarget : undefined,
      stopLoss: parsedSL && parsedSL > 0 ? parsedSL : undefined,
      timeframe,
    });
  };

  // Dynamic calculations for risk metrics
  const pPrice = parseFloat(buyPrice) || 0;
  const pTarget = parseFloat(targetPrice) || 0;
  const pSL = parseFloat(stopLoss) || 0;
  const pQty = parseInt(quantity, 10) || 1;

  const rewardPerShare = pTarget > pPrice ? pTarget - pPrice : 0;
  const riskPerShare = pPrice > pSL ? pPrice - pSL : 0;

  const targetPct = pPrice > 0 ? ((pTarget - pPrice) / pPrice) * 100 : 1.5;
  const slPct = pPrice > 0 ? ((pPrice - pSL) / pPrice) * 100 : 1.0;

  const rrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '1.50';
  const rrVal = parseFloat(rrRatio) || 1.5;
  const progressPct = Math.min(100, Math.max(15, (rrVal / 3) * 100));
  const strokeOffset = 238.76 - (238.76 * progressPct) / 100;

  const totalCapitalNum = pPrice * pQty;
  const maxRiskNum = riskPerShare * pQty;
  const targetProfitNum = rewardPerShare * pQty;

  const totalCapitalStr = totalCapitalNum > 0 ? Math.round(totalCapitalNum).toLocaleString('en-IN') : '0';
  const maxRiskStr = maxRiskNum > 0 ? Math.round(maxRiskNum).toLocaleString('en-IN') : '0';
  const targetProfitStr = targetProfitNum > 0 ? Math.round(targetProfitNum).toLocaleString('en-IN') : '0';

  // SVG Sparkline path generator from real candle data
  const generateSparklinePath = (candles?: { close: number }[]) => {
    if (!candles || candles.length < 2) {
      return 'M0 20 L20 18 L40 25 L60 15 L80 22 L100 10';
    }
    const closes = candles.map((c) => c.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const points = closes.map((val, idx) => {
      const x = (idx / (closes.length - 1)) * 100;
      const y = 35 - ((val - min) / range) * 28;
      return `${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const activePresetInfo = findStockPreset(symbol);

  return (
    <div className="relative h-dvh w-full bg-[#08090c] text-[#E6E6E6] flex flex-row font-sans overflow-hidden selection:bg-[#F5CB4C]/30 selection:text-[#F5CB4C]">
      
      {/* Toast Notification Container */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-[#0e0f14]/95 border border-[#F5CB4C]/40 text-[#F5CB4C] font-mono text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
          <Zap className="w-4 h-4 text-[#F5CB4C] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Background Ink Wash Artwork */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-85 z-0"
        style={{ backgroundImage: `url('/senko_bg.jpg')` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-[#08090c] via-[#08090c]/40 to-[#08090c]/70 z-0" />

      {/* Left Navigation Sidebar */}
      <aside 
        className={`relative z-20 hidden lg:flex flex-col justify-between border-r border-[#1b1c24] bg-[#08090c]/80 backdrop-blur-xl transition-all duration-300 h-full shrink-0 overflow-hidden ${
          isSidebarCollapsed ? 'w-20 p-4' : 'w-64 p-5'
        }`}
      >
        {/* Dedicated Sidebar Background Image */}
        <div 
          className="absolute inset-0 pointer-events-none bg-no-repeat opacity-95 z-0"
          style={{ 
            backgroundImage: `url('/senko_sidebar_bg.png')`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#08090c]/50 via-transparent to-[#08090c]/70 z-0" />

        {/* Sidebar Top: Brand Logo & Tagline */}
        <div className="relative z-10 space-y-6">
          {isSidebarCollapsed ? (
            <div className="w-10 h-10 mx-auto rounded-full border border-[#F5CB4C]/40 bg-[#0F1015]/90 flex items-center justify-center shadow-lg shadow-[#F5CB4C]/5">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-r-[#F5CB4C] border-b-[#F5CB4C] border-l-transparent transform -rotate-45" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-[#F5CB4C]/40 bg-[#0F1015]/90 flex items-center justify-center shadow-lg shadow-[#F5CB4C]/5 shrink-0">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-r-[#F5CB4C] border-b-[#F5CB4C] border-l-transparent transform -rotate-45" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h1 className="font-mono text-xl font-bold tracking-[0.2em] text-white">SENKO</h1>
                  <span className="font-serif text-sm text-[#F5CB4C]">先光</span>
                </div>
              </div>
              <p className="font-mono text-[9px] font-bold text-[#F5CB4C] tracking-[0.25em] uppercase pt-1">
                TRANQUIL INTRADAY PRECISION
              </p>
            </div>
          )}

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5 pt-2">
            {[
              { id: 'configure', label: 'Configure', icon: Target, isSoon: false },
              { id: 'presets', label: 'Presets', icon: Layers, isSoon: false },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, isSoon: true },
              { id: 'backtest', label: 'Backtest', icon: TrendingUp, isSoon: true },
              { id: 'journal', label: 'Journal', icon: BookOpen, isSoon: true },
              { id: 'settings', label: 'Settings', icon: Settings, isSoon: false },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'settings') {
                      if (onOpenSettings) onOpenSettings();
                      else showToast('Cockpit Settings available inside terminal view.');
                    } else {
                      setActiveNav(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#18160e]/90 border border-[#F5CB4C]/50 text-[#F5CB4C] font-bold shadow-md shadow-[#F5CB4C]/10 backdrop-blur-md'
                      : 'text-zinc-300 hover:text-white hover:bg-[#111218]/80 backdrop-blur-sm'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F5CB4C]' : 'text-zinc-400'}`} />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isSidebarCollapsed && item.isSoon && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F5CB4C]/15 border border-[#F5CB4C]/30 text-[#F5CB4C] font-bold uppercase tracking-wider">
                      SOON
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className="relative z-10 space-y-4 pt-4 border-t border-[#1b1c24]/80">
          {!isSidebarCollapsed && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#0d0e13]/85 border border-[#20222e] text-center relative overflow-hidden backdrop-blur-md">
                <div className="w-7 h-7 mx-auto mb-1.5 rounded-full border border-[#F5CB4C]/40 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border border-t-transparent border-r-[#F5CB4C] border-b-[#F5CB4C] border-l-transparent transform -rotate-45" />
                </div>
                <p className="font-serif text-[11px] italic text-zinc-300 leading-snug mb-1">
                  "In the midst of movement, there is stillness."
                </p>
                <span className="font-mono text-[9px] text-[#F5CB4C] font-semibold tracking-wider">
                  — Senko Philosophy
                </span>
              </div>

              {/* PhantomCodes & Social Links */}
              <div className="text-[10px] font-mono text-zinc-400 text-center space-y-1.5 pt-1">
                <div>
                  Part of{' '}
                  <a 
                    href="https://www.phantomcodes.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#F5CB4C] font-bold hover:underline"
                  >
                    PhantomCodes
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2 text-[9px] text-zinc-500">
                  <a href="https://github.com/SIDDHUX9" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                  <span>•</span>
                  <a href="https://www.linkedin.com/in/siddhu-singh/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            {!isSidebarCollapsed && <span>Collapse</span>}
            {isSidebarCollapsed ? <ChevronsRight className="w-4 h-4 mx-auto" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Right Header Bar */}
        <header className="w-full h-16 border-b border-[#1b1c24] bg-[#08090c]/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between shrink-0">
          
          {/* Mobile Header Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              type="button" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg bg-[#111218] border border-[#22242c] text-zinc-400 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-[#F5CB4C]/40 bg-[#0F1015] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border border-t-transparent border-r-[#F5CB4C] border-b-[#F5CB4C] border-l-transparent transform -rotate-45" />
              </div>
              <span className="font-mono font-bold text-sm text-white tracking-widest">SENKO</span>
              <span className="font-serif text-xs text-[#F5CB4C]">先光</span>
            </div>
          </div>

          <div className="hidden lg:block" />

          {/* Top Right Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d0e12]/90 border border-[#22242c] text-[#22C55E] font-mono text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[#F5CB4C] tracking-wider">NSE LIVE READY</span>
            </div>

            <button 
              type="button" 
              onClick={() => showToast('Real-Time Mobile & Web Push Notifications — Coming Soon in v2.0')}
              className="p-2 rounded-full bg-[#0d0e12]/90 border border-[#22242c] text-zinc-400 hover:text-white transition-colors cursor-pointer backdrop-blur-md relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button 
              type="button" 
              onClick={() => showToast('Cloud Sync & User Accounts — Coming Soon in v2.0')}
              className="p-2 rounded-full bg-[#0d0e12]/90 border border-[#22242c] text-zinc-400 hover:text-white transition-colors cursor-pointer backdrop-blur-md relative"
              title="User Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Workspace Views depending on activeNav */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          
          {/* VIEW 1: CONFIGURE POSITION */}
          {activeNav === 'configure' && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pb-16 lg:pb-0">
              
              {/* Main Setup Form Column */}
              <div className="lg:col-span-8 space-y-6">
                
                <div className="rounded-2xl bg-[#0b0c10]/90 border border-[#1b1c24] p-5 lg:p-8 shadow-2xl backdrop-blur-xl relative">
                  <div className="mb-7">
                    <h2 className="font-serif text-2xl lg:text-3xl font-bold tracking-wide text-white mb-1">
                      Configure Position
                    </h2>
                    <p className="font-mono text-xs text-zinc-400">
                      Select a symbol or enter your custom intraday trade boundaries.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Section 1: MARKET & SYMBOL */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="symbolInput" className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                          1. MARKET & SYMBOL
                        </label>
                        {activePresetInfo && (
                          <span className="font-sans text-[10px] text-[#F5CB4C] font-semibold hidden xs:inline">
                            {activePresetInfo.name} ({activePresetInfo.sector})
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <div className="w-full flex items-center bg-[#0d0e12]/90 border border-[#22242c] focus-within:border-[#F5CB4C]/60 rounded-xl px-4 py-3 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#161822] border border-[#2c2f3d] flex items-center justify-center font-mono text-xs font-bold text-[#F5CB4C] shrink-0 mr-3">
                            {symbol ? symbol.charAt(0).toUpperCase() : 'S'}
                          </div>

                          <div className="flex-1">
                            <input
                              id="symbolInput"
                              type="text"
                              value={symbol}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setSymbol(val);
                                setErrorMsg(null);
                              }}
                              placeholder="ENTER SYMBOL (E.G. RELIANCE, TATAMOTORS)"
                              className="w-full bg-transparent font-mono text-base font-bold text-white uppercase tracking-wider outline-none placeholder:text-zinc-600 placeholder:normal-case placeholder:font-sans placeholder:text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="font-mono text-xs text-zinc-500 hidden xs:inline">
                              {formatIndianTicker(symbol)}
                            </span>

                            <button
                              type="button"
                              onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                              className="p-1.5 rounded-lg hover:bg-[#181a24] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title="Select Popular Stock Preset"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${isPresetDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Dropdown Stock Selectors */}
                        {isPresetDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#0e0f14] border border-[#262835] shadow-2xl p-2 z-50 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                            {POPULAR_INDIAN_STOCKS
                              .filter((p) => !symbol || p.symbol.includes(symbol) || p.name.toUpperCase().includes(symbol))
                              .concat(
                                POPULAR_INDIAN_STOCKS.filter(
                                  (p) => symbol && !p.symbol.includes(symbol) && !p.name.toUpperCase().includes(symbol)
                                )
                              )
                              .map((preset) => (
                                <button
                                  key={preset.symbol}
                                  type="button"
                                  onClick={() => handleSelectPreset(preset)}
                                  className={`flex items-center justify-between p-2.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                                    symbol.toUpperCase() === preset.symbol
                                      ? 'bg-[#18160e] border border-[#F5CB4C]/40 text-[#F5CB4C] font-bold'
                                      : 'hover:bg-[#151720] text-zinc-300'
                                  }`}
                                >
                                  <span className="truncate">{preset.symbol}</span>
                                  <span className="text-[10px] text-zinc-500 shrink-0">₹{preset.approxPrice}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 2: ENTRY SETUP */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          2. ENTRY SETUP
                        </label>
                        <button
                          type="button"
                          onClick={handleFetchCurrentMarketPrice}
                          disabled={isFetchingPrice}
                          className="inline-flex items-center gap-1.5 font-mono text-xs text-[#F5CB4C] hover:text-[#FFE066] transition-colors disabled:opacity-50 cursor-pointer font-medium"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isFetchingPrice ? 'animate-spin' : ''}`} />
                          <span>{isFetchingPrice ? 'Fetching...' : 'Fetch Market Price'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#0d0e12]/90 border border-[#22242c] focus-within:border-[#F5CB4C]/60 rounded-xl p-3.5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#141620] border border-[#242735] flex items-center justify-center font-mono text-sm font-bold text-zinc-400 shrink-0">
                              ₹
                            </div>
                            <div className="flex-1">
                              <label htmlFor="buyPrice" className="font-mono text-[10px] text-zinc-400 block mb-0.5">
                                Buy Entry Price (₹)
                              </label>
                              <input
                                id="buyPrice"
                                type="number"
                                step="0.05"
                                value={buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                                placeholder="1475.00"
                                required
                                className="w-full bg-transparent font-mono text-lg font-bold text-white outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#0d0e12]/90 border border-[#22242c] focus-within:border-[#F5CB4C]/60 rounded-xl p-3.5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#141620] border border-[#242735] flex items-center justify-center font-mono text-sm font-bold text-zinc-400 shrink-0">
                              #
                            </div>
                            <div className="flex-1">
                              <label htmlFor="quantity" className="font-mono text-[10px] text-zinc-400 block mb-0.5">
                                Quantity (Shares)
                              </label>
                              <input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="50"
                                className="w-full bg-transparent font-mono text-lg font-bold text-white outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: TARGET & STOP-LOSS BOUNDARIES */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span>3. TARGET & STOP-LOSS BOUNDARIES</span>
                          <Info className="w-3.5 h-3.5 text-zinc-500 cursor-pointer hover:text-zinc-300" />
                        </label>

                        <div className="flex items-center gap-1.5">
                          {[
                            { label: '1.5% / 1.0%', tPct: 1.5, slPct: 1.0 },
                            { label: '2.5% / 1.5%', tPct: 2.5, slPct: 1.5 },
                            { label: '3.5% / 2.0%', tPct: 3.5, slPct: 2.0 },
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => handlePresetTargetStopLoss(item.tPct, item.slPct, item.label.replace(/%/g, ''))}
                              className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                activeRatioPreset.includes(item.label.split('%')[0])
                                  ? 'border-[#F5CB4C] text-[#F5CB4C] bg-[#14130d]/90 font-bold shadow-sm shadow-[#F5CB4C]/10'
                                  : 'border-[#22242c] text-zinc-400 hover:text-white bg-[#0d0e12]/90'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#0b1310]/90 border border-[#1b3d2b] focus-within:border-[#22C55E] rounded-xl p-4 transition-colors">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-lg bg-[#0e2217] border border-[#194b30] flex items-center justify-center shrink-0">
                              <Target className="w-5 h-5 text-[#22C55E]" />
                            </div>
                            <div className="flex-1">
                              <span className="font-mono text-[10px] text-zinc-400 block">Target (₹)</span>
                              <input
                                id="targetPrice"
                                type="number"
                                step="0.05"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                placeholder="1497.10"
                                className="w-full bg-transparent font-mono text-xl font-bold text-white outline-none"
                              />
                            </div>
                          </div>
                          <div className="font-mono text-xs text-[#22C55E] font-semibold pl-13">
                            (+{targetPct.toFixed(2)}%)
                          </div>
                        </div>

                        <div className="bg-[#140c0e]/90 border border-[#401b20] focus-within:border-[#EF4444] rounded-xl p-4 transition-colors">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-lg bg-[#241115] border border-[#522026] flex items-center justify-center shrink-0">
                              <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                            </div>
                            <div className="flex-1">
                              <span className="font-mono text-[10px] text-zinc-400 block">Stop-Loss (₹)</span>
                              <input
                                id="stopLoss"
                                type="number"
                                step="0.05"
                                value={stopLoss}
                                onChange={(e) => setStopLoss(e.target.value)}
                                placeholder="1460.25"
                                className="w-full bg-transparent font-mono text-xl font-bold text-white outline-none"
                              />
                            </div>
                          </div>
                          <div className="font-mono text-xs text-[#EF4444] font-semibold pl-13">
                            (-{slPct.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: EXECUTION SETTINGS */}
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                        4. EXECUTION SETTINGS
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#0d0e12]/90 border border-[#22242c] rounded-xl p-3.5 relative">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#141620] border border-[#242735] flex items-center justify-center shrink-0 text-zinc-400">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="timeframe" className="font-mono text-[10px] text-zinc-400 block mb-0.5">
                                Candle Interval
                              </label>
                              <select
                                id="timeframe"
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                                className="w-full bg-transparent font-mono text-base font-bold text-white outline-none appearance-none cursor-pointer pr-6"
                              >
                                <option value="1m" className="bg-[#0d0e12] text-white">1 Minute</option>
                                <option value="3m" className="bg-[#0d0e12] text-white">3 Minutes</option>
                                <option value="5m" className="bg-[#0d0e12] text-white">5 Minutes</option>
                                <option value="15m" className="bg-[#0d0e12] text-white">15 Minutes</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#0d0e12]/90 border border-[#22242c] rounded-xl p-3.5 relative">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#141620] border border-[#242735] flex items-center justify-center shrink-0 text-zinc-400">
                              <Activity className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="strategyMode" className="font-mono text-[10px] text-zinc-400 block mb-0.5">
                                Strategy Mode
                              </label>
                              <select
                                id="strategyMode"
                                value={strategyMode}
                                onChange={(e) => setStrategyMode(e.target.value)}
                                className="w-full bg-transparent font-mono text-base font-bold text-white outline-none appearance-none cursor-pointer pr-6"
                              >
                                <option value="Intraday" className="bg-[#0d0e12] text-white">Intraday</option>
                                <option value="Scalping" className="bg-[#0d0e12] text-white">Scalping</option>
                                <option value="Swing" className="bg-[#0d0e12] text-white">Swing</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] font-mono text-xs text-center">
                        {errorMsg}
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="group relative w-full h-[60px] md:h-[68px] rounded-[12px] overflow-hidden border border-[#c5a028]/50 shadow-lg flex items-center justify-center transition-all duration-200 active:scale-[0.985] hover:brightness-[1.06] cursor-pointer"
                        style={{
                          backgroundImage: `url('/senko_btn_bg.png')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {/* Subtle Overlay */}
                        <div className="absolute inset-0 bg-[#000000]/5 group-hover:bg-transparent transition-colors duration-200 pointer-events-none" />

                        {/* Content Container (Centered Label + Divider + Thin Arrow) */}
                        <div className="relative z-10 flex items-center justify-center gap-3 text-[#12110e]">
                          <span className="font-mono text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
                            LAUNCH SENKO TERMINAL
                          </span>

                          {/* Thin Vertical Divider */}
                          <span className="h-4 w-[1px] bg-[#12110e]/35 shrink-0" />

                          {/* Simple Thin Arrow */}
                          <ArrowRight className="w-4 h-4 text-[#12110e] stroke-[1.75] transition-transform duration-200 group-hover:translate-x-1.5 shrink-0" />
                        </div>
                      </button>
                    </div>

                  </form>
                </div>

              </div>

              {/* Right Side Overview Column */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Card 1: RISK OVERVIEW */}
                <div className="rounded-2xl bg-[#0b0c10]/90 border border-[#1b1c24] p-5 shadow-xl backdrop-blur-xl space-y-4">
                  <h3 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    RISK OVERVIEW
                  </h3>

                  <div className="flex items-center justify-between gap-4">
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" stroke="#1c1e28" strokeWidth="8" fill="none" />
                        <circle 
                          cx="50" cy="50" r="38" 
                          stroke="#F5CB4C" 
                          strokeWidth="8" 
                          fill="none" 
                          strokeDasharray="238.76" 
                          strokeDashoffset={strokeOffset} 
                          strokeLinecap="round" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
                        <span className="font-mono text-xs font-extrabold text-[#F5CB4C] leading-none mb-1">{rrRatio} : 1</span>
                        <span className="font-mono text-[7px] font-semibold text-zinc-400 uppercase tracking-tighter leading-none">RISK-TO-REWARD</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 font-mono text-xs text-right">
                      <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                        <span>Total Capital</span>
                        <span className="text-white font-semibold">₹{totalCapitalStr}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                        <span>Max Risk</span>
                        <span className="text-[#EF4444] font-semibold">-₹{maxRiskStr}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                        <span>Target Profit</span>
                        <span className="text-[#22C55E] font-semibold">+₹{targetProfitStr}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: SETUP SUMMARY */}
                <div className="rounded-2xl bg-[#0b0c10]/90 border border-[#1b1c24] p-5 shadow-xl backdrop-blur-xl space-y-3">
                  <h3 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    SETUP SUMMARY
                  </h3>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center text-zinc-500">○</span>
                        <span>Symbol</span>
                      </div>
                      <span className="text-white font-semibold">{formatIndianTicker(symbol)}</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center text-zinc-500">₹</span>
                        <span>Entry Price</span>
                      </div>
                      <span className="text-white font-semibold">₹{pPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center text-zinc-500">#</span>
                        <span>Quantity</span>
                      </div>
                      <span className="text-white font-semibold">{quantity} Shares</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>Target</span>
                      </div>
                      <span className="text-[#22C55E] font-semibold">₹{pTarget.toFixed(2)} ({targetPct.toFixed(2)}%)</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span>Stop-Loss</span>
                      </div>
                      <span className="text-[#EF4444] font-semibold">₹{pSL.toFixed(2)} ({slPct.toFixed(2)}%)</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center text-zinc-500">⚖</span>
                        <span>Risk-to-Reward</span>
                      </div>
                      <span className="text-[#F5CB4C] font-semibold">{rrRatio} : 1</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Candle Interval</span>
                      </div>
                      <span className="text-white font-semibold">{timeframe === '1m' ? '1 Minute' : timeframe === '3m' ? '3 Minutes' : timeframe === '5m' ? '5 Minutes' : '15 Minutes'}</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Mode</span>
                      </div>
                      <span className="text-white font-semibold">{strategyMode}</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: REAL-TIME LIVE MARKET SNAPSHOT */}
                <div className="rounded-2xl bg-[#0b0c10]/90 border border-[#1b1c24] p-5 shadow-xl backdrop-blur-xl space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      LIVE MARKET SNAPSHOT
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span>{snapshot?.isLive ? 'LIVE FEED' : 'NSE STREAM'}</span>
                    </div>
                  </div>

                  {isLoadingSnapshot ? (
                    <div className="h-16 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#F5CB4C]/20 border-t-[#F5CB4C] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div>
                        <span className="font-mono text-xs font-bold text-white block">
                          {formatIndianTicker(symbol)} <span className="text-[10px] font-normal text-zinc-500 uppercase">{activePresetInfo?.name || 'EQUITY'}</span>
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-mono text-lg font-bold text-white">
                            ₹{snapshot ? snapshot.price.toFixed(2) : pPrice.toFixed(2)}
                          </span>
                          <span className={`font-mono text-xs font-semibold ${(snapshot?.change || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {(snapshot?.change || 0) >= 0 ? '+' : ''}{snapshot?.change.toFixed(2) || '0.00'} ({(snapshot?.changePct || 0) >= 0 ? '+' : ''}{snapshot?.changePct.toFixed(2) || '0.00'}%)
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Real-Time Sparkline */}
                      <svg className="w-24 h-10 shrink-0" viewBox="0 0 100 40" fill="none">
                        <path 
                          d={generateSparklinePath(snapshot?.candles)} 
                          stroke={(snapshot?.change || 0) >= 0 ? '#22C55E' : '#EF4444'} 
                          strokeWidth="2.2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Footer Feature Badges */}
                <div className="rounded-2xl bg-[#0b0c10]/90 border border-[#1b1c24] p-4 shadow-xl backdrop-blur-xl grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5CB4C] text-sm">📊</span>
                    <div>
                      <span className="block font-bold text-zinc-300">Real-time Data</span>
                      <span className="text-[9px] text-zinc-500">TradingView API</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5CB4C] text-sm">⚡</span>
                    <div>
                      <span className="block font-bold text-zinc-300">Zero Latency</span>
                      <span className="text-[9px] text-zinc-500">Hardware Audio</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5CB4C] text-sm">🔒</span>
                    <div>
                      <span className="block font-bold text-zinc-300">Secure & Private</span>
                      <span className="text-[9px] text-zinc-500">Client Side</span>
                    </div>
                  </div>
                </div>

                {/* PhantomCodes & Developer Credits Footer */}
                <div className="rounded-2xl bg-[#0b0c10]/90 border border-[#1b1c24] p-4 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Part of</span>
                    <a 
                      href="https://www.phantomcodes.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold text-[#F5CB4C] hover:underline flex items-center gap-1"
                    >
                      PhantomCodes <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <a 
                      href="https://github.com/SIDDHUX9" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1 text-zinc-300"
                    >
                      <span>GitHub</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                    </a>
                    <span className="text-zinc-700">•</span>
                    <a 
                      href="https://www.linkedin.com/in/siddhu-singh/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1 text-zinc-300"
                    >
                      <span>LinkedIn</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                    </a>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW 2: PRESETS EXPLORER */}
          {activeNav === 'presets' && (
            <div className="max-w-7xl mx-auto space-y-6 pb-16 lg:pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0b0c10]/90 border border-[#1b1c24] backdrop-blur-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F5CB4C]/10 border border-[#F5CB4C]/30 text-[#F5CB4C] font-mono text-[10px] font-bold uppercase">
                      NSE LIQUIDITY PRESETS
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white">Stock Presets Explorer</h2>
                  <p className="font-mono text-xs text-zinc-400 mt-1">
                    Select any popular Indian stock to instantly calculate trade boundaries and load into your cockpit.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('configure')}
                  className="px-4 py-2.5 rounded-xl bg-[#141620] border border-[#242735] text-zinc-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
                >
                  <span>Back to Position Form</span>
                  <ArrowRight className="w-4 h-4 text-[#F5CB4C]" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {POPULAR_INDIAN_STOCKS.map((preset) => {
                  const isCurrent = symbol.toUpperCase() === preset.symbol;
                  return (
                    <div
                      key={preset.symbol}
                      className={`p-5 rounded-2xl border transition-all backdrop-blur-xl flex flex-col justify-between space-y-4 ${
                        isCurrent
                          ? 'bg-[#18160e]/90 border-[#F5CB4C]/60 shadow-lg shadow-[#F5CB4C]/10'
                          : 'bg-[#0b0c10]/90 border-[#1b1c24] hover:border-[#2a2c3a]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-lg font-bold text-white tracking-wider">
                            {preset.symbol}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#161822] border border-[#2c2f3d] text-zinc-400 font-mono text-[10px]">
                            {preset.sector}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-zinc-400 mb-3">{preset.name}</p>

                        <div className="flex items-baseline justify-between font-mono">
                          <span className="text-xs text-zinc-500">Approx Price:</span>
                          <span className="text-base font-bold text-[#F5CB4C]">₹{preset.approxPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectAndLoadPreset(preset)}
                        className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#F5CB4C] text-[#0b0c0f] hover:brightness-110'
                            : 'bg-[#141620] border border-[#242735] text-zinc-200 hover:bg-[#1a1c2a] hover:text-white'
                        }`}
                      >
                        <span>{isCurrent ? 'Active in Cockpit' : 'Load Into Cockpit'}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: FEATURE COMING SOON PREVIEW (Analytics, Backtest, Journal) */}
          {(activeNav === 'analytics' || activeNav === 'backtest' || activeNav === 'journal') && (
            <div className="max-w-4xl mx-auto space-y-6 py-8 pb-16 lg:pb-0">
              <div className="rounded-3xl bg-[#0b0c10]/90 border border-[#1b1c24] p-8 lg:p-12 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden space-y-6">
                
                {/* Background Glow Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F5CB4C]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#141620] border border-[#F5CB4C]/40 flex items-center justify-center shadow-xl shadow-[#F5CB4C]/10 text-[#F5CB4C]">
                  {activeNav === 'analytics' && <BarChart3 className="w-8 h-8" />}
                  {activeNav === 'backtest' && <TrendingUp className="w-8 h-8" />}
                  {activeNav === 'journal' && <BookOpen className="w-8 h-8" />}
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5CB4C]/10 border border-[#F5CB4C]/30 text-[#F5CB4C] font-mono text-xs font-bold uppercase tracking-widest mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>COMING SOON IN V2.0</span>
                  </div>

                  <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white capitalize">
                    {activeNav === 'analytics' && 'Intraday Risk Matrix & Analytics'}
                    {activeNav === 'backtest' && 'Strategy Backtesting Engine'}
                    {activeNav === 'journal' && 'Automated Trade Journal'}
                  </h2>

                  <p className="font-mono text-xs text-zinc-400 leading-relaxed pt-2">
                    {activeNav === 'analytics' && 'Comprehensive win/loss distribution, drawdown heatmaps, Sharpe ratio metrics, and live exposure matrix designed for high-frequency intraday traders.'}
                    {activeNav === 'backtest' && 'Multi-year tick replay, Monte Carlo slippage modeling, brokerage fee simulations, and automated strategy performance benchmarks.'}
                    {activeNav === 'journal' && 'Automated execution logging, trader emotion tagging, P&L calendar exports, and screenshot annotations to refine your daily edge.'}
                  </p>
                </div>

                {/* Feature Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left pt-4 font-mono text-xs text-zinc-300">
                  {activeNav === 'analytics' && [
                    'Real-Time Exposure Matrix',
                    'Sharpe & Sortino Ratios',
                    'Win/Loss Streak Analytics',
                    'Risk-to-Reward Heatmap'
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0e1017] border border-[#202230]">
                      <CheckCircle2 className="w-4 h-4 text-[#F5CB4C] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}

                  {activeNav === 'backtest' && [
                    'Multi-Year Candle Replay',
                    'Monte Carlo Slippage Test',
                    'Custom Indicator Rules',
                    'Brokerage & Tax Simulator'
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0e1017] border border-[#202230]">
                      <CheckCircle2 className="w-4 h-4 text-[#F5CB4C] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}

                  {activeNav === 'journal' && [
                    'Automated Trade Execution Sync',
                    'Emotion & Mistake Tagging',
                    'P&L Calendar Overview',
                    'PDF & CSV Export Reports'
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0e1017] border border-[#202230]">
                      <CheckCircle2 className="w-4 h-4 text-[#F5CB4C] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveNav('configure')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F5CB4C] hover:brightness-110 text-[#0b0c0f] font-mono text-xs font-bold transition-all shadow-lg shadow-[#F5CB4C]/15 cursor-pointer"
                  >
                    Return to Cockpit Position Setup
                  </button>

                  <button
                    onClick={() => setActiveNav('presets')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#141620] border border-[#242735] hover:bg-[#1a1c2a] text-zinc-200 font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    Browse Stock Presets
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#08090c]/95 border-t border-[#1b1c24] backdrop-blur-xl flex items-center justify-around z-50 px-2">
        {[
          { id: 'configure', label: 'Configure', icon: Target },
          { id: 'presets', label: 'Presets', icon: Layers },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'backtest', label: 'Backtest', icon: TrendingUp },
          { id: 'journal', label: 'Journal', icon: BookOpen },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl font-mono text-[10px] transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#F5CB4C] font-bold bg-[#18160e] border border-[#F5CB4C]/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#F5CB4C]' : 'text-zinc-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default SetupForm;
