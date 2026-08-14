# ⚡ Senko — Intraday Trading Terminal & Ambient Edge Cockpit

> **A high-performance, distraction-free intraday trading cockpit powered by React 19, Lightweight Charts, real-time market feeds, spatial audio feedback, and dynamic peripheral edge glow.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TradingView](https://img.shields.io/badge/Lightweight_Charts-v5.2-131722?style=for-the-badge&logo=tradingview)](https://www.tradingview.com/)

---

## 🎯 Overview

**Senko** is built specifically for fast-paced intraday traders who need split-second decision clarity without constant eye strain or chart fatigue. By pairing full-viewport financial charts with **ambient peripheral screen glow** and **hardware-synthesized Web Audio API sound pips**, Senko communicates market movements and critical trade boundaries (Target & Stop-Loss) straight into the trader's peripheral awareness.

Whether monitoring active positions on Indian equity markets (NSE/BSE) or testing strategies in simulated offline conditions, Senko provides real-time indicators (VWAP, EMA), instant Risk-to-Reward (R:R) analytics, and an integrated **Dev Lab Playground**.

---

## ✨ Key Features

### 🌈 1. Ambient Peripheral Edge Glow System (`EdgeGlow.tsx`)
* **Peripheral Vision Visual Feedback**: Uses high-impact screen edge gradients that update dynamically as price oscillates relative to your entry, target, and stop-loss levels.
* **4-State Visual Signals**:
  * 🟢 **Target Achieved / In Profit**: Bright emerald glow pulses when price crosses into your target zone.
  * 🔴 **Stop Loss Warning / Breached**: Crimson emergency warning glow triggers near or below your risk limit.
  * 🔵 **Above Buy Price**: Soft cyan/teal illumination signals standard trade progression.
  * ⚪ **Neutral Zone**: Subdued dark ambient glow for low-stress monitoring.
* **Configurable Intensity Levels**: Choose between `Discreet`, `Standard`, `Intense`, or `Off` in the settings cockpit.

### 📊 2. High-Performance TradingView Charting (`TradingView.tsx`)
* Built on **TradingView Lightweight Charts v5**.
* Supports smooth toggling between **Candlestick** and **Area/Line** chart visualizers.
* Custom price line overlays: **Entry / Buy Price (Cyan)**, **Target Price (Emerald)**, and **Stop Loss (Red)**.
* **Technical Indicators**:
  * 📈 **VWAP (Volume-Weighted Average Price)**: Real-time intraday calculation.
  * 📉 **EMA (Exponential Moving Average)**: Dynamic period calculation (default 20-period, fully adjustable).
* **Responsive Scaling & Precision Tooltips**: Formatted for Indian Rupee (₹) price precision and unix timestamps.

### 🔊 3. Zero-Latency Spatial Audio Engine (`audioEngine.ts`)
* Built on the native **Web Audio API** — zero external `.mp3` assets required, completely hardware-synthesized with zero network audio latency.
* Distinct audio signatures:
  * 🚨 **Stop-Loss Breach**: Dual-tone emergency siren.
  * 🎯 **Target Hit**: Dual-stage victory chime.
  * 🚀 **Cross-Up**: High double-tone chirp.
  * 📉 **Cross-Down**: Descending caution tone.
  * ⚡ **Momentum Spike**: High-frequency exponential sweep.

### 📡 4. Real-Time Market Data & Synthetic Fallback (`marketDataApi.ts`)
* **Live Market Integration**: Parallel fetch engine connecting to TradingView Scanner API & Yahoo Finance endpoints for live NSE stock quotes and intraday candles.
* **Popular Indian Stock Presets**: Quick select presets for **RELIANCE**, **TATAMOTORS**, **HDFCBANK**, **INFY**, **TCS**, **ICICIBANK**, **SBIN**, **ZOMATO**, **BAJFINANCE**, etc.
* **Geometric Brownian Motion Simulation**: Seamless fallback engine generating realistic 1m/3m/5m/15m synthetic candle data when markets are closed or APIs are throttled.

### 🧮 5. Trade Setup & Risk Cockpit (`SetupForm.tsx`)
* Quick trade entry calculator:
  * Symbol selector with auto-suffixing (`RELIANCE` → `RELIANCE.NS`).
  * Buy Price, Quantity, Target Price, Stop Loss.
  * Real-time calculation of **Total Position Capital**, **Max Risk (₹)**, **Target P&L (₹)**, and **Risk-to-Reward (R:R) Ratio**.

### 🧪 6. Dev Lab Playground & Stress Tester (`DevMenu.tsx`)
* Integrated drawer for testing trade alerts without waiting for market movements.
* Trigger rapid simulation actions:
  * 🟢 **+1.5% Price Spike**: Test target hit animations and audio pips.
  * 🔴 **-1.5% Price Drop**: Test stop-loss siren warnings.
  * ⚡ **Volatility Shock**: Trigger sudden price swings.
* **Secret Gesture**: Triple-tap anywhere on the main chart background to toggle the Dev Lab drawer.

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────┐
                       │   Market Data Engine    │
                       │ (TradingView / Yahoo /  │
                       │    Synthetic GBM)       │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │ useRealtimePriceFeed()  │
                       └────────────┬────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  TradingView.tsx │      │  useEdgeState()  │      │ ChartHeader.tsx  │
│ (Candles / VWAP /│      └────────┬─────────┘      │  (Live Quotes &  │
│      EMA)        │               │                │   Quick Controls)│
└──────────────────┘               │                └──────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
         ┌──────────────────┐          ┌──────────────────┐
         │  EdgeGlow.tsx    │          │ audioEngine.ts   │
         │ (RGB Peripheral) │          │ (Web Audio API)  │
         └──────────────────┘          └──────────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern component architecture with concurrent rendering |
| **Language** | [TypeScript 6.0](https://www.typescriptlang.org/) | Strict type safety and clear domain models |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Lightning-fast HMR and bundle optimization |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first styling & custom glassmorphism |
| **Charts** | [Lightweight Charts v5](https://www.tradingview.com/lightweight-charts/) | High-fps financial charting canvas |
| **Icons** | [Lucide React](https://lucide.dev/) | Modern minimalist SVG icon set |
| **Linter** | [Oxlint](https://oxc.rs/) | High-performance Rust-based JavaScript/TypeScript linter |

---

## 📂 Project Structure

```
intraday/
├── index.html                  # HTML5 Entry point & Google Font preloads
├── package.json                # Project dependencies & scripts
├── vite.config.ts              # Vite configuration & proxy rules
├── vercel.json                 # Vercel deployment configuration
├── public/                     # Static SVG assets & icons
└── src/
    ├── main.tsx                # App entry point
    ├── App.tsx                 # Core layout & application state router
    ├── index.css               # Global styles & Tailwind import
    ├── components/             # UI Components
    │   ├── SetupForm.tsx       # Trade setup & position size calculator
    │   ├── ChartHeader.tsx     # Top bar with real-time price info & controls
    │   ├── TradingView.tsx     # Lightweight Charts integration
    │   ├── EdgeGlow.tsx        # Ambient peripheral screen glow overlay
    │   ├── DevMenu.tsx         # Dev Lab simulation drawer
    │   └── SettingsModal.tsx   # Overlay & indicator customization modal
    ├── hooks/                  # Custom React Hooks
    │   ├── useRealtimePriceFeed.ts  # Price streaming & data polling
    │   └── useEdgeState.ts          # Zone state resolution & alert triggers
    ├── services/               # API & Data Providers
    │   └── marketDataApi.ts    # TradingView Scanner & Yahoo Finance integration
    ├── utils/                  # Core Utilities & Algorithms
    │   ├── audioEngine.ts      # Web Audio API sound synthesizer
    │   ├── technicalIndicators.ts # VWAP & EMA calculation functions
    │   └── indianStocks.ts     # NSE ticker formatting & presets list
    └── types/                  # TypeScript Interfaces & Types
        └── index.ts            # Trade setup, candles, edge state models
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SIDDHUX9/senko.git
   cd senko
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 📜 Available Scripts

* `npm run dev` — Starts Vite dev server with hot module replacement (HMR).
* `npm run build` — Runs TypeScript type-checking (`tsc -b`) and builds production output in `dist/`.
* `npm run preview` — Locally previews the production build.
* `npm run lint` — Runs fast code linting via `oxlint`.

---

## 🧪 Simulation Controls & Shortcuts

* **Triple-Tap Gesture**: Tap 3 times rapidly anywhere on the chart canvas to toggle the **Dev Lab Drawer**.
* **Fullscreen Mode**: Click the Fullscreen icon in the top header or press `F11`.
* **Audio Mute/Unmute**: Click the Speaker icon in the top header bar.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for details.

---

<p align="center">
  Designed for speed and focus by <b>SIDDHUX9</b>
</p>

