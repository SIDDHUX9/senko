import React from 'react';
import type { TradeSetup, EdgeState, ChartOverlayConfig } from '../types';
import { RefreshCcw, Zap, SlidersHorizontal, Radio, CandlestickChart, LineChart, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';

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
}) => {
  const priceDiff = currentPrice - setup.buyPrice;
  const positionPct = setup.buyPrice > 0 ? (priceDiff / setup.buyPrice) * 100 : 0;
  const totalPnL = setup.quantity ? priceDiff * setup.quantity : null;

  return (
    <header className="w-full h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Ticker & Live Feed Indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onExitSession}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Exit to Setup"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-base sm:text-lg tracking-wider text-white">
            {setup.symbol}
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {setup.timeframe}
          </span>
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

      {/* Middle: Current Price, Change, & Total P&L */}
      <div className="flex items-center gap-3 sm:gap-6 font-mono-numbers">
        {/* Current Price & Change */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 text-right sm:text-left">
          <span className="text-base sm:text-xl font-bold text-white">
            ₹{currentPrice.toFixed(2)}
          </span>
          <span
            className={`text-xs font-semibold ${
              priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
          </span>
        </div>

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
