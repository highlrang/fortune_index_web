import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Eye,
  Share2,
  Heart,
  Clock,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import {
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
} as const;

const titleByMode = {
  INVESTMENT_SAJU: '사주 해석',
  INVESTMENT_TAROT: '타로 해석',
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

  const confidenceScore = useMemo(() => {
    if (!consultResult) return 78;
    return Math.max(0, 100 - (consultResult.ai?.riskScore ?? 22));
  }, [consultResult]);

  const evidenceSummary = useMemo(() => {
    if (!consultResult) return [];

    return [
      consultResult.investmentEvidence.investmentAsOf
        ? { label: '투자 데이터 시각', value: formatDateTime(consultResult.investmentEvidence.investmentAsOf) }
        : null,
      consultResult.investmentEvidence.positionAsOf
        ? { label: '내 정보 반영 시각', value: formatDateTime(consultResult.investmentEvidence.positionAsOf) }
        : null,
      consultResult.investmentEvidence.newsAsOf
        ? { label: '뉴스 반영 시각', value: formatDateTime(consultResult.investmentEvidence.newsAsOf) }
        : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;
  }, [consultResult]);

  const [isLiked, setIsLiked] = useState(Boolean(navigationState?.initialLiked));
  const [likePending, setLikePending] = useState(false);
  const [likeError, setLikeError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setIsLiked(Boolean(navigationState?.initialLiked));
  }, [navigationState?.initialLiked, consultResult?.history?.id]);

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
      <div className="min-h-screen" style={pageGradientStyle}>
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
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
  const focusValue = formatCurrentValue(consultResult.focus?.currentValue);
  const changeRate = formatChangeRate(consultResult.focus?.changeRate);
  const finalAdvice =
    consultResult.ai?.finalAdvice ?? consultResult.history?.aiAnswerText ?? '상담 결과를 불러왔지만 요약 문구가 없습니다.';
  const historyId = consultResult.history?.id;

  return (
    <div className="min-h-screen overflow-auto" style={pageGradientStyle}>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-a)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-b)' }} />
      </div>

      <div className="relative z-10">
        <div
          className="sticky top-0 z-50 px-6 py-4"
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

        <div className="px-6 pb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-3xl p-8" style={accentCardStyle}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />

              <div className="relative">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: 'var(--tarot-point-color)' }} />
                  <h2 className="text-center text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--app-accent-text-soft)' }}>
                    오늘의 자신감
                  </h2>
                </div>

                <div className="mb-3 flex items-center justify-center">
                  <div
                    className="relative flex h-40 w-40 items-center justify-center rounded-full border-4"
                    style={{
                      borderColor: 'var(--app-accent-border-strong)',
                      background:
                        'linear-gradient(135deg, var(--app-accent-soft) 0%, color-mix(in srgb, var(--app-accent-glow) 35%, transparent) 100%)',
                    }}
                  >
                    <div className="text-center">
                      <span className="text-6xl font-bold" style={{ color: 'var(--tarot-text-main)' }}>{confidenceScore}</span>
                      <span className="ml-2 text-2xl" style={{ color: 'var(--app-text-muted)' }}>점</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-base font-medium" style={{ color: 'var(--app-text-soft)' }}>
                    {confidenceScore >= 80 ? '마음 편히 가도 좋은 흐름' : confidenceScore >= 60 ? '차분하게 가면 괜찮은 흐름' : '조금 천천히 보는 편이 좋아요'}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: 'var(--app-accent-text-soft)' }}>
                    {focusValue ? `${focusLabel} ${focusValue}` : focusLabel}
                    {changeRate ? ` · ${changeRate}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mb-6"
          >
            <div className="rounded-2xl p-6" style={glassCardStyle}>
              <div className="mb-4 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" style={{ color: 'var(--app-info-text)' }} />
                <h3 className="text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>참고 근거</h3>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <EvidenceBadge label={consultResult.investmentEvidence.priceFresh ? '가격 최신' : '가격 지연'} />
                <EvidenceBadge label={consultResult.investmentEvidence.newsFresh ? '뉴스 최신' : '뉴스 지연'} />
                <EvidenceBadge label={consultResult.investmentEvidence.positionFresh ? '내 정보 최신' : '내 정보 지연'} />
              </div>

              <div className="space-y-3 text-sm" style={{ color: 'var(--app-text-soft)' }}>
                {evidenceSummary.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--app-surface-bg-strong)' }}>
                    <span style={{ color: 'var(--app-text-muted)' }}>{item.label}</span>
                    <span className="text-right" style={{ color: 'var(--tarot-text-main)' }}>{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--app-surface-bg-strong)' }}>
                  <span style={{ color: 'var(--app-text-muted)' }}>출처 수</span>
                  <span style={{ color: 'var(--tarot-text-main)' }}>{consultResult.investmentEvidence.citations.length}건</span>
                </div>
                {consultResult.investmentEvidence.staleReasons.length > 0 ? (
                  <div className="rounded-xl px-4 py-3 text-sm" style={dangerCardStyle}>
                    {consultResult.investmentEvidence.staleReasons.join(' · ')}
                  </div>
                ) : null}
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

function EvidenceBadge({ label }: { label: string }) {
  return <span className="fi-status-badge-success rounded-full border px-3 py-1.5 text-xs">{label}</span>;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatCurrentValue(value?: number | null) {
  if (typeof value !== 'number') return null;
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChangeRate(value?: number | null) {
  if (typeof value !== 'number') return null;
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}
