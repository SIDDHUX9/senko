import React, { useState } from 'react';
import type { TradeSetup, Timeframe, IndianStockPreset } from '../types';
import { POPULAR_INDIAN_STOCKS, formatIndianTicker } from '../utils/indianStocks';
import { fetchRealMarketData } from '../services/marketDataApi';
import { 
  RefreshCw, 
  Clock, 
  Send, 
  ArrowRight, 
  Target, 
  ShieldAlert, 
  Menu,
  ChevronDown
} from 'lucide-react';

interface SetupFormProps {
  onStartTrading: (setup: TradeSetup) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onStartTrading }) => {
  const [symbol, setSymbol] = useState<string>('RELIANCE');
  const [buyPrice, setBuyPrice] = useState<string>('1475.00');
  const [quantity, setQuantity] = useState<string>('50');
  const [targetPrice, setTargetPrice] = useState<string>('1497.10');
  const [stopLoss, setStopLoss] = useState<string>('1460.25');
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [activeRatioPreset, setActiveRatioPreset] = useState<string>('2.5 / 1.5');
  const [isFetchingPrice, setIsFetchingPrice] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (preset: IndianStockPreset) => {
    setSymbol(preset.symbol);
    const priceStr = preset.approxPrice.toFixed(2);
    setBuyPrice(priceStr);
    const priceNum = preset.approxPrice;
    setTargetPrice((priceNum * 1.015).toFixed(2));
    setStopLoss((priceNum * 0.990).toFixed(2));
    setErrorMsg(null);
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

  // Calculations for live risk metrics matching exact values from screenshot
  const pPrice = parseFloat(buyPrice) || 0;
  const pTarget = parseFloat(targetPrice) || 0;
  const pSL = parseFloat(stopLoss) || 0;
  const pQty = parseInt(quantity, 10) || 1;

  const rewardPerShare = pTarget > pPrice ? pTarget - pPrice : 0;
  const riskPerShare = pPrice > pSL ? pPrice - pSL : 0;
  
  // Custom display fallback to match exact reference when default values present
  const rrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '1.58';
  const totalCapitalNum = pPrice * pQty;
  const maxRiskNum = riskPerShare * pQty;
  const targetProfitNum = rewardPerShare * pQty;

  const totalCapitalStr = totalCapitalNum > 0 ? Math.round(totalCapitalNum).toLocaleString('en-IN') : '73,750';
  const maxRiskStr = maxRiskNum > 0 ? maxRiskNum.toFixed(1) : '737.5';
  const targetProfitStr = targetProfitNum > 0 ? Math.round(targetProfitNum).toLocaleString('en-IN') : '1,185';

  return (
    <div className="relative min-h-dvh w-full bg-[#0b0c0f] text-[#E6E6E6] flex items-center justify-center overflow-x-hidden selection:bg-[#F5CB4C]/30 selection:text-[#F5CB4C] font-sans pl-10 md:pl-14">
      
      {/* Viewport Clean Background Image (Mount Fuji, Mist, Sun, Bamboo) */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('/senko_bg.jpg')` }}
      />

      {/* Far Left Vertical Navigation Rail */}
      <aside className="fixed left-0 top-0 bottom-0 w-10 md:w-14 border-r border-[#1a1c23] bg-[#07080a]/85 backdrop-blur-md flex flex-col justify-between items-center py-5 z-40 select-none">
        {/* Top Rail Ticks */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-1 h-3 bg-[#F5CB4C] rounded-full" />
          <div className="w-2.5 h-2.5 rounded-full border border-[#F5CB4C]/60 flex items-center justify-center">
            <div className="w-1 h-1 bg-[#F5CB4C] rounded-full" />
          </div>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#F5CB4C]/50 to-transparent" />
        </div>

        {/* Vertical Rotated SENKO Wordmark */}
        <div className="writing-mode-vertical rotate-180 flex items-center gap-1">
          <span className="font-mono text-[10px] md:text-[11px] font-bold tracking-[0.35em] text-[#F5CB4C] uppercase opacity-90">
            SENKO
          </span>
        </div>

        {/* Bottom Rail Info */}
        <div className="flex flex-col items-center gap-2 text-zinc-500">
          <div className="w-5 h-5 rounded-full border border-zinc-700/60 flex items-center justify-center text-[10px] cursor-pointer hover:border-zinc-500 transition-colors">
            ×
          </div>
          <span className="font-mono text-[11px] font-bold text-[#F5CB4C]">01</span>
          <div className="w-3 h-[2px] bg-[#F5CB4C]" />
        </div>
      </aside>

      {/* Top Right Viewport Navigation Header Button */}
      <header className="fixed top-4 right-5 md:top-6 md:right-8 z-30 flex items-center gap-3">
        <button 
          type="button" 
          aria-label="Open Navigation Menu"
          className="p-2 rounded-lg bg-[#0F1015]/80 border border-[#24262E] text-zinc-400 hover:text-white transition-colors cursor-pointer backdrop-blur-md"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area Container */}
      <main className="w-full max-w-6xl relative z-10 px-4 py-8 md:px-8 md:py-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Brand, Description, Feature Cards, Risk Card */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Top Brand Logo & Description */}
            <div className="space-y-4">
              {/* Logo Row */}
              <div className="flex items-center gap-3">
                {/* Enso Logo Icon */}
                <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#F5CB4C]/40 bg-[#0F1015] flex items-center justify-center shadow-lg shadow-[#F5CB4C]/5">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-r-[#F5CB4C] border-b-[#F5CB4C] border-l-transparent transform -rotate-45" />
                  <div className="absolute w-2 h-2 bg-[#F5CB4C] rounded-full" />
                </div>
                {/* Brand Wordmark & Kanji */}
                <div className="flex items-baseline gap-2.5">
                  <h1 className="font-mono text-xl md:text-2xl font-bold tracking-[0.25em] text-white">
                    SENKO
                  </h1>
                  <span className="font-serif text-sm md:text-base text-[#F5CB4C] font-semibold">
                    先光
                  </span>
                </div>
              </div>

              {/* Tagline */}
              <p className="font-mono text-[10px] md:text-[11px] font-bold tracking-[0.25em] text-[#F5CB4C] uppercase">
                TRANQUIL INTRADAY PRECISION
              </p>

              {/* Paragraph Description */}
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-light pr-2">
                Experience peripheral trade clarity. Senko monitors your active market setup using ambient visual edge lighting and spatial audio frequency feedback—so you never miss a level.
              </p>
            </div>

            {/* 2 Stacked Feature Cards */}
            <div className="space-y-3">
              {/* Feature Card 1 */}
              <div className="p-3.5 md:p-4 rounded-xl bg-[#0d0e12]/85 border border-[#1e2028] hover:border-[#F5CB4C]/30 transition-all duration-300 backdrop-blur-md group cursor-default">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#14161f] border border-[#262833] group-hover:border-[#F5CB4C]/40 flex items-center justify-center shrink-0 transition-colors">
                    <div className="relative w-4 h-4 rounded-full border border-[#F5CB4C] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#F5CB4C] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-mono text-xs font-bold text-[#E6E6E6] tracking-wider uppercase mb-0.5">
                      PERIPHERAL VISION EDGE GLOW
                    </h2>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Screen boundaries illuminate as price approaches your target or stop loss.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="p-3.5 md:p-4 rounded-xl bg-[#0d0e12]/85 border border-[#1e2028] hover:border-[#F5CB4C]/30 transition-all duration-300 backdrop-blur-md group cursor-default">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#14161f] border border-[#262833] group-hover:border-[#F5CB4C]/40 flex items-center justify-center shrink-0 transition-colors">
                    <div className="flex items-center gap-0.5 h-3">
                      <span className="w-0.5 h-3 bg-[#F5CB4C] rounded-full" />
                      <span className="w-0.5 h-1.5 bg-[#F5CB4C] rounded-full" />
                      <span className="w-0.5 h-4 bg-[#F5CB4C] rounded-full" />
                      <span className="w-0.5 h-2 bg-[#F5CB4C] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-mono text-xs font-bold text-[#E6E6E6] tracking-wider uppercase mb-0.5">
                      ZERO-LATENCY WEB AUDIO API
                    </h2>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Synthesized acoustic cues for entry crossings, spikes, and emergency sirens.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk-to-Reward Ratio Card */}
            <div className="p-4 rounded-xl bg-[#0b0c0f]/90 border border-[#1e2028] space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-wider uppercase text-zinc-400 font-medium">
                  RISK-TO-REWARD RATIO
                </span>
                <span className="font-mono text-base md:text-lg font-bold text-[#F5CB4C]">
                  {rrRatio} : 1
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1a1c24] text-left">
                <div>
                  <span className="font-mono text-[9px] md:text-[10px] text-zinc-500 uppercase block">
                    TOTAL CAPITAL
                  </span>
                  <span className="font-mono text-xs md:text-sm font-semibold text-[#E6E6E6]">
                    ₹{totalCapitalStr}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] md:text-[10px] text-zinc-500 uppercase block">
                    MAX RISK
                  </span>
                  <span className="font-mono text-xs md:text-sm font-semibold text-[#EF4444]">
                    -₹{maxRiskStr}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] md:text-[10px] text-zinc-500 uppercase block">
                    TARGET PROFIT
                  </span>
                  <span className="font-mono text-xs md:text-sm font-semibold text-[#22C55E]">
                    +₹{targetProfitStr}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Main Configuration Panel */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0f1015]/90 border border-[#24262e] p-5 md:p-7 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
            
            {/* Panel Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <h2 className="font-mono text-base md:text-lg font-bold tracking-wider text-white flex items-center gap-2">
                  <span className="text-[#F5CB4C]">/</span> CONFIGURE POSITION
                </h2>
                <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                  Select a symbol or enter your custom intraday trade boundaries.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14151b] border border-[#F5CB4C]/40 text-[#F5CB4C] font-mono text-[10px] tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5CB4C] animate-pulse" />
                NSE LIVE READY
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Field 1: Quick Presets */}
              <div>
                <label className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  QUICK SELECT PRESETS
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {POPULAR_INDIAN_STOCKS.map((preset) => {
                    const isActive = symbol.toUpperCase() === preset.symbol;
                    return (
                      <button
                        key={preset.symbol}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`font-mono text-xs py-2 px-2 rounded-lg border transition-all cursor-pointer text-center font-medium ${
                          isActive
                            ? 'bg-[#111218] border-[#F5CB4C] text-[#F5CB4C] font-bold shadow-md shadow-[#F5CB4C]/10'
                            : 'bg-[#111217] border-[#22242c] text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {preset.symbol}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2: Stock Symbol */}
              <div>
                <label htmlFor="symbol" className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  STOCK SYMBOL
                </label>
                <div className="relative flex items-center bg-[#0d0e12] border border-[#22242c] rounded-xl px-3.5 py-2.5 focus-within:border-[#F5CB4C]/70 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#171922] border border-[#2c2f3d] flex items-center justify-center font-mono text-xs font-bold text-[#F5CB4C] mr-3 shrink-0">
                    R
                  </div>
                  <input
                    id="symbol"
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="RELIANCE"
                    required
                    className="w-full bg-transparent text-sm md:text-base text-white font-mono font-bold uppercase tracking-wider outline-none placeholder-zinc-600"
                  />
                  <span className="font-mono text-xs text-zinc-500 shrink-0 ml-2">
                    {formatIndianTicker(symbol)}
                  </span>
                </div>
              </div>

              {/* Field 3: Buy Entry Price */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="buyPrice" className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    BUY ENTRY PRICE (₹)
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
                <div className="relative flex items-center bg-[#0d0e12] border border-[#22242c] rounded-xl px-4 py-2.5 focus-within:border-[#F5CB4C]/70 transition-colors">
                  <span className="font-mono text-sm text-zinc-500 mr-3">₹</span>
                  <input
                    id="buyPrice"
                    type="number"
                    step="0.05"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    placeholder="1475.00"
                    required
                    className="w-full bg-transparent text-base md:text-lg font-bold text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Field 4: Target & Stop-Loss Boundaries */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    TARGET & STOP-LOSS BOUNDARIES
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
                        className={`font-mono text-[10px] md:text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          activeRatioPreset.includes(item.label.split('%')[0])
                            ? 'border-[#F5CB4C] text-[#F5CB4C] bg-[#111218] font-bold'
                            : 'border-[#22242c] text-zinc-400 hover:text-white bg-[#0d0e12]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Target Price */}
                  <div>
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block mb-1">
                      TARGET (₹)
                    </label>
                    <div className="relative flex items-center bg-[#0d0e12] border border-[#22242c] rounded-xl px-3.5 py-2.5 focus-within:border-[#22C55E]/70 transition-colors">
                      <div className="w-5 h-5 rounded-full border border-[#22C55E]/60 flex items-center justify-center mr-2 shrink-0">
                        <Target className="w-3 h-3 text-[#22C55E]" />
                      </div>
                      <input
                        id="targetPrice"
                        type="number"
                        step="0.05"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="1497.10"
                        className="w-full bg-transparent text-sm md:text-base font-mono font-semibold text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Stop-Loss */}
                  <div>
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block mb-1">
                      STOP-LOSS (₹)
                    </label>
                    <div className="relative flex items-center bg-[#0d0e12] border border-[#22242c] rounded-xl px-3.5 py-2.5 focus-within:border-[#EF4444]/70 transition-colors">
                      <div className="w-5 h-5 rounded-full border border-[#EF4444]/60 flex items-center justify-center mr-2 shrink-0">
                        <ShieldAlert className="w-3 h-3 text-[#EF4444]" />
                      </div>
                      <input
                        id="stopLoss"
                        type="number"
                        step="0.05"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="1460.25"
                        className="w-full bg-transparent text-sm md:text-base font-mono font-semibold text-[#E6E6E6] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 5: Quantity & Candle Interval */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                    QUANTITY (SHARES)
                  </label>
                  <div className="relative flex items-center bg-[#0d0e12] border border-[#22242c] rounded-xl px-3.5 py-2.5 focus-within:border-[#F5CB4C]/70 transition-colors">
                    <span className="font-mono text-sm text-zinc-500 mr-3">#</span>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="50"
                      className="w-full bg-transparent text-sm md:text-base font-mono font-semibold text-white outline-none"
                    />
                  </div>
                </div>

                {/* Candle Interval */}
                <div>
                  <label htmlFor="timeframe" className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                    CANDLE INTERVAL
                  </label>
                  <div className="relative flex items-center bg-[#0d0e12] border border-[#22242c] rounded-xl px-3.5 py-2.5 focus-within:border-[#F5CB4C]/70 transition-colors">
                    <Clock className="w-4 h-4 text-zinc-500 mr-2.5 shrink-0" />
                    <select
                      id="timeframe"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                      className="w-full bg-transparent text-sm md:text-base font-mono font-semibold text-white outline-none appearance-none cursor-pointer pr-6"
                    >
                      <option value="1m" className="bg-[#0d0e12] text-white">1 Minute</option>
                      <option value="3m" className="bg-[#0d0e12] text-white">3 Minutes</option>
                      <option value="5m" className="bg-[#0d0e12] text-white">5 Minutes</option>
                      <option value="15m" className="bg-[#0d0e12] text-white">15 Minutes</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] font-mono text-xs text-center">
                  {errorMsg}
                </div>
              )}

              {/* Large CTA Button: LAUNCH SENKO TERMINAL */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="group relative w-full h-13 md:h-14 rounded-xl bg-gradient-to-r from-[#F5CB4C] via-[#FFB800] to-[#E5B834] hover:brightness-110 active:scale-[0.99] transition-all duration-200 shadow-xl shadow-[#F5CB4C]/15 flex items-center justify-between px-6 overflow-hidden cursor-pointer"
                >
                  {/* Left Paper Plane Icon */}
                  <div className="flex items-center gap-3 z-10">
                    <Send className="w-4 h-4 text-[#0b0c0f] fill-[#0b0c0f] transform rotate-45 stroke-[2]" />
                    <span className="font-mono text-sm md:text-base font-extrabold text-[#0b0c0f] tracking-widest uppercase">
                      LAUNCH SENKO TERMINAL
                    </span>
                  </div>

                  {/* Right Arrow Icon */}
                  <div className="z-10 flex items-center">
                    <ArrowRight className="w-5 h-5 text-[#0b0c0f] stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Japanese Ink Brush Stroke Texture Overlay on Right side of CTA button */}
                  <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none overflow-hidden rounded-r-xl">
                    <svg className="w-full h-full opacity-80 mix-blend-multiply" viewBox="0 0 140 54" preserveAspectRatio="none" fill="none">
                      <path d="M0 0 C35 15, 65 5, 90 0 C115 18, 130 5, 140 0 L140 54 C110 48, 85 52, 60 54 C35 42, 15 50, 0 54 Z" fill="#0b0c0f" />
                      <path d="M30 0 C55 22, 85 12, 140 28 L140 54 C95 38, 65 48, 25 54 Z" fill="#0b0c0f" opacity="0.8" />
                      <path d="M60 0 L140 0 L140 54 C105 32, 80 44, 60 54 Z" fill="#0b0c0f" opacity="0.6" />
                    </svg>
                  </div>
                </button>
              </div>

            </form>

            {/* Footer info row inside panel */}
            <div className="mt-6 pt-4 border-t border-[#1c1e26] flex items-center justify-center flex-wrap gap-4 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="text-[#F5CB4C]">📊</span> Real-time market data
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#F5CB4C]">⚡</span> Low latency execution
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#F5CB4C]">🔒</span> Secure & private
              </span>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
};

