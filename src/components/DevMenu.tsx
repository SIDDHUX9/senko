import React from 'react';
import type { EdgeState } from '../types';
import { Zap, TrendingUp, TrendingDown, Flame, RefreshCw, X, Radio } from 'lucide-react';

interface DevMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLiveFeed: boolean;
  edgeState: EdgeState;
  onInjectSpike: () => void;
  onInjectDrop: () => void;
  onInjectShock: () => void;
  onRefetchFeed: () => void;
}

export const DevMenu: React.FC<DevMenuProps> = ({
  isOpen,
  onClose,
  isLiveFeed,
  edgeState,
  onInjectSpike,
  onInjectDrop,
  onInjectShock,
  onRefetchFeed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-5 border border-slate-800 text-white shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Edge Simulation Lab</h3>
              <p className="text-[11px] text-slate-400">Test Edge System Signal B Pulses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Feed Status */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${isLiveFeed ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            Data Source
          </span>
          <span className={`font-semibold ${isLiveFeed ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isLiveFeed ? 'NSE Live Feed' : 'Synthetic Stream'}
          </span>
        </div>

        {/* Edge Glow Diagnostics */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Signal A Base:</span>
            <span className="font-semibold uppercase text-slate-200">
              {edgeState.baseColor} ({edgeState.intensity})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Position Diff:</span>
            <span className={edgeState.positionPct >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              {edgeState.positionPct >= 0 ? '+' : ''}{edgeState.positionPct}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Signal B Pulse:</span>
            <span className="font-semibold text-amber-400 uppercase">
              {edgeState.momentumPulse}
            </span>
          </div>
        </div>

        {/* Triggers */}
        <div className="mt-5 space-y-2.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Inject Artificial Ticks
          </label>

          <button
            onClick={() => {
              onInjectSpike();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Simulate Spike (+2.5%)
            </span>
            <span className="text-[10px] font-mono opacity-80">Green Pulse</span>
          </button>

          <button
            onClick={() => {
              onInjectDrop();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Simulate Drop (-2.5%)
            </span>
            <span className="text-[10px] font-mono opacity-80">Red Pulse</span>
          </button>

          <button
            onClick={() => {
              onInjectShock();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Simulate Shock (+4.5%)
            </span>
            <span className="text-[10px] font-mono opacity-80">White Flash</span>
          </button>

          <button
            onClick={() => {
              onRefetchFeed();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refetch Live Feed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
