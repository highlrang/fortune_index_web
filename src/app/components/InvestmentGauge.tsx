import { useEffect, useMemo, useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getInvestmentIndex, type TotalIndexResponse } from '@/lib/api';

const fallbackIndex: TotalIndexResponse = {
  totalScore: 82,
  detail: {
    selectedMarket: 'KOSPI',
    marketScore: 75,
    marketRawValue: 2560,
    sajuScore: 88,
    dailyGanji: '갑진',
    tarotScore: 83,
    tarotCardName: '태양',
  },
};

export function InvestmentGauge() {
  const [data, setData] = useState<TotalIndexResponse>(fallbackIndex);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getInvestmentIndex()
      .then((response) => {
        if (!active) return;
        setData(response);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : '투자 지수를 불러오지 못했습니다.');
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (data.totalScore >= 80) return '매수하기 좋은 날';
    if (data.totalScore >= 60) return '기회를 살펴볼 날';
    if (data.totalScore >= 40) return '중립적인 흐름';
    return '보수적으로 접근할 날';
  }, [data.totalScore]);

  return (
    <div className="fi-glass relative overflow-hidden rounded-3xl p-8 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-tl from-violet-500/5 via-transparent to-cyan-500/5" />

      <div className="relative">
        <div className="mb-8 flex flex-col items-center justify-center">
          <p className="mb-3 text-xs uppercase tracking-widest fi-text-subtle">투자 지수</p>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-cyan-400/20 via-amber-400/20 to-purple-400/20 blur-2xl" />
            </div>
            <motion.span
              className="relative text-7xl font-light tracking-tight fi-text-main"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {data.totalScore}
            </motion.span>
          </div>

          <motion.div
            className="rounded-full border px-4 py-1.5"
            style={{
              borderWidth: 'var(--app-hairline-border)',
              borderStyle: 'solid',
              borderColor: 'rgba(16, 185, 129, 0.28)',
              background: 'rgba(16, 185, 129, 0.1)',
              backdropFilter: 'var(--card-blur)',
              WebkitBackdropFilter: 'var(--card-blur)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-xs font-medium" style={{ color: 'rgb(110, 231, 183)' }}>{summary}</span>
          </motion.div>

          {error ? <p className="mt-3 text-center text-xs fi-text-accent">{error}</p> : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="fi-glass flex flex-col items-center gap-2 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide fi-text-subtle">{data.detail.selectedMarket}</p>
            <p className="text-sm font-medium text-rose-400">{formatMarketValue(data.detail.marketRawValue)}</p>
            <div className="mt-1 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-[10px] text-cyan-300">{data.detail.marketScore}점</span>
            </div>
          </div>

          <div className="fi-accent-card flex flex-col items-center gap-2 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--app-accent-text-strong)' }}>
              오늘의 운세
            </p>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--app-accent-text-strong)' }}>
              <Flame className="h-4 w-4" />
              {data.detail.dailyGanji}
            </div>
            <div className="mt-1 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--point-gold)' }} />
              <span className="text-[10px]" style={{ color: 'var(--app-accent-text-strong)' }}>
                {data.detail.sajuScore}점
              </span>
            </div>
          </div>

          <div className="fi-glass flex flex-col items-center gap-2 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--glow-purple)' }}>오늘의 타로</p>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>
              <Sparkles className="h-4 w-4" />
              {data.detail.tarotCardName}
            </div>
            <div className="mt-1 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span className="text-[10px] text-purple-300">{data.detail.tarotScore}점</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMarketValue(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
}
