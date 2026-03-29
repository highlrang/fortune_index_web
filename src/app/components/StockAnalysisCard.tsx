import { TrendingUp, TrendingDown, Activity, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface StockData {
  name: string;
  ticker: string;
  price: number;
  change: number;
  currency: 'KRW' | 'USD';
}

const domesticStocks: StockData[] = [
  { name: '삼성전자', ticker: '005930', price: 71500, change: 2.34, currency: 'KRW' },
  { name: 'SK하이닉스', ticker: '000660', price: 182750, change: -1.12, currency: 'KRW' },
  { name: '카카오', ticker: '035720', price: 48200, change: 1.85, currency: 'KRW' },
];

const foreignStocks: StockData[] = [
  { name: 'Apple Inc.', ticker: 'AAPL', price: 178.42, change: 1.23, currency: 'USD' },
  { name: 'Tesla', ticker: 'TSLA', price: 248.15, change: -0.87, currency: 'USD' },
  { name: 'NVIDIA', ticker: 'NVDA', price: 892.34, change: 3.45, currency: 'USD' },
];

export function StockAnalysisCard() {
  const [activeMarket, setActiveMarket] = useState<'domestic' | 'foreign'>('domestic');
  
  const currentStocks = activeMarket === 'domestic' ? domesticStocks : foreignStocks;

  return (
    <div className="space-y-4">
      {/* Stock Prices Card */}
      <div className="fi-glass relative overflow-hidden rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium fi-text-soft">국내주식 현황</h3>
          <button className="text-xs fi-text-accent hover:opacity-80">전체보기</button>
        </div>
        
        {/* Market tabs */}
        <div className="fi-glass mb-4 flex gap-2 rounded-xl p-1">
          <button
            onClick={() => setActiveMarket('domestic')}
            className="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-all"
            style={
              activeMarket === 'domestic'
                ? {
                    background: 'linear-gradient(90deg, var(--app-accent-surface) 0%, transparent 100%)',
                    color: 'var(--app-accent-text-soft)',
                    boxShadow: '0 12px 24px -20px var(--app-accent-glow)',
                  }
                : { color: 'var(--app-text-muted)' }
            }
          >
            국내주식
          </button>
          <button
            onClick={() => setActiveMarket('foreign')}
            className="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-all"
            style={
              activeMarket === 'foreign'
                ? {
                    background: 'linear-gradient(90deg, var(--app-accent-surface) 0%, transparent 100%)',
                    color: 'var(--app-accent-text-soft)',
                    boxShadow: '0 12px 24px -20px var(--app-accent-glow)',
                  }
                : { color: 'var(--app-text-muted)' }
            }
          >
            해외주식
          </button>
        </div>
        
        <div className="space-y-3">
          {currentStocks.map((stock) => (
            <div
              key={stock.ticker}
              className="fi-glass flex items-center justify-between rounded-lg p-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium fi-text-main">{stock.name}</p>
                  <span className="text-xs fi-text-subtle">{stock.ticker}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base fi-text-main">
                    {stock.currency === 'KRW' 
                      ? `₩${stock.price.toLocaleString()}`
                      : `$${stock.price.toFixed(2)}`
                    }
                  </span>
                  <div className="flex items-center gap-1">
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-rose-400" />
                    )}
                    <span
                      className={`text-xs ${
                        stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
