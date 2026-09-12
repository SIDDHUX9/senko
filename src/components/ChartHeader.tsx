import React from 'react';
import type { TradeSetup, EdgeState, ChartOverlayConfig, Timeframe } from '../types';
import { RefreshCcw, Zap, SlidersHorizontal, Radio, CandlestickChart, LineChart, Maximize, Minimize, Volume2, VolumeX, Shield, ShieldCheck } from 'lucide-react';

interface ChartHeaderProps {
  setup: TradeSetup;
  currentPrice: number;
  priceChange: number;
  priceChangePct: number;
  isLiveFeed: boolean;
  edgeState: EdgeState;
  overlayConfig: ChartOverlayConfig;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleAudio: () => void;
  onToggleChartType: () => void;
  onToggleSettings: () => void;
  onToggleDevMenu: () => void;
  onExitSession: () => void;
  onChangeTimeframe?: (tf: Timeframe) => void;
  onMoveSLToCost?: () => void;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  setup,
  currentPrice,
  priceChange,
  priceChangePct,
  isLiveFeed,
  edgeState,
  overlayConfig,
  isFullscreen,
  onToggleFullscreen,
  onToggleAudio,
  onToggleChartType,
  onToggleSettings,
  onToggleDevMenu,
  onExitSession,
  onChangeTimeframe,
  onMoveSLToCost,
}) => {
  const priceDiff = currentPrice - setup.buyPrice;
  const positionPct = setup.buyPrice > 0 ? (priceDiff / setup.buyPrice) * 100 : 0;
  const totalPnL = setup.quantity ? priceDiff * setup.quantity : null;
  const isSlAtCost = !!setup.stopLoss && Math.abs(setup.stopLoss - setup.buyPrice) < 0.01;

  return (
    <header className="w-full h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Ticker, Interactive Timeframe & Live Feed Indicator */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={onExitSession}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Exit to Setup"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>

        {/* SENKO Enso Mark */}
        <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-800">
          <img src="/senko_enso_mark.jpg" alt="SENKO" className="w-6 h-6 rounded-md object-cover border border-amber-500/30" />
          <span className="font-serif font-bold text-xs tracking-widest text-amber-300 hidden md:inline">SENKO</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-bold text-sm sm:text-lg tracking-wider text-white">
            {setup.symbol}
          </span>

          {/* Interactive In-Cockpit Timeframe Switcher */}
          <div className="flex items-center p-0.5 bg-slate-900/90 border border-slate-800 rounded-lg">
            {(['1m', '3m', '5m', '15m'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onChangeTimeframe?.(tf)}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded transition-all cursor-pointer ${
                  setup.timeframe === tf
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Switch candle timeframe to ${tf}`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div
            className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              isLiveFeed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
            title={isLiveFeed ? 'Live Market Data Feed' : 'Fallback Market Stream'}
          >
            <Radio className={`w-3 h-3 ${isLiveFeed ? 'animate-pulse text-emerald-400' : ''}`} />
            <span className="hidden xs:inline">{isLiveFeed ? 'LIVE' : 'STREAM'}</span>
          </div>
        </div>
      </div>

      {/* Middle: Current Price, Change, Breakeven & Total P&L */}
      <div className="flex items-center gap-2 sm:gap-4 font-mono-numbers">
        {/* Current Price & Change */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 text-right sm:text-left">
          <span className="text-sm sm:text-xl font-bold text-white">
            ₹{currentPrice.toFixed(2)}
          </span>
          <span
            className={`text-[11px] sm:text-xs font-semibold ${
              priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
          </span>
        </div>

        {/* Dynamic Move SL to Cost (Breakeven) / Protected Badge */}
        {setup.buyPrice > 0 && (
          <div className="hidden md:flex items-center">
            {isSlAtCost ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-sm"
                title="Stop-Loss is locked at Buy Price (Risk = ₹0.00)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SL AT COST</span>
              </div>
            ) : currentPrice > setup.buyPrice && onMoveSLToCost ? (
              <button
                type="button"
                onClick={onMoveSLToCost}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 text-xs font-mono font-bold transition-all animate-pulse hover:animate-none cursor-pointer shadow-md shadow-amber-500/10"
                title={`Lock in ₹0 risk by moving Stop Loss to Entry Price (₹${setup.buyPrice.toFixed(2)})`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>MOVE SL TO COST</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Total P&L (if quantity supplied) */}
        {setup.quantity && totalPnL !== null && (
          <div className="hidden sm:flex flex-col items-end pl-3 border-l border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-sans">
              Total P&L ({setup.quantity} Qty)
            </span>
            <span
              className={`text-sm font-bold ${
                totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {totalPnL >= 0 ? '+₹' : '-₹'}{Math.abs(totalPnL).toFixed(2)} ({positionPct >= 0 ? '+' : ''}{positionPct.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* Right: Quick Controls & Fullscreen Action */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Audio Toggle Button */}
        <button
          onClick={onToggleAudio}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            overlayConfig.audioEnabled
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={overlayConfig.audioEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
        >
          {overlayConfig.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isFullscreen
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Native Mobile Fullscreen Cockpit'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Quick Chart Type Toggle (Candles vs Line) */}
        <button
          onClick={onToggleChartType}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            overlayConfig.chartType === 'line'
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={`Switch to ${overlayConfig.chartType === 'candlestick' ? 'Line Graph' : 'Candlestick Chart'}`}
        >
          {overlayConfig.chartType === 'candlestick' ? (
            <CandlestickChart className="w-4 h-4" />
          ) : (
            <LineChart className="w-4 h-4" />
          )}
        </button>

        {/* Dev Lab Trigger */}
        <button
          onClick={onToggleDevMenu}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            edgeState.momentumPulse !== 'none'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Dev Simulation Menu"
        >
          <Zap className="w-4 h-4" />
        </button>

        {/* Settings Modal Toggle */}
        <button
          onClick={onToggleSettings}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Cockpit Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
