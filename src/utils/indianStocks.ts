import type { IndianStockPreset } from '../types';

export const POPULAR_INDIAN_STOCKS: IndianStockPreset[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy & Retail', approxPrice: 1475.00 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automotive', approxPrice: 980.50 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', approxPrice: 1640.00 },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT Services', approxPrice: 1820.00 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT Services', approxPrice: 4250.00 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', approxPrice: 1220.00 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', approxPrice: 840.00 },
  { symbol: 'ZOMATO', name: 'Eternal (Zomato)', sector: 'Consumer Tech', approxPrice: 260.00 },
  { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals & Mining', approxPrice: 165.00 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', approxPrice: 1450.00 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Financials', approxPrice: 6900.00 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Automotive', approxPrice: 12400.00 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', sector: 'Conglomerate', approxPrice: 3150.00 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT Services', approxPrice: 530.00 },
];

/**
 * Format user input symbol to standard NSE Yahoo ticker.
 * E.g., "RELIANCE" -> "RELIANCE.NS"
 * "RELIANCE.NS" -> "RELIANCE.NS"
 * "TATASTEEL.BO" -> "TATASTEEL.BO"
 */
export function formatIndianTicker(rawSymbol: string): string {
  const cleaned = rawSymbol.trim().toUpperCase();
  if (!cleaned) return 'RELIANCE.NS';
  if (cleaned.endsWith('.NS') || cleaned.endsWith('.BO')) {
    return cleaned;
  }
  return `${cleaned}.NS`;
}

/**
 * Strips suffix for clean display in UI (e.g. "RELIANCE.NS" -> "RELIANCE")
 */
export function cleanDisplaySymbol(ticker: string): string {
  return ticker.replace(/\.(NS|BO)$/i, '').toUpperCase();
}
