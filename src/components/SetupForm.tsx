import React, { useState } from 'react';
import type { TradeSetup, Timeframe, IndianStockPreset } from '../types';
import { POPULAR_INDIAN_STOCKS, formatIndianTicker } from '../utils/indianStocks';
import { fetchRealMarketData } from '../services/marketDataApi';
import { RefreshCw, IndianRupee, Clock, Hash, Target, ShieldAlert, Compass, Volume2, ArrowRight } from 'lucide-react';

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
  const [isFetchingPrice, setIsFetchingPrice] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (preset: IndianStockPreset) => {
    setSymbol(preset.symbol);
    setBuyPrice(preset.approxPrice.toFixed(2));
    setTargetPrice((preset.approxPrice * 1.015).toFixed(2));
    setStopLoss((preset.approxPrice * 0.990).toFixed(2));
    setErrorMsg(null);
  };

  const handlePresetTargetStopLoss = (targetPct: number, slPct: number) => {
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

  // Calculations for live risk metrics
  const pPrice = parseFloat(buyPrice) || 0;
  const pTarget = parseFloat(targetPrice) || 0;
  const pSL = parseFloat(stopLoss) || 0;
  const pQty = parseInt(quantity, 10) || 1;

  const rewardPerShare = pTarget > pPrice ? pTarget - pPrice : 0;
  const riskPerShare = pPrice > pSL ? pPrice - pSL : 0;
  const rrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '0.00';
  const totalCapital = (pPrice * pQty).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const maxRiskCapital = (riskPerShare * pQty).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const targetProfitCapital = (rewardPerShare * pQty).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  return (
    <div className="relative min-h-dvh w-full bg-[#070a0f] text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto font-sans">
      {/* Peaceful Japanese Ink Landscape Artwork Background */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-opacity opacity-25 mix-blend-luminosity filter blur-[1px] transition-opacity duration-1000"
        style={{ backgroundImage: `url('/senko_zen_hero.jpg')` }}
      />

      {/* Subtle Radial Vignette Gradient & Ambient Golden Aura */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-[#070a0f] via-[#070a0f]/80 to-[#070a0f]/60" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch my-auto py-4">
        
        {/* Position Configuration Form (Upfront on Mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-7 glass-zen rounded-3xl p-5 sm:p-8 border border-slate-800 shadow-2xl relative">
          
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-serif tracking-wide">Configure Position</h2>
              <p className="text-xs text-slate-400">Select a symbol or enter your custom intraday trade boundaries.</p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 shrink-0">
              NSE LIVE READY
            </span>
          </div>

          {/* Popular Stock Presets - Touch Swipeable Horizontal Carousel */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Quick Select Presets (Swipe)
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 px-0.5 no-scrollbar touch-pan-x snap-x scroll-smooth">
              {POPULAR_INDIAN_STOCKS.map((preset) => (
                <button
                  key={preset.symbol}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`shrink-0 snap-start text-xs min-h-[38px] px-3.5 py-2 rounded-xl border transition-all cursor-pointer font-mono flex items-center justify-center ${
                    symbol.toUpperCase() === preset.symbol
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 active:bg-slate-800'
                  }`}
                >
                  {preset.symbol}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stock Symbol */}
            <div>
              <label htmlFor="symbol" className="text-xs font-medium text-slate-300 block mb-1">
                Stock Symbol
              </label>
              <div className="relative">
                <input
                  id="symbol"
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. RELIANCE, TATAMOTORS, INFY"
                  required
                  className="w-full bg-[#05080e] border border-slate-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 rounded-2xl px-4 py-3.5 text-base sm:text-sm text-white font-mono placeholder-slate-600 outline-none transition-all min-h-[46px]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 pointer-events-none">
                  {formatIndianTicker(symbol)}
                </span>
              </div>
            </div>

            {/* Entry Buy Price */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="buyPrice" className="text-xs font-medium text-slate-300">
                  Buy Entry Price (₹)
                </label>
                <button
                  type="button"
                  onClick={handleFetchCurrentMarketPrice}
                  disabled={isFetchingPrice}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 cursor-pointer font-medium min-h-[36px] px-2 py-1 rounded-lg active:bg-amber-500/10"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingPrice ? 'animate-spin' : ''}`} />
                  <span>{isFetchingPrice ? 'Fetching Live...' : 'Fetch Market Price'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  id="buyPrice"
                  type="number"
                  step="0.05"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="1475.00"
                  required
                  className="w-full bg-[#05080e] border border-slate-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 rounded-2xl pl-10 pr-4 py-3.5 text-base sm:text-sm text-white font-mono outline-none transition-all min-h-[46px]"
                />
              </div>
            </div>

            {/* Target Price & Stop-Loss */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Target & Stop-Loss Boundaries
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePresetTargetStopLoss(1.5, 1.0)}
                    className="text-[11px] px-2.5 py-1.5 min-h-[34px] rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 active:bg-slate-800 transition-colors cursor-pointer"
                  >
                    1.5% / 1.0%
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetTargetStopLoss(2.5, 1.5)}
                    className="text-[11px] px-2.5 py-1.5 min-h-[34px] rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 active:bg-slate-800 transition-colors cursor-pointer"
                  >
                    2.5% / 1.5%
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetTargetStopLoss(3.5, 2.0)}
                    className="text-[11px] px-2.5 py-1.5 min-h-[34px] rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 active:bg-slate-800 transition-colors cursor-pointer"
                  >
                    3.5% / 2.0%
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Target Price */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="targetPrice"
                    type="number"
                    step="0.05"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="Target ₹"
                    className="w-full bg-[#05080e] border border-slate-800 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 rounded-xl pl-8 pr-3 py-3 text-base sm:text-xs text-white font-mono outline-none transition-all min-h-[44px]"
                  />
                </div>

                {/* Stop-Loss */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="stopLoss"
                    type="number"
                    step="0.05"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="Stop Loss ₹"
                    className="w-full bg-[#05080e] border border-slate-800 focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/50 rounded-xl pl-8 pr-3 py-3 text-base sm:text-xs text-white font-mono outline-none transition-all min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Timeframe */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="quantity" className="text-xs font-medium text-slate-300 block mb-1">
                  Quantity (Shares)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Hash className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="50"
                    className="w-full bg-[#05080e] border border-slate-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-8 pr-3 py-3 text-base sm:text-xs text-white font-mono outline-none transition-all min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="timeframe" className="text-xs font-medium text-slate-300 block mb-1">
                  Candle Interval
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <select
                    id="timeframe"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                    className="w-full bg-[#05080e] border border-slate-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-8 pr-3 py-3 text-base sm:text-xs text-white font-mono outline-none transition-all appearance-none cursor-pointer min-h-[44px]"
                  >
                    <option value="1m">1 Minute</option>
                    <option value="3m">3 Minutes</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                  </select>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* Launch Cockpit Button */}
            <button
              type="submit"
              className="w-full mt-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-serif uppercase min-h-[50px]"
            >
              <span>Launch Senko Terminal</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

        </div>

        {/* Brand Hero & Live Analytics */}
        <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col justify-between glass-zen rounded-3xl p-5 sm:p-8 border border-amber-500/15 shadow-2xl relative overflow-hidden">
          {/* Subtle Golden Beam Overlay */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Logo Mark & Brand Title */}
            <div className="flex items-center gap-3.5 mb-5 sm:mb-6">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border border-amber-500/30 p-0.5 shadow-lg shadow-amber-500/10 bg-slate-950 shrink-0">
                <img 
                  src="/senko_enso_mark.jpg" 
                  alt="SENKO Mark" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold font-serif tracking-wider text-white flex items-center gap-2">
                  SENKO
                </h1>
                <p className="text-[10px] sm:text-[11px] font-mono tracking-widest text-amber-400/80 uppercase">
                  Tranquil Intraday Precision
                </p>
              </div>
            </div>

            {/* Platform Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 sm:mb-6 font-light">
              Experience peripheral trade clarity. Senko monitors your active market setup using ambient visual edge lighting and spatial audio frequency feedback—so you never miss a level.
            </p>

            {/* Key Zen Capabilities */}
            <div className="space-y-3 mb-5 sm:mb-6">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Peripheral Vision Edge Glow</h4>
                  <p className="text-[11px] text-slate-400">Screen boundaries illuminate as price approaches your target or stop loss.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Zero-Latency Web Audio API</h4>
                  <p className="text-[11px] text-slate-400">Synthesized acoustic cues for entry crossings, spikes, and emergency sirens.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Position Risk Analytics Box */}
          <div className="p-4 rounded-2xl bg-[#090e17] border border-amber-500/20 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Risk-to-Reward Ratio</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                parseFloat(rrRatio) >= 1.5 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {rrRatio} : 1
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Total Capital</span>
                <span className="font-mono text-slate-200 font-semibold">₹{totalCapital}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Max Risk</span>
                <span className="font-mono text-rose-400 font-semibold">-₹{maxRiskCapital}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Target Profit</span>
                <span className="font-mono text-emerald-400 font-semibold">+₹{targetProfitCapital}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

