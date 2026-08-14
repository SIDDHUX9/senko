import { useState, useEffect, useCallback, useRef } from 'react';
import type { TradeSetup, CandlestickBar, IndicatorPoint } from '../types';
import { fetchRealMarketData, fetchTradingViewQuote, generateSyntheticIntraday } from '../services/marketDataApi';
import { calculateVWAP, calculateEMA } from '../utils/technicalIndicators';

export interface UsePriceFeedResult {
  loading: boolean;
  isLiveFeed: boolean;
  currentPrice: number;
  previousClose: number;
  candles: CandlestickBar[];
  vwapSeries: IndicatorPoint[];
  emaSeries: IndicatorPoint[];
  priceChange: number;
  priceChangePct: number;
  lastTickTimestamp: number;
  injectSpike: (magnitudePct?: number) => void;
  injectDrop: (magnitudePct?: number) => void;
  injectShock: () => void;
  refetchFeed: () => void;
}

export function useRealtimePriceFeed(setup: TradeSetup): UsePriceFeedResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(false);
  const [currentPrice, setCurrentPrice] = useState<number>(setup.buyPrice);
  const [previousClose, setPreviousClose] = useState<number>(setup.buyPrice);
  const [candles, setCandles] = useState<CandlestickBar[]>([]);
  const [vwapSeries, setVwapSeries] = useState<IndicatorPoint[]>([]);
  const [emaSeries, setEmaSeries] = useState<IndicatorPoint[]>([]);
  const [lastTickTimestamp, setLastTickTimestamp] = useState<number>(Date.now());

  const priceRef = useRef<number>(setup.buyPrice);
  priceRef.current = currentPrice;

  // Determine timeframe seconds step
  const getStepSeconds = useCallback(() => {
    switch (setup.timeframe) {
      case '1m': return 60;
      case '3m': return 180;
      case '5m': return 300;
      case '15m': return 900;
      default: return 60;
    }
  }, [setup.timeframe]);

  // Recalculate indicators
  const updateIndicators = useCallback((bars: CandlestickBar[]) => {
    if (bars.length === 0) return;
    const vwap = calculateVWAP(bars);
    const ema = calculateEMA(bars, 20);
    setVwapSeries(vwap);
    setEmaSeries(ema);
  }, []);

  // Initial load of market data
  const loadMarketData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRealMarketData(setup.symbol, setup.timeframe, setup.buyPrice);
      setIsLiveFeed(data.isLive);
      setPreviousClose(data.previousClose);
      setCandles(data.candles);
      setCurrentPrice(data.currentPrice);
      setLastTickTimestamp(Date.now());
      updateIndicators(data.candles);
    } catch (err) {
      console.error('Failed loading market data', err);
      const fallbackCandles = generateSyntheticIntraday(setup.buyPrice, setup.timeframe, 60);
      setCandles(fallbackCandles);
      setCurrentPrice(fallbackCandles[fallbackCandles.length - 1].close);
      setPreviousClose(setup.buyPrice);
      updateIndicators(fallbackCandles);
    } finally {
      setLoading(false);
    }
  }, [setup.symbol, setup.timeframe, setup.buyPrice, updateIndicators]);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  // Update latest bar or append new bar with new tick price
  const pushTick = useCallback((newPrice: number) => {
    const roundedPrice = Number(newPrice.toFixed(2));
    setCurrentPrice(roundedPrice);
    setLastTickTimestamp(Date.now());

    setCandles((prevBars) => {
      if (prevBars.length === 0) return prevBars;

      const updated = [...prevBars];
      const lastIndex = updated.length - 1;
      const lastBar = { ...updated[lastIndex] };
      const nowSec = Math.floor(Date.now() / 1000);
      const stepSec = getStepSeconds();

      if (nowSec >= lastBar.time + stepSec) {
        const newBar: CandlestickBar = {
          time: lastBar.time + stepSec,
          open: lastBar.close,
          high: Math.max(lastBar.close, roundedPrice),
          low: Math.min(lastBar.close, roundedPrice),
          close: roundedPrice,
          volume: Math.floor(Math.random() * 5000 + 1000),
        };
        updated.push(newBar);
      } else {
        lastBar.high = Math.max(lastBar.high, roundedPrice);
        lastBar.low = Math.min(lastBar.low, roundedPrice);
        lastBar.close = roundedPrice;
        lastBar.volume = (lastBar.volume || 1000) + Math.floor(Math.random() * 200 + 50);
        updated[lastIndex] = lastBar;
      }

      updateIndicators(updated);
      return updated;
    });
  }, [getStepSeconds, updateIndicators]);

  // Real-Time Live Quote Polling from TradingView every 1.5s
  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(async () => {
      try {
        const tvQuote = await fetchTradingViewQuote(setup.symbol);
        if (tvQuote && tvQuote.price > 0) {
          setIsLiveFeed(true);
          pushTick(tvQuote.price);
          return;
        }
      } catch {
        // Fallback micro random walk
      }

      // Micro random walk tick fallback during off-market hours
      const cur = priceRef.current;
      const noise = (Math.random() - 0.495) * (cur * 0.0015);
      const nextPrice = Math.max(1, cur + noise);
      pushTick(nextPrice);
    }, 1500);

    return () => clearInterval(intervalId);
  }, [loading, setup.symbol, pushTick]);

  // Manual Trigger: Inject Spike (+2.5%)
  const injectSpike = useCallback((magnitudePct: number = 2.5) => {
    const cur = priceRef.current;
    const targetPrice = cur * (1 + magnitudePct / 100);
    pushTick(targetPrice);
  }, [pushTick]);

  // Manual Trigger: Inject Drop (-2.5%)
  const injectDrop = useCallback((magnitudePct: number = 2.5) => {
    const cur = priceRef.current;
    const targetPrice = cur * (1 - magnitudePct / 100);
    pushTick(targetPrice);
  }, [pushTick]);

  // Manual Trigger: Inject Shock Flash (+4.5% shock)
  const injectShock = useCallback(() => {
    const cur = priceRef.current;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const targetPrice = cur * (1 + (direction * 4.5) / 100);
    pushTick(targetPrice);
  }, [pushTick]);

  const priceChange = Number((currentPrice - previousClose).toFixed(2));
  const priceChangePct = previousClose > 0 ? Number(((priceChange / previousClose) * 100).toFixed(2)) : 0;

  return {
    loading,
    isLiveFeed,
    currentPrice,
    previousClose,
    candles,
    vwapSeries,
    emaSeries,
    priceChange,
    priceChangePct,
    lastTickTimestamp,
    injectSpike,
    injectDrop,
    injectShock,
    refetchFeed: loadMarketData,
  };
}
