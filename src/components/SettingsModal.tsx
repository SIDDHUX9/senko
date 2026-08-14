import React from 'react';
import type { ChartOverlayConfig, GlowLevel } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { SlidersHorizontal, X, Eye, EyeOff, CandlestickChart, LineChart, Sparkles, Volume2, VolumeX, AlertTriangle, Target, TrendingDown, TrendingUp } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChartOverlayConfig;
  onChangeConfig: (newConfig: ChartOverlayConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-5 border border-slate-800 text-white shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Cockpit Settings</h3>
              <p className="text-[11px] text-slate-400">Display, Audio Sirens & Edge Glow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Chart Style Selector */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Chart Display Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChangeConfig({ ...config, chartType: 'candlestick' })}
              className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                config.chartType === 'candlestick'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <CandlestickChart className="w-4 h-4 text-emerald-400" />
              <span>Candlesticks</span>
            </button>

            <button
              onClick={() => onChangeConfig({ ...config, chartType: 'line' })}
              className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                config.chartType === 'line'
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <LineChart className="w-4 h-4 text-sky-400" />
              <span>Line Graph</span>
            </button>
          </div>
        </div>

        {/* Section 2: Audio Alerts & Sirens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                {config.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-semibold text-xs text-white block">Audio Alerts & Sirens</span>
                <span className="text-[10px] text-slate-400">Level Sirens & Warning Beeps</span>
              </div>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, audioEnabled: !config.audioEnabled })}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                config.audioEnabled
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-500'
              }`}
            >
              {config.audioEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Sound Preview Test Buttons */}
          {config.audioEnabled && (
            <div className="pt-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Sound Test Previews
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => audioEngine.playStopLoss(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Siren (StopLoss)</span>
                </button>

                <button
                  onClick={() => audioEngine.playTargetHit(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Target className="w-3 h-3" />
                  <span>Target Beep</span>
                </button>

                <button
                  onClick={() => audioEngine.playCrossDown(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <TrendingDown className="w-3 h-3" />
                  <span>Below Entry Beep</span>
                </button>

                <button
                  onClick={() => audioEngine.playCrossUp(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Above Entry Beep</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Edge Glow Intensity */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Edge Glow Intensity</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['subtle', 'standard', 'intense'] as GlowLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => onChangeConfig({ ...config, glowLevel: level })}
                className={`py-2 px-2 rounded-xl border text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                  config.glowLevel === level
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                {level === 'subtle' ? '🌙 Subtle' : level === 'standard' ? '⚡ Standard' : '🔥 Intense'}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Technical Indicators */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Technical Overlays
          </label>

          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
              <span className="font-semibold text-xs text-white">VWAP Line</span>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, showVWAP: !config.showVWAP })}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                config.showVWAP
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-500'
              }`}
            >
              {config.showVWAP ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="font-semibold text-xs text-white">EMA Line ({config.emaPeriod})</span>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, showEMA: !config.showEMA })}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                config.showEMA
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-500'
              }`}
            >
              {config.showEMA ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          Save & Exit
        </button>
      </div>
    </div>
  );
};
