import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  LineStyle,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import type { CandlestickBar, IndicatorPoint, ChartOverlayConfig } from '../types';

interface TradingViewProps {
  buyPrice: number;
  targetPrice?: number;
  stopLoss?: number;
  candles: CandlestickBar[];
  vwapSeries: IndicatorPoint[];
  emaSeries: IndicatorPoint[];
  overlayConfig: ChartOverlayConfig;
}

export const TradingView: React.FC<TradingViewProps> = ({
  buyPrice,
  targetPrice,
  stopLoss,
  candles,
  vwapSeries,
  emaSeries,
  overlayConfig,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const mainLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Initialize Lightweight Chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#64748b',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#64748b',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
    });

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      visible: overlayConfig.chartType === 'candlestick',
    });

    // 2. Line Graph Series (Vibrant Cyan price line)
    const mainLineSeries = chart.addSeries(LineSeries, {
      color: '#38bdf8',
      lineWidth: 2,
      priceLineVisible: true,
      lastValueVisible: true,
      visible: overlayConfig.chartType === 'line',
    });

    // 3. Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#38bdf8',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // Overlay scale
    });

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0,
      },
    });

    // 4. VWAP Line Series
    const vwapLine = chart.addSeries(LineSeries, {
      color: '#a855f7', // Purple
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      title: 'VWAP',
      visible: overlayConfig.showVWAP,
    });

    // 5. EMA Line Series
    const emaLine = chart.addSeries(LineSeries, {
      color: '#f59e0b', // Amber
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      title: `EMA (${overlayConfig.emaPeriod})`,
      visible: overlayConfig.showEMA,
    });

    const activeSeries = overlayConfig.chartType === 'candlestick' ? candleSeries : mainLineSeries;

    // Horizontal Price Line: BUY PRICE (Blue)
    if (buyPrice > 0) {
      activeSeries.createPriceLine({
        price: buyPrice,
        color: '#3b82f6',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'YOUR BUY PRICE',
      });
    }

    // Horizontal Price Line: TARGET PRICE (Green)
    if (targetPrice && targetPrice > 0) {
      activeSeries.createPriceLine({
        price: targetPrice,
        color: '#22c55e',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `TARGET (₹${targetPrice.toFixed(2)})`,
      });
    }

    // Horizontal Price Line: STOP-LOSS (Red)
    if (stopLoss && stopLoss > 0) {
      activeSeries.createPriceLine({
        price: stopLoss,
        color: '#ef4444',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `STOP LOSS (₹${stopLoss.toFixed(2)})`,
      });
    }

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    mainLineSeriesRef.current = mainLineSeries;
    volumeSeriesRef.current = volumeSeries;
    vwapSeriesRef.current = vwapLine;
    emaSeriesRef.current = emaLine;

    // Resize observer
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [buyPrice, targetPrice, stopLoss, overlayConfig.chartType]);

  // Update Series Data
  useEffect(() => {
    if (!candleSeriesRef.current || !mainLineSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    // Candlesticks
    candleSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // Line Graph
    mainLineSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as Time,
        value: c.close,
      }))
    );

    // Volume
    volumeSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as Time,
        value: c.volume || 1000,
        color: c.close >= c.open ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      }))
    );
  }, [candles]);

  // Toggle Visibility between Candlestick & Line Graph
  useEffect(() => {
    if (candleSeriesRef.current && mainLineSeriesRef.current) {
      candleSeriesRef.current.applyOptions({ visible: overlayConfig.chartType === 'candlestick' });
      mainLineSeriesRef.current.applyOptions({ visible: overlayConfig.chartType === 'line' });
    }
  }, [overlayConfig.chartType]);

  // Update VWAP Series Data & Visibility
  useEffect(() => {
    if (!vwapSeriesRef.current) return;
    vwapSeriesRef.current.applyOptions({ visible: overlayConfig.showVWAP });
    if (vwapSeries.length > 0) {
      vwapSeriesRef.current.setData(
        vwapSeries.map((p) => ({ time: p.time as Time, value: p.value }))
      );
    }
  }, [vwapSeries, overlayConfig.showVWAP]);

  // Update EMA Series Data & Visibility
  useEffect(() => {
    if (!emaSeriesRef.current) return;
    emaSeriesRef.current.applyOptions({
      visible: overlayConfig.showEMA,
      title: `EMA (${overlayConfig.emaPeriod})`,
    });
    if (emaSeries.length > 0) {
      emaSeriesRef.current.setData(
        emaSeries.map((p) => ({ time: p.time as Time, value: p.value }))
      );
    }
  }, [emaSeries, overlayConfig.showEMA, overlayConfig.emaPeriod]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-[#090d16]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
