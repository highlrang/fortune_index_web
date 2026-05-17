import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Eye,
  MoonStar,
  Share2,
  Heart,
  Clock,
  Trash2,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import { InvestmentDisclaimer } from '../components/InvestmentDisclaimer';
import {
  getDailyRiskIndex,
  likeConsultingHistory,
  unlikeConsultingHistory,
  type ConsultResponse,
} from '@/lib/api';
import { getCurrentUser, getLastConsultResult } from '@/lib/session';

const pageGradientStyle = {
  background:
    'linear-gradient(135deg, var(--tarot-ambient-start) 0%, var(--tarot-ambient-mid) 52%, var(--tarot-ambient-end) 100%)',
};

const glassLayerStyle = {
  borderStyle: 'solid' as const,
  borderWidth: 'var(--app-hairline-border)',
  backdropFilter: 'var(--app-card-blur)',
  WebkitBackdropFilter: 'var(--app-card-blur)',
};

const glassCardStyle = {
  ...glassLayerStyle,
  backgroundColor: 'var(--app-surface-bg)',
  borderColor: 'var(--app-surface-border)',
};

const iconButtonStyle = {
  ...glassCardStyle,
  color: 'var(--app-icon-muted)',
};

const accentCardStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--app-accent-border)',
  background:
    'linear-gradient(135deg, var(--app-accent-soft) 0%, color-mix(in srgb, var(--app-accent-glow) 45%, transparent) 100%)',
};

const accentButtonStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--app-accent-border)',
  backgroundColor: 'var(--app-accent-soft)',
  color: 'var(--app-accent-text-strong)',
};

const subtleButtonStyle = {
  ...glassCardStyle,
  color: 'var(--app-text-muted)',
};

const dangerCardStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--app-danger-border)',
  backgroundColor: 'var(--app-danger-bg)',
};

const iconByKey = {
  investment_analysis: TrendingUp,
  saju_analysis: Sparkles,
  tarot_analysis: Eye,
  zodiac_analysis: MoonStar,
} as const;

function getRiskGaugeColor(score: number): string {
  if (score < 30) return '#3B82F6';
  if (score < 50) return '#22C55E';
  if (score < 70) return '#F97316';
  return '#EF4444';
}

const titleByMode = {
  INVESTMENT_SAJU: '사주 해석',
  INVESTMENT_TAROT: '타로 해석',
  INVESTMENT_ZODIAC: '별자리 해석',
  INVESTMENT_ALL: '종합 해석',
} as const;

export function InvestmentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const navigationState = location.state as { consultResult?: ConsultResponse; initialLiked?: boolean } | null;
  const consultResult =
    (navigationState?.consultResult as ConsultResponse | undefined) ??
    getLastConsultResult<ConsultResponse>();

  const sections = useMemo(() => {
    if (!consultResult) return [];

    return Object.entries(consultResult.ai.analysisResults)
      .filter(([, value]) => value?.content)
      .map(([key, value]) => ({
        key,
        title: value.title,
        content: value.content,
        icon: iconByKey[key as keyof typeof iconByKey] ?? Sparkles,
      }));
  }, [consultResult]);

  const riskScore = useMemo(() => {
    if (!consultResult || typeof consultResult.ai?.riskScore !== 'number') return null;
    return Math.min(100, Math.max(0, consultResult.ai.riskScore));
  }, [consultResult]);

  const [energyLabel, setEnergyLabel] = useState('');
  const [isLiked, setIsLiked] = useState(Boolean(navigationState?.initialLiked));
  const [likePending, setLikePending] = useState(false);
  const [likeError, setLikeError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setIsLiked(Boolean(navigationState?.initialLiked));
  }, [navigationState?.initialLiked, consultResult?.history?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    getDailyRiskIndex(currentUser.id)
      .then((data) => setEnergyLabel(data.energyLabel))
      .catch(() => {});
  }, [currentUser?.id]);

  const handleLikeToggle = async () => {
    if (!currentUser?.id || !consultResult?.history?.id || likePending) return;

    setLikePending(true);
    setLikeError('');

    try {
      const response = isLiked
        ? await unlikeConsultingHistory(currentUser.id, consultResult.history.id)
        : await likeConsultingHistory(currentUser.id, consultResult.history.id);
      setIsLiked(response.liked);
    } catch (error) {
      setLikeError(error instanceof Error ? error.message : '좋아요 상태를 변경하지 못했습니다.');
    } finally {
      setLikePending(false);
    }
  };

  if (!consultResult) {
    return (
      <div className="fi-mobile-screen" style={pageGradientStyle}>
        <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 text-lg" style={{ color: 'var(--tarot-text-main)' }}>표시할 상담 결과가 없습니다.</p>
          <button
            onClick={() => navigate('/consultation')}
            className="rounded-full border px-5 py-3 text-sm"
            style={accentButtonStyle}
          >
            상담하러 가기
          </button>
        </div>
      </div>
    );
  }

  const resultTitle = titleByMode[consultResult.mode] ?? '오늘의 해석';
  const focusLabel = consultResult.focus?.label ?? '오늘의 흐름';
  const finalAdvice =
    consultResult.ai?.finalAdvice ?? consultResult.history?.overallSummary ?? '상담 결과를 불러왔지만 요약 문구가 없습니다.';
  const historyId = consultResult.history?.id;

  return (
    <div className="fi-mobile-screen" style={pageGradientStyle}>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-a)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-b)' }} />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-md flex-col">
        <div
          className="z-50 px-6 py-4"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--bg-main) 92%, transparent) 0%, transparent 100%)',
            backdropFilter: 'var(--app-card-blur)',
            WebkitBackdropFilter: 'var(--app-card-blur)',
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/home')}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-90"
              style={iconButtonStyle}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="text-center">
              <h1 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{resultTitle}</h1>
              <p className="text-xs" style={{ color: 'var(--app-accent-text-soft)' }}>{focusLabel}</p>
            </div>

            <button className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-90" style={iconButtonStyle}>
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="fi-mobile-scroll px-6 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] pt-4">
          {typeof riskScore === 'number' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="relative overflow-hidden rounded-3xl p-6" style={accentCardStyle}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />

                <div className="relative">
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5" style={{ color: 'var(--tarot-point-color)' }} />
                    <h2 className="text-center text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--app-accent-text-soft)' }}>
                      오늘의 자산 운용 에너지 긴장도
                    </h2>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-4xl font-bold" style={{ color: 'var(--tarot-text-main)' }}>{riskScore}</span>
                    <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>/ 100</span>
                  </div>

                  <div className="mb-3 h-3 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${riskScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ backgroundColor: getRiskGaugeColor(riskScore) }}
                    />
                  </div>

                  {energyLabel ? (
                    <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{energyLabel}</p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-6"
          >
            <div className="relative overflow-hidden rounded-2xl p-6" style={glassCardStyle}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />

              <div className="relative space-y-4">
                <h3 className="text-center text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>오늘의 핵심 요약</h3>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={accentButtonStyle}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--app-text-soft)' }}>{finalAdvice}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              >
                <div className="relative overflow-hidden rounded-2xl p-6" style={glassCardStyle}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />

                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={accentButtonStyle}>
                        <section.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{section.title}</h3>
                        <p className="text-xs" style={{ color: 'var(--app-text-subtle)' }}>해석</p>
                      </div>
                    </div>

                    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--app-surface-bg-strong)' }}>
                      <p className="whitespace-pre-wrap text-sm leading-7" style={{ color: 'var(--app-text-soft)' }}>{section.content}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {consultResult.tarot?.cards?.length ? (
            <div className="mt-8 rounded-2xl p-6" style={glassCardStyle}>
              <h3 className="mb-4 text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>선택된 타로 카드</h3>
              <div className="flex flex-wrap gap-2">
                {consultResult.tarot.cards.map((card) => (
                  <span
                    key={`${card.code}-${card.selectedIndex}`}
                    className="rounded-full border px-3 py-2 text-xs"
                    style={accentButtonStyle}
                  >
                    {card.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {likeError ? (
            <div className="mt-8 rounded-2xl px-4 py-3 text-sm" style={dangerCardStyle}>
              <span style={{ color: 'var(--app-danger-text)' }}>{likeError}</span>
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleLikeToggle}
              disabled={!currentUser?.id || !historyId || likePending}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-90"
              style={{
                ...iconButtonStyle,
                opacity: !currentUser?.id || !historyId || likePending ? 0.6 : 1,
              }}
            >
              <Heart className="h-4 w-4" style={{ color: isLiked ? 'var(--tarot-point-color)' : 'var(--app-icon-muted)' }} />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-90"
                style={iconButtonStyle}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate('/consultation-history')}
                className="rounded-full border px-5 py-3 text-sm"
                style={accentButtonStyle}
              >
                상담 내역 보기
              </button>
            </div>
          </div>

          <InvestmentDisclaimer className="mt-8" text={consultResult.disclaimer} />

          {showDeleteConfirm ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'var(--app-modal-backdrop)' }}>
              <div className="relative overflow-hidden rounded-2xl p-6" style={glassCardStyle}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />

                <div className="relative">
                  <h3 className="mb-5 text-center text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>닫기 확인</h3>
                  <p className="text-center text-sm" style={{ color: 'var(--app-text-soft)' }}>이 해석을 닫고 홈으로 돌아갈까요?</p>

                  <div className="mt-6 flex items-center justify-center space-x-4">
                    <button
                      className="flex h-8 w-24 items-center justify-center rounded-xl border text-sm font-medium"
                      style={accentButtonStyle}
                      onClick={() => navigate('/home')}
                    >
                      확인
                    </button>

                    <button
                      className="flex h-8 w-24 items-center justify-center rounded-xl border text-sm font-medium"
                      style={subtleButtonStyle}
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
