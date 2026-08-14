export type Timeframe = '1m' | '3m' | '5m' | '15m';
export type ChartType = 'candlestick' | 'line';
export type GlowLevel = 'subtle' | 'standard' | 'intense';

export interface TradeSetup {
  symbol: string;
  buyPrice: number;
  quantity?: number;
  targetPrice?: number;
  stopLoss?: number;
  timeframe: Timeframe;
}

export interface PriceTick {
  price: number;
  timestamp: number; // ms
}

export interface CandlestickBar {
  time: number; // unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface VolumeBar {
  time: number;
  value: number;
  color?: string;
}

export interface IndicatorPoint {
  time: number;
  value: number;
}

export interface EdgeState {
  baseColor: 'green' | 'red' | 'neutral';
  intensity: 'subtle' | 'moderate' | 'strong';
  momentumPulse: 'none' | 'green' | 'red' | 'flash';
  positionPct: number;
  velocityPct: number;
  isTargetHit: boolean;
  isStopLossHit: boolean;
}

export interface ChartOverlayConfig {
  chartType: ChartType;
  glowLevel: GlowLevel;
  showVWAP: boolean;
  showEMA: boolean;
  emaPeriod: number;
  audioEnabled: boolean;
}

export interface IndianStockPreset {
  symbol: string;
  name: string;
  sector: string;
  approxPrice: number;
}
