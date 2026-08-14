import React from 'react';
import type { EdgeState, GlowLevel } from '../types';

interface EdgeGlowProps {
  edgeState: EdgeState;
  glowLevel?: GlowLevel;
}

export const EdgeGlow: React.FC<EdgeGlowProps> = ({ edgeState, glowLevel = 'standard' }) => {
  const { baseColor, intensity, momentumPulse } = edgeState;

  // Multiplier scaling based on user settings
  const getMultiplier = (): number => {
    switch (glowLevel) {
      case 'subtle': return 0.5;
      case 'intense': return 1.6;
      case 'standard':
      default: return 1.0;
    }
  };

  const mult = getMultiplier();

  // Signal A Base Glow Styles
  const getBaseStyle = (): React.CSSProperties => {
    if (baseColor === 'neutral') {
      return {
        boxShadow: `inset 0 0 ${Math.round(10 * mult)}px rgba(255, 255, 255, 0.05)`,
      };
    }

    const isGreen = baseColor === 'green';
    const rgb = isGreen ? '34, 197, 94' : '239, 68, 68';

    switch (intensity) {
      case 'subtle':
        return {
          boxShadow: `inset 0 0 ${Math.round(24 * mult)}px ${Math.round(3 * mult)}px rgba(${rgb}, ${0.35 * mult}), 0 0 ${Math.round(18 * mult)}px rgba(${rgb}, ${0.2 * mult})`,
        };
      case 'moderate':
        return {
          boxShadow: `inset 0 0 ${Math.round(45 * mult)}px ${Math.round(8 * mult)}px rgba(${rgb}, ${0.65 * mult}), 0 0 ${Math.round(35 * mult)}px ${Math.round(5 * mult)}px rgba(${rgb}, ${0.45 * mult})`,
        };
      case 'strong':
        return {
          boxShadow: `inset 0 0 ${Math.round(80 * mult)}px ${Math.round(16 * mult)}px rgba(${rgb}, ${Math.min(1, 0.9 * mult)}), 0 0 ${Math.round(60 * mult)}px ${Math.round(12 * mult)}px rgba(${rgb}, ${Math.min(1, 0.7 * mult)})`,
        };
      default:
        return {};
    }
  };

  // Signal B Momentum Pulse Class
  const getPulseClass = (): string => {
    switch (momentumPulse) {
      case 'green':
        return 'animate-pulse-green opacity-100';
      case 'red':
        return 'animate-pulse-red opacity-100';
      case 'flash':
        return 'animate-flash-white opacity-100';
      default:
        return 'opacity-0';
    }
  };

  return (
    <>
      {/* Signal A: Base Position Glow Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-40 transition-all duration-700 ease-out"
        style={getBaseStyle()}
        aria-hidden="true"
      />

      {/* Signal B: Momentum Velocity Composite Pulse Overlay */}
      <div
        className={`fixed inset-0 pointer-events-none z-50 transition-opacity duration-300 ${getPulseClass()}`}
        aria-hidden="true"
      />
    </>
  );
};
