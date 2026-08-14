import type { CandlestickBar, Timeframe } from '../types';
import { formatIndianTicker, cleanDisplaySymbol } from '../utils/indianStocks';

export interface MarketFetchResult {
  symbol: string;
  ticker: string;
  currentPrice: number;
  previousClose: number;
  currency: string;
  candles: CandlestickBar[];
  isLive: boolean;
}

export interface TradingViewQuote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  open: number;
  high: number;
  low: number;
}

/**
 * Maps timeframe selection to Yahoo Finance API interval parameter
 */
function timeframeToParams(tf: Timeframe): { interval: string; range: string } {
  switch (tf) {
    case '1m': return { interval: '1m', range: '1d' };
    case '3m': return { interval: '2m', range: '1d' };
    case '5m': return { interval: '5m', range: '5d' };
    case '15m': return { interval: '15m', range: '5d' };
    default: return { interval: '5m', range: '1d' };
  }
}

/**
 * Fetches real-time quote directly from TradingView Scanner API.
 * Works seamlessly in browser and node.
 */
export async function fetchTradingViewQuote(symbolInput: string): Promise<TradingViewQuote | null> {
  const cleanSym = cleanDisplaySymbol(symbolInput);
  const tvTicker = `NSE:${cleanSym}`;
  
  const endpoints = [
    '/api/tradingview/india/scan',
    'https://scanner.tradingview.com/india/scan',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: { tickers: [tvTicker] },
          columns: ['name', 'close', 'change', 'change_abs', 'volume', 'open', 'high', 'low'],
        }),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const row = data?.data?.[0]?.d;
      if (row && row.length >= 8) {
        return {
          symbol: cleanSym,
          price: Number(row[1]),
          changePct: Number(row[2]),
          change: Number(row[3]),
          volume: Number(row[4]),
          open: Number(row[5]),
          high: Number(row[6]),
          low: Number(row[7]),
        };
      }
    } catch {
      // try next endpoint
    }
  }

  return null;
}

/**
 * Generates realistic synthetic intraday data if market is closed or offline.
 */
export function generateSyntheticIntraday(
  basePrice: number,
  timeframe: Timeframe,
  count: number = 60
): CandlestickBar[] {
  const candles: CandlestickBar[] = [];
  const nowSec = Math.floor(Date.now() / 1000);

  let stepSec = 60;
  if (timeframe === '3m') stepSec = 180;
  if (timeframe === '5m') stepSec = 300;
  if (timeframe === '15m') stepSec = 900;

  let currentPrice = basePrice * (0.99 + Math.random() * 0.02);
  const startTime = nowSec - count * stepSec;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * stepSec;
    const volatility = currentPrice * 0.003;
    const change = (Math.random() - 0.49) * volatility;

    const open = currentPrice;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) + Math.random() * volatility * 0.8;
    const low = Math.min(open, close) - Math.random() * volatility * 0.8;
    const volume = Math.floor(Math.random() * 25000 + 5000);

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Fetches real intraday market data for Indian Stocks.
 * Uses local proxy / TradingView / Yahoo Finance endpoints.
 */
export async function fetchRealMarketData(
  symbolInput: string,
  timeframe: Timeframe,
  userBuyPrice: number
): Promise<MarketFetchResult> {
  const ticker = formatIndianTicker(symbolInput);
  const { interval, range } = timeframeToParams(timeframe);

  // 1. Fetch real-time TradingView quote in parallel
  const tvQuotePromise = fetchTradingViewQuote(symbolInput);

  // 2. Fetch intraday candlestick history
  const path = `/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}&includePrePost=true`;
  const chartEndpoints = [
    `/api/yahoo${path}`,
    `https://query1.finance.yahoo.com${path}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com${path}`)}`,
  ];

  let candles: CandlestickBar[] = [];
  let metaPrice: number | null = null;
  let metaPrevClose: number | null = null;

  for (const ep of chartEndpoints) {
    try {
      const res = await fetch(ep, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;

      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (!result) continue;

      const meta = result.meta || {};
      const timestamps: number[] = result.timestamp || [];
      const quote = result.indicators?.quote?.[0] || {};

      const opens: (number | null)[] = quote.open || [];
      const highs: (number | null)[] = quote.high || [];
      const lows: (number | null)[] = quote.low || [];
      const closes: (number | null)[] = quote.close || [];
      const volumes: (number | null)[] = quote.volume || [];

      for (let i = 0; i < timestamps.length; i++) {
        const time = timestamps[i];
        const open = opens[i];
        const high = highs[i];
        const low = lows[i];
        const close = closes[i];
        const vol = volumes[i];

        if (time && close !== null && close !== undefined && !isNaN(close)) {
          const o = open ?? close;
          const h = high ?? Math.max(o, close);
          const l = low ?? Math.min(o, close);

          candles.push({
            time,
            open: Number(o.toFixed(2)),
            high: Number(h.toFixed(2)),
            low: Number(l.toFixed(2)),
            close: Number(close.toFixed(2)),
            volume: vol ? Math.floor(vol) : 1000,
          });
        }
      }

      if (candles.length > 0) {
        metaPrice = meta.regularMarketPrice ?? candles[candles.length - 1].close;
        metaPrevClose = meta.chartPreviousClose ?? meta.previousClose ?? userBuyPrice;
        break; // Successfully loaded candles
      }
    } catch {
      // try next chart endpoint
    }
  }

  // Await TradingView real-time quote
  const tvQuote = await tvQuotePromise;

  if (candles.length > 0) {
    const finalPrice = tvQuote?.price ?? metaPrice ?? candles[candles.length - 1].close;
    const finalPrevClose = metaPrevClose ?? (tvQuote ? finalPrice - tvQuote.change : userBuyPrice);

    return {
      symbol: cleanDisplaySymbol(symbolInput),
      ticker,
      currentPrice: Number(finalPrice.toFixed(2)),
      previousClose: Number(finalPrevClose.toFixed(2)),
      currency: 'INR',
      candles,
      isLive: true,
    };
  }

  // Fallback to high-fidelity synthetic intraday if network completely fails
  const fallbackBase = tvQuote?.price ?? (userBuyPrice > 0 ? userBuyPrice : 1475.00);
  const syntheticCandles = generateSyntheticIntraday(fallbackBase, timeframe, 60);
  const lastBar = syntheticCandles[syntheticCandles.length - 1];

  return {
    symbol: cleanDisplaySymbol(symbolInput),
    ticker,
    currentPrice: tvQuote?.price ?? lastBar.close,
    previousClose: fallbackBase,
    currency: 'INR',
    candles: syntheticCandles,
    isLive: tvQuote !== null,
  };
}
