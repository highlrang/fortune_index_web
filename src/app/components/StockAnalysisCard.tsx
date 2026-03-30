import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { HomeStockItemResponse, HomeStocksResponse } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

interface StockAnalysisCardProps {
  data?: HomeStocksResponse | null;
  isLoading?: boolean;
  error?: string;
  preferredMarket?: 'domestic' | 'foreign';
}

export function StockAnalysisCard({
  data = null,
  isLoading = false,
  error = '',
  preferredMarket = 'domestic',
}: StockAnalysisCardProps) {
  const [activeMarket, setActiveMarket] = useState<'domestic' | 'foreign'>(preferredMarket);

  useEffect(() => {
    setActiveMarket(preferredMarket);
  }, [preferredMarket]);

  const currentStocks = activeMarket === 'domestic' ? data?.domestic ?? [] : data?.foreign ?? [];
  const title = activeMarket === 'domestic' ? '국내주식 현황' : '해외주식 현황';

  return (
    <div className="space-y-4">
      {/* Stock Prices Card */}
      <div className="fi-glass relative overflow-hidden rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium fi-text-soft">{title}</h3>
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`${activeMarket}-${index}`}
                className="fi-glass flex items-center justify-between rounded-lg p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-3 w-12 bg-white/10" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Skeleton className="h-5 w-20 bg-white/10" />
                    <Skeleton className="h-3 w-14 bg-white/10" />
                  </div>
                </div>
              </div>
            ))
          ) : currentStocks.length > 0 ? (
            currentStocks.map((stock) => (
              <div
                key={`${activeMarket}-${stock.ticker}`}
                className="fi-glass flex items-center justify-between rounded-lg p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium fi-text-main">{stock.name}</p>
                    <span className="text-xs fi-text-subtle">{stock.ticker}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-base fi-text-main">{formatStockPrice(stock)}</span>
                    <div className="flex items-center gap-1">
                      {stock.changeRate >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-rose-400" />
                      )}
                      <span className={stock.changeRate >= 0 ? 'text-xs text-emerald-400' : 'text-xs text-rose-400'}>
                        {stock.changeRate >= 0 ? '+' : ''}
                        {stock.changeRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="fi-glass rounded-lg p-4 text-center text-xs fi-text-muted">
              {error || '표시할 주식 데이터가 없습니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatStockPrice(stock: HomeStockItemResponse) {
  if (stock.currency === 'KRW') {
    return `₩${stock.price.toLocaleString()}`;
  }

  return `$${stock.price.toFixed(2)}`;
}
