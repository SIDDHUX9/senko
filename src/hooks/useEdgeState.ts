import { useState, useEffect, useRef } from 'react';
import type { EdgeState, PriceTick } from '../types';
import { audioEngine } from '../utils/audioEngine';

export function useEdgeState(
  currentPrice: number,
  buyPrice: number,
  targetPrice?: number,
  stopLoss?: number,
  audioEnabled: boolean = true
): EdgeState {
  const [edgeState, setEdgeState] = useState<EdgeState>({
    baseColor: 'neutral',
    intensity: 'subtle',
    momentumPulse: 'none',
    positionPct: 0,
    velocityPct: 0,
    isTargetHit: false,
    isStopLossHit: false,
  });

  const tickHistoryRef = useRef<PriceTick[]>([]);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePulseRef = useRef<'none' | 'green' | 'red' | 'flash'>('none');
  const prevPriceRef = useRef<number>(currentPrice);

  useEffect(() => {
    if (!buyPrice || buyPrice <= 0) return;

    const prevPrice = prevPriceRef.current;
    const now = Date.now();

    // Maintain rolling buffer of price ticks in last 10 seconds
    const history = tickHistoryRef.current.filter((t) => now - t.timestamp <= 10000);
    history.push({ price: currentPrice, timestamp: now });
    tickHistoryRef.current = history;

    // --- Signal A: Position (Base Color & Intensity) ---
    const positionPct = Number((((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2));
    const absPos = Math.abs(positionPct);

    let baseColor: 'green' | 'red' | 'neutral' = 'neutral';
    if (positionPct > 0.02) baseColor = 'green';
    else if (positionPct < -0.02) baseColor = 'red';

    let intensity: 'subtle' | 'moderate' | 'strong' = 'subtle';
    if (absPos >= 2.0) {
      intensity = 'strong';
    } else if (absPos >= 0.5) {
      intensity = 'moderate';
    } else {
      intensity = 'subtle';
    }

    // --- Target & Stop-Loss Level Detection ---
    const isTargetHit = !!(targetPrice && targetPrice > 0 && currentPrice >= targetPrice);
    const isStopLossHit = !!(stopLoss && stopLoss > 0 && currentPrice <= stopLoss);

    // --- Audio Sound Alerts Triggering ---
    audioEngine.setMuted(!audioEnabled);

    if (audioEnabled) {
      if (isTargetHit && (prevPrice < targetPrice!)) {
        audioEngine.playTargetHit();
      } else if (isStopLossHit && (prevPrice > stopLoss!)) {
        audioEngine.playStopLoss();
      } else if (prevPrice < buyPrice && currentPrice >= buyPrice) {
        audioEngine.playCrossUp();
      } else if (prevPrice > buyPrice && currentPrice < buyPrice) {
        audioEngine.playCrossDown();
      }
    }

    // --- Signal B: Momentum (Velocity detection over rolling window) ---
    let velocityPct = 0;
    let detectedPulse: 'none' | 'green' | 'red' | 'flash' = 'none';

    if (history.length >= 2) {
      const oldestTick = history[0];
      const timeDiffSec = (now - oldestTick.timestamp) / 1000;

      if (timeDiffSec >= 1.0) {
        velocityPct = Number((((currentPrice - oldestTick.price) / oldestTick.price) * 100).toFixed(2));
        const absVel = Math.abs(velocityPct);

        if (absVel >= 1.8) {
          detectedPulse = 'flash';
        } else if (velocityPct <= -0.5) {
          detectedPulse = 'red';
        } else if (velocityPct >= 0.5) {
          detectedPulse = 'green';
        }
      }
    }

    // Trigger transient pulse if momentum detected
    if (detectedPulse !== 'none') {
      activePulseRef.current = detectedPulse;

      if (pulseTimerRef.current) {
        clearTimeout(pulseTimerRef.current);
      }

      pulseTimerRef.current = setTimeout(() => {
        activePulseRef.current = 'none';
        setEdgeState((prev) => ({ ...prev, momentumPulse: 'none' }));
      }, 1500);
    }

    setEdgeState({
      baseColor,
      intensity,
      momentumPulse: activePulseRef.current,
      positionPct,
      velocityPct,
      isTargetHit,
      isStopLossHit,
    });

    prevPriceRef.current = currentPrice;
  }, [currentPrice, buyPrice, targetPrice, stopLoss, audioEnabled]);

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  return edgeState;
}
