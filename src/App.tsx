import { useState, useCallback, useEffect } from 'react';
import type { TradeSetup, ChartOverlayConfig } from './types';
import { SetupForm } from './components/SetupForm';
import { ChartHeader } from './components/ChartHeader';
import { TradingView } from './components/TradingView';
import { EdgeGlow } from './components/EdgeGlow';
import { DevMenu } from './components/DevMenu';
import { SettingsModal } from './components/SettingsModal';
import { useRealtimePriceFeed } from './hooks/useRealtimePriceFeed';
import { useEdgeState } from './hooks/useEdgeState';

export function App() {
  const [mode, setMode] = useState<'setup' | 'trading'>('setup');
  const [setup, setSetup] = useState<TradeSetup>({
    symbol: 'RELIANCE',
    buyPrice: 1475.00,
    quantity: 50,
    targetPrice: 1497.00,
    stopLoss: 1460.00,
    timeframe: '5m',
  });

  const [overlayConfig, setOverlayConfig] = useState<ChartOverlayConfig>({
    chartType: 'candlestick',
    glowLevel: 'standard',
    showVWAP: true,
    showEMA: true,
    emaPeriod: 20,
    audioEnabled: true,
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDevMenuOpen, setIsDevMenuOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Real-time market feed hook
  const {
    loading,
    isLiveFeed,
    currentPrice,
    priceChange,
    priceChangePct,
    candles,
    vwapSeries,
    emaSeries,
    injectSpike,
    injectDrop,
    injectShock,
    refetchFeed,
  } = useRealtimePriceFeed(setup);

  // Edge state hook with level targets & audio alerts
  const edgeState = useEdgeState(
    currentPrice,
    setup.buyPrice,
    setup.targetPrice,
    setup.stopLoss,
    overlayConfig.audioEnabled
  );

  // Listen to native browser fullscreen change events
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Could not enter fullscreen mode:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleToggleAudio = () => {
    setOverlayConfig((prev) => ({
      ...prev,
      audioEnabled: !prev.audioEnabled,
    }));
  };

  const handleStartTrading = (newSetup: TradeSetup) => {
    setSetup(newSetup);
    setMode('trading');
  };

  const handleExitSession = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setMode('setup');
  };

  const handleToggleChartType = () => {
    setOverlayConfig((prev) => ({
      ...prev,
      chartType: prev.chartType === 'candlestick' ? 'line' : 'candlestick',
    }));
  };

  // Secret Triple Tap Gesture Detection for Dev Menu
  const tapCountRef = useState<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 })[0];
  const handleCornerTap = useCallback(() => {
    const now = Date.now();
    if (now - tapCountRef.lastTime < 500) {
      tapCountRef.count += 1;
    } else {
      tapCountRef.count = 1;
    }
    tapCountRef.lastTime = now;

    if (tapCountRef.count >= 3) {
      setIsDevMenuOpen((prev) => !prev);
      tapCountRef.count = 0;
    }
  }, [tapCountRef]);

  if (mode === 'setup') {
    return <SetupForm onStartTrading={handleStartTrading} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090d16] text-slate-100 flex flex-col select-none">
      {/* Ambient Edge Glow Overlay with Customizable Glow Level */}
      <EdgeGlow edgeState={edgeState} glowLevel={overlayConfig.glowLevel} />

      {/* Non-intrusive Minimal Header Bar */}
      <ChartHeader
        setup={setup}
        currentPrice={currentPrice}
        priceChange={priceChange}
        priceChangePct={priceChangePct}
        isLiveFeed={isLiveFeed}
        edgeState={edgeState}
        overlayConfig={overlayConfig}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleAudio={handleToggleAudio}
        onToggleChartType={handleToggleChartType}
        onToggleSettings={() => setIsSettingsOpen(true)}
        onToggleDevMenu={() => setIsDevMenuOpen(true)}
        onExitSession={handleExitSession}
      />

      {/* Full Viewport Candlestick / Line Chart */}
      <main className="flex-1 w-full h-full relative" onClick={handleCornerTap}>
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#090d16]">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono text-slate-400">Loading {setup.symbol} SENKO Feed...</p>
          </div>
        ) : (
          <TradingView
            buyPrice={setup.buyPrice}
            targetPrice={setup.targetPrice}
            stopLoss={setup.stopLoss}
            candles={candles}
            vwapSeries={vwapSeries}
            emaSeries={emaSeries}
            overlayConfig={overlayConfig}
          />
        )}
      </main>

      {/* Dev Lab Simulation Drawer */}
      <DevMenu
        isOpen={isDevMenuOpen}
        onClose={() => setIsDevMenuOpen(false)}
        isLiveFeed={isLiveFeed}
        edgeState={edgeState}
        onInjectSpike={injectSpike}
        onInjectDrop={injectDrop}
        onInjectShock={injectShock}
        onRefetchFeed={refetchFeed}
      />

      {/* Cockpit & Edge Glow Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={overlayConfig}
        onChangeConfig={setOverlayConfig}
      />
    </div>
  );
}

export default App;
