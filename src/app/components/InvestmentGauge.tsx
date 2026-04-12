import { Flame, Sparkles, Activity, CheckCircle2, CircleSlash, CloudDrizzle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [isSituationDrawerOpen, setIsSituationDrawerOpen] = useState(false);
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
                <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--app-info-text)' }}>오늘의 타로</p>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>
                  <Sparkles className="h-4 w-4" />
                  {data.tarot.cardName}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--app-info-border)' }} />
                  <span className="text-[10px] fi-status-text-info">{data.tarot.score}점</span>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsSituationDrawerOpen(true)}
            className="fi-glass flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all hover:bg-white/[0.04]"
          >
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--app-info-text)' }}>
              투자 컨디션
            </p>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>
              <Activity className="h-4 w-4" />
              {selectedSituationMeta ? selectedSituationMeta.shortLabel : '선택하기'}
            </div>
            <div className="mt-1 flex items-center gap-1">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: selectedSituationMeta ? 'var(--app-info-border)' : 'var(--app-text-subtle)' }}
              />
              <span className="text-[10px]" style={{ color: selectedSituationMeta ? 'var(--app-info-text)' : 'var(--app-text-subtle)' }}>
                {selectedSituationMeta ? `${selectedSituationMeta.score}점` : '점수 반영'}
              </span>
            </div>
          </button>
        </div>

      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {isSituationDrawerOpen ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-center px-4 pt-8 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] backdrop-blur-sm"
                  style={{ backgroundColor: 'var(--app-modal-backdrop)' }}
                  onClick={() => setIsSituationDrawerOpen(false)}
                >
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30 }}
                    className="relative flex max-h-[calc(100dvh-7.5rem-env(safe-area-inset-bottom))] w-full max-w-md flex-col overflow-hidden rounded-3xl border backdrop-blur-xl"
                    style={{
                      background:
                        'linear-gradient(180deg, color-mix(in srgb, var(--app-modal-bg) 82%, transparent) 0%, color-mix(in srgb, var(--app-surface-bg-strong) 92%, transparent) 100%)',
                      borderColor: 'var(--app-surface-border)',
                      boxShadow: '0 -24px 80px rgba(5, 7, 16, 0.4)',
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-24 opacity-80"
                      style={{
                        background:
                          'radial-gradient(circle at top, var(--app-accent-glow) 0%, transparent 72%)',
                      }}
                    />

                    <div className="relative flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--app-surface-divider)' }}>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--app-accent-text-soft)' }}>
                          Investment Flow
                        </p>
                        <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>
                          투자 컨디션 선택
                        </h3>
                        <p className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>
                          지금 내 흐름에 가까운 상태를 골라 점수에 반영하세요.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSituationDrawerOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                        style={{ backgroundColor: 'var(--app-surface-bg)' }}
                        aria-label="투자 컨디션 선택 닫기"
                      >
                        <X className="h-4 w-4" style={{ color: 'var(--app-icon-muted)' }} />
                      </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                      {situationOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedSituation === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSelectedSituation((current) => (current === option.id ? null : option.id));
                              setIsSituationDrawerOpen(false);
                            }}
                            className="relative w-full overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all"
                            style={{
                              borderWidth: isSelected ? '1px' : 'var(--app-hairline-border)',
                              borderStyle: 'solid',
                              borderColor: isSelected ? 'var(--app-accent-border-strong)' : 'var(--app-surface-border)',
                              background: isSelected
                                ? 'linear-gradient(135deg, var(--app-accent-surface) 0%, color-mix(in srgb, var(--app-surface-bg) 88%, transparent) 100%)'
                                : 'color-mix(in srgb, var(--app-surface-bg) 92%, transparent)',
                              boxShadow: isSelected
                                ? '0 18px 36px rgba(5, 7, 16, 0.22)'
                                : '0 12px 28px rgba(5, 7, 16, 0.12)',
                            }}
                          >
                            <div
                              className="absolute right-0 top-0 h-20 w-20 rounded-full blur-2xl"
                              style={{
                                background: isSelected ? 'var(--app-accent-glow)' : 'transparent',
                                opacity: 0.9,
                              }}
                            />
                            <div className="relative flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                                  style={{
                                    borderWidth: 'var(--app-hairline-border)',
                                    borderStyle: 'solid',
                                    borderColor: isSelected ? 'var(--app-accent-border)' : 'var(--app-surface-divider)',
                                    background: isSelected ? 'var(--app-accent-surface)' : 'var(--app-surface-bg)',
                                    color: isSelected ? 'var(--app-accent-text-strong)' : 'var(--app-icon-muted)',
                                  }}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div
                                    className="text-sm font-medium"
                                    style={{ color: isSelected ? 'var(--app-accent-text-strong)' : 'var(--app-text-soft)' }}
                                  >
                                    {option.label}
                                  </div>
                                  <div className="mt-1 text-xs" style={{ color: isSelected ? 'var(--app-accent-text-soft)' : 'var(--app-text-subtle)' }}>
                                    {option.score}점 반영
                                  </div>
                                </div>
                              </div>
                              <div
                                className="h-3 w-3 rounded-full border"
                                style={{
                                  borderWidth: 'var(--app-hairline-border)',
                                  borderStyle: 'solid',
                                  borderColor: isSelected ? 'var(--app-accent-border-strong)' : 'var(--app-surface-divider)',
                                  background: isSelected ? 'var(--app-accent-text-soft)' : 'transparent',
                                  boxShadow: isSelected ? '0 0 0 4px var(--app-accent-surface)' : 'none',
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
