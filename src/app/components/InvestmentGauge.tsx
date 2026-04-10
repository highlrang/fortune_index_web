import { Flame, Sparkles, Activity, CheckCircle2, CircleSlash, CloudDrizzle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { HomeInvestmentIndexResponse } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

interface InvestmentGaugeProps {
  data?: HomeInvestmentIndexResponse | null;
  isLoading?: boolean;
  error?: string;
}

type SituationOption = 'good' | 'normal' | 'bad' | null;

const situationOptions = [
  {
    id: 'good',
    label: '잘 되고 있어요',
    shortLabel: '좋음',
    score: 84,
    icon: CheckCircle2,
  },
  {
    id: 'normal',
    label: '보통이에요',
    shortLabel: '보통',
    score: 68,
    icon: CircleSlash,
  },
  {
    id: 'bad',
    label: '잘 안 풀려요',
    shortLabel: '주의',
    score: 42,
    icon: CloudDrizzle,
  },
] as const;

export function InvestmentGauge({
  data = null,
  isLoading = false,
  error = '',
}: InvestmentGaugeProps) {
  const [selectedSituation, setSelectedSituation] = useState<SituationOption>(null);
  const selectedSituationMeta =
    situationOptions.find((option) => option.id === selectedSituation) ?? null;
  const sourceScores = [
    data?.fortune.score,
    data?.tarot.score,
    selectedSituationMeta?.score,
  ].filter((value): value is number => typeof value === 'number');
  const combinedScore =
    sourceScores.length > 0
      ? Math.round(sourceScores.reduce((sum, value) => sum + value, 0) / sourceScores.length)
      : 0;
  const scoreSummary =
    combinedScore >= 80
      ? '좋은 느낌을 자연스럽게 이어가기 좋은 날'
      : combinedScore >= 65
        ? '조급하지 않게 가면 잘 맞는 날'
        : '서두르기보다 한 번 더 살펴보면 좋은 날';

  return (
    <div className="fi-glass relative overflow-hidden rounded-3xl p-8 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-tl from-violet-500/5 via-transparent to-cyan-500/5" />

      <div className="relative">
        <div className="mb-8 flex flex-col items-center justify-center">
          <p className="mb-3 text-xs uppercase tracking-widest fi-text-subtle">오늘의 운세 점수</p>

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
                {combinedScore}
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
              <span className="text-xs font-medium fi-status-text-success">{scoreSummary}</span>
            </motion.div>
          )}

          {!isLoading && data ? (
            <p className="mt-3 text-center text-[11px] leading-5 fi-text-muted">
              사주 {data.fortune.score}점 · 타로 {data.tarot.score}점
              {selectedSituationMeta ? ` · 내 상태 ${selectedSituationMeta.score}점` : ' · 내 상태를 더하면 3가지로 함께 봐드려요'}
            </p>
          ) : null}

          {error ? <p className="mt-3 text-center text-xs fi-text-accent">{error}</p> : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="fi-accent-card flex flex-col items-center gap-2 rounded-xl p-3">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-3 w-12 bg-white/15" />
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 opacity-30" />
                  <Skeleton className="h-4 w-16 bg-white/15" />
                </div>
                <Skeleton className="mt-1 h-3 w-10 bg-white/15" />
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--app-accent-text-strong)' }}>
                  오늘의 사주
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

        <div className="mt-4 rounded-2xl border p-4" style={{ borderWidth: 'var(--app-hairline-border)', borderStyle: 'solid', borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--bg-main) 88%, transparent)' }}>
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 fi-text-muted" />
            <p className="text-sm font-medium fi-text-main">지금 내 상태</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {situationOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedSituation === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedSituation((current) => (current === option.id ? null : option.id))}
                  className="rounded-2xl border px-3 py-3 text-center transition-all"
                  style={{
                    borderWidth: 'var(--app-hairline-border)',
                    borderStyle: 'solid',
                    borderColor: isSelected ? 'var(--app-accent-border-strong)' : 'var(--card-border)',
                    background: isSelected
                      ? 'linear-gradient(135deg, var(--app-accent-surface) 0%, transparent 100%)'
                      : 'var(--card-surface)',
                    color: isSelected ? 'var(--app-accent-text-soft)' : 'var(--app-text-soft)',
                  }}
                >
                  <div className="mb-2 flex justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium">{option.shortLabel}</div>
                  <div className="mt-1 text-[10px] fi-text-subtle">{option.score}점</div>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs leading-5 fi-text-muted">
            내 상태를 고르면 사주, 타로와 함께 3가지로 보고, 고르지 않으면 사주와 타로 2가지로만 점수를 보여드려요.
          </p>
        </div>
      </div>
    </div>
  );
}
