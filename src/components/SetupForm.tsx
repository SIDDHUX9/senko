import React, { useState } from 'react';
import type { TradeSetup, Timeframe, IndianStockPreset } from '../types';
import { POPULAR_INDIAN_STOCKS, formatIndianTicker } from '../utils/indianStocks';
import { fetchRealMarketData } from '../services/marketDataApi';
import { TrendingUp, RefreshCw, Zap, ShieldCheck, IndianRupee, Clock, Hash, Target, ShieldAlert } from 'lucide-react';

interface SetupFormProps {
  onStartTrading: (setup: TradeSetup) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onStartTrading }) => {
  const [symbol, setSymbol] = useState<string>('RELIANCE');
  const [buyPrice, setBuyPrice] = useState<string>('1475.00');
  const [quantity, setQuantity] = useState<string>('50');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [isFetchingPrice, setIsFetchingPrice] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (preset: IndianStockPreset) => {
    setSymbol(preset.symbol);
    setBuyPrice(preset.approxPrice.toFixed(2));
    // Pre-fill target (+1.5%) and stoploss (-1.0%)
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
      setErrorMsg('Please enter an Indian Stock Symbol (e.g. RELIANCE)');
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg('Please enter a valid positive Buy Price');
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#090d16] text-slate-100 overflow-y-auto">
      {/* Background Decorative Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 relative z-10 border border-slate-800 shadow-2xl space-y-5">
        {/* Cockpit Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Dedicated Cockpit Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Intraday Edge</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            One Stock • Real-Time Audio Alerts & Edge Glow
          </p>
        </div>

        {/* Popular Indian Stock Presets */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Indian NSE Presets
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
            {POPULAR_INDIAN_STOCKS.slice(0, 8).map((preset) => (
              <button
                key={preset.symbol}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  symbol.toUpperCase() === preset.symbol
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
            <label htmlFor="symbol" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Stock Symbol (NSE / India)
            </label>
            <div className="relative">
              <input
                id="symbol"
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. RELIANCE, TATAMOTORS, INFY"
                required
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-600 outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 pointer-events-none">
                {formatIndianTicker(symbol)}
              </span>
            </div>
          </div>

          {/* Buy Price & Live Fetch */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="buyPrice" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Your Buy Price (₹)
              </label>
              <button
                type="button"
                onClick={handleFetchCurrentMarketPrice}
                disabled={isFetchingPrice}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingPrice ? 'animate-spin' : ''}`} />
                <span>{isFetchingPrice ? 'Fetching...' : 'Fetch Live Market'}</span>
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
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
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-4 py-3 text-sm text-white font-mono outline-none transition-all"
              />
            </div>
          </div>

          {/* Target Price & Stop-Loss Row */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Target & Stop-Loss Levels
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePresetTargetStopLoss(1.5, 1.0)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  1.5% / 1.0%
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetTargetStopLoss(2.5, 1.5)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  2.5% / 1.5%
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
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white font-mono outline-none transition-all"
                />
              </div>

              {/* Stop-Loss */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <input
                  id="stopLoss"
                  type="number"
                  step="0.05"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Stop-Loss ₹"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white font-mono outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quantity & Timeframe Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Quantity <span className="text-slate-500 font-normal">(Optional)</span>
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
                  placeholder="Shares"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white font-mono outline-none transition-all"
                />
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label htmlFor="timeframe" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Timeframe
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <select
                  id="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white font-mono outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="1m">1m Candle</option>
                  <option value="3m">3m Candle</option>
                  <option value="5m">5m Candle</option>
                  <option value="15m">15m Candle</option>
                </select>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            <span>START TRADING COCKPIT</span>
          </button>
        </form>

        {/* Feature Badges Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Audio Tones Active
          </span>
          <span>Zero-Latency Sound Engine</span>
        </div>
      </div>
    </div>
  );
};
