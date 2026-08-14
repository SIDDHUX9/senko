import type { CandlestickBar, IndicatorPoint } from '../types';

/**
 * Calculates Volume-Weighted Average Price (VWAP) for intraday candlestick bars.
 */
export function calculateVWAP(candles: CandlestickBar[]): IndicatorPoint[] {
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;

  return candles.map((bar) => {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    const volume = bar.volume || 1000;
    
    cumulativeTPV += typicalPrice * volume;
    cumulativeVolume += volume;

    const vwapValue = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;
    
    return {
      time: bar.time,
      value: Number(vwapValue.toFixed(2)),
    };
  });
}

/**
 * Calculates Exponential Moving Average (EMA) for given period.
 */
export function calculateEMA(candles: CandlestickBar[], period: number = 20): IndicatorPoint[] {
  if (candles.length === 0) return [];

  const k = 2 / (period + 1);
  const result: IndicatorPoint[] = [];

  let previousEMA = candles[0].close;

  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close;
    if (i < period - 1) {
      // SMA for initial seed period
      const sum = candles.slice(0, i + 1).reduce((acc, c) => acc + c.close, 0);
      previousEMA = sum / (i + 1);
    } else {
      previousEMA = close * k + previousEMA * (1 - k);
    }

    result.push({
      time: candles[i].time,
      value: Number(previousEMA.toFixed(2)),
    });
  }

  return result;
}
