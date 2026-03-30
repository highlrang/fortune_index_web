import { Flame, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { HomeInvestmentIndexResponse } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

interface InvestmentGaugeProps {
  data?: HomeInvestmentIndexResponse | null;
  isLoading?: boolean;
  error?: string;
}

export function InvestmentGauge({
  data = null,
  isLoading = false,
  error = '',
}: InvestmentGaugeProps) {
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
            {isLoading || !data ? (
              <Skeleton className="relative h-[84px] w-24 rounded-3xl bg-white/10" />
            ) : (
              <motion.span
                className="relative text-7xl font-light tracking-tight fi-text-main"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {data.totalScore}
              </motion.span>
            )}
          </div>

          {isLoading || !data ? (
            <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
          ) : (
            <motion.div
              className="rounded-full border px-4 py-1.5"
              style={{
                borderWidth: 'var(--app-hairline-border)',
                borderStyle: 'solid',
                borderColor: 'var(--app-success-border)',
                background: 'var(--app-success-bg)',
                backdropFilter: 'var(--card-blur)',
                WebkitBackdropFilter: 'var(--card-blur)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <span className="text-xs font-medium fi-status-text-success">{data.summary}</span>
            </motion.div>
          )}

          {error ? <p className="mt-3 text-center text-xs fi-text-accent">{error}</p> : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="fi-glass flex flex-col items-center gap-2 rounded-xl p-3">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-3 w-12 bg-white/10" />
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="mt-1 h-3 w-10 bg-white/10" />
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wide fi-text-subtle">{data.market.label}</p>
                <p className={`text-sm font-medium ${getChangeTextClassName(data.market.change)}`}>
                  {formatMarketValue(data.market.value)}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${getChangeDotClassName(data.market.change)}`} />
                  <span className="text-[10px] fi-status-text-info">{data.market.score}점</span>
                </div>
              </>
            )}
          </div>

          <div className="fi-accent-card flex flex-col items-center gap-2 rounded-xl p-3">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-3 w-14 bg-white/15" />
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 opacity-30" />
                  <Skeleton className="h-4 w-12 bg-white/15" />
                </div>
                <Skeleton className="mt-1 h-3 w-10 bg-white/15" />
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--app-accent-text-strong)' }}>
                  오늘의 운세
                </p>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--app-accent-text-strong)' }}>
                  <Flame className="h-4 w-4" />
                  {data.fortune.dailyGanji}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--point-gold)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--app-accent-text-strong)' }}>
                    {data.fortune.score}점
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="fi-glass flex flex-col items-center gap-2 rounded-xl p-3">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-3 w-14 bg-white/10" />
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 opacity-30" />
                  <Skeleton className="h-4 w-12 bg-white/10" />
                </div>
                <Skeleton className="mt-1 h-3 w-10 bg-white/10" />
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--glow-purple)' }}>오늘의 타로</p>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>
                  <Sparkles className="h-4 w-4" />
                  {data.tarot.cardName}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span className="text-[10px] fi-status-text-info">{data.tarot.score}점</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMarketValue(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
}

function getChangeTextClassName(change: number) {
  if (change > 0) return 'fi-status-text-success';
  if (change < 0) return 'fi-status-text-danger';
  return 'fi-text-main';
}

function getChangeDotClassName(change: number) {
  if (change > 0) return 'bg-emerald-400';
  if (change < 0) return 'bg-rose-400';
  return 'bg-slate-400';
}
