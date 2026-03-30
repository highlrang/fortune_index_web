import { useMemo, useState } from 'react';
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
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import type { ConsultResponse, EvidenceFreshnessStatus } from '@/lib/api';
import { getCurrentUser, getLastConsultResult, hasPremiumConsultingAccess } from '@/lib/session';

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

const infoCardStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--app-info-border)',
  backgroundColor: 'var(--app-info-bg)',
};

const iconByKey = {
  market_analysis: TrendingUp,
  saju_analysis: Sparkles,
  tarot_analysis: Eye,
} as const;

const titleByMode = {
  ONLY_STOCK: '투자 운세 결과',
  STOCK_SAJU: '투자 사주 결과',
  STOCK_TAROT: '투자 타로 결과',
  STOCK_ALL: '투자 종합 결과',
} as const;

export function InvestmentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const hasPremiumAccess = hasPremiumConsultingAccess(currentUser);
  const consultResult =
    ((location.state as { consultResult?: ConsultResponse } | null)?.consultResult as ConsultResponse | undefined) ??
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
    return Math.max(0, 100 - consultResult.ai.riskScore);
  }, [consultResult]);
  const [isLiked, setIsLiked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const evidenceItems = useMemo(() => {
    if (!consultResult?.evidence) return [];

    return [
      { label: '시세 기준', value: consultResult.evidence.market?.asOf, status: consultResult.evidence.market?.status },
      { label: '평단 기준', value: consultResult.evidence.position?.asOf, status: consultResult.evidence.position?.status },
      { label: '뉴스 기준', value: consultResult.evidence.news?.asOf, status: consultResult.evidence.news?.status },
    ].filter((item) => item.value || item.status);
  }, [consultResult]);
  const sourceCount = consultResult?.evidence?.news?.sourceCount ?? consultResult?.evidence?.market?.sourceCount;
  const hasLimitedEvidence =
    consultResult?.progress?.includes('LIMITED_BY_STALE_DATA') ||
    consultResult?.evidence?.overallStatus === 'STALE' ||
    consultResult?.evidence?.overallStatus === 'UNAVAILABLE' ||
    consultResult?.limitations?.length;

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
              <h1 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{titleByMode[consultResult.mode]}</h1>
              <p className="text-xs" style={{ color: 'var(--app-accent-text-soft)' }}>{consultResult.stock.name}</p>
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
            {hasLimitedEvidence ? (
              <div className="mb-4 rounded-2xl p-5" style={dangerCardStyle}>
                <div className="flex items-start gap-3">
                  <div className="rounded-full border p-2" style={dangerCardStyle}>
                    <ShieldAlert className="h-4 w-4" style={{ color: 'var(--app-danger-text)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--app-danger-text)' }}>최신 근거가 충분하지 않아 답변이 제한되었습니다.</p>
                    <p className="mt-2 text-xs leading-6" style={{ color: 'var(--app-text-soft)' }}>
                      {consultResult.limitations?.[0]?.message ?? deriveLimitedMessage(consultResult)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate('/consultation', { state: { selectedType: 'market' } })}
                        className="rounded-full border px-4 py-2 text-xs"
                        style={dangerCardStyle}
                      >
                        다시 시도
                      </button>
                      <button
                        onClick={() => navigate('/consultation')}
                        className="rounded-full border px-4 py-2 text-xs"
                        style={subtleButtonStyle}
                      >
                        일반 조언 다시 보기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="relative overflow-hidden rounded-3xl p-8" style={accentCardStyle}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />

              <div className="relative">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: 'var(--tarot-point-color)' }} />
                  <h2 className="text-center text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--app-accent-text-soft)' }}>
                    투자 확신 점수
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

                <p className="text-center text-base font-medium" style={{ color: 'var(--app-text-soft)' }}>
                  {confidenceScore >= 80 ? '매우 긍정적인 흐름' : confidenceScore >= 60 ? '긍정적인 흐름' : '신중한 접근 필요'}
                </p>
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
                  <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--app-text-soft)' }}>{consultResult.ai.finalAdvice}</p>
                </div>

                {hasPremiumAccess && consultResult.thread?.id ? (
                  <div className="rounded-2xl p-4" style={infoCardStyle}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--app-info-text)' }}>
                      <Layers className="h-4 w-4" />
                      <p className="text-sm font-medium">이 상담 이어서 질문하기</p>
                    </div>
                    <p className="mt-2 text-xs leading-5" style={{ color: 'var(--app-text-soft)' }}>
                      이전 흐름은 이어지지만 시세, 뉴스, 평균단가는 다음 요청에서 다시 확인합니다.
                    </p>
                    <button
                      onClick={() =>
                        navigate('/consultation', {
                          state: {
                            resumeThreadId: consultResult.thread?.id,
                            resumeThreadTitle: consultResult.thread?.title ?? consultResult.stock.name,
                            resumeThreadStatus: consultResult.thread?.status ?? 'OPEN',
                          },
                        })
                      }
                      className="mt-4 rounded-full border px-4 py-2 text-xs"
                      style={infoCardStyle}
                    >
                      이어서 질문하기
                    </button>
                  </div>
                ) : null}

              </div>
            </div>
          </motion.div>

          {consultResult.evidence ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mb-6"
            >
              <div className="rounded-2xl p-6" style={glassCardStyle}>
                <div className="mb-4 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" style={{ color: 'var(--app-info-text)' }} />
                  <h3 className="text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>이번 답변의 근거</h3>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {consultResult.evidence.market?.status ? (
                    <EvidenceBadge label={getEvidenceBadgeLabel('market', consultResult.evidence.market.status)} status={consultResult.evidence.market.status} />
                  ) : null}
                  {consultResult.evidence.news?.status ? (
                    <EvidenceBadge label={getEvidenceBadgeLabel('news', consultResult.evidence.news.status)} status={consultResult.evidence.news.status} />
                  ) : null}
                  {consultResult.evidence.position?.status ? (
                    <EvidenceBadge label={getEvidenceBadgeLabel('position', consultResult.evidence.position.status)} status={consultResult.evidence.position.status} />
                  ) : null}
                </div>

                <div className="space-y-3 text-sm" style={{ color: 'var(--app-text-soft)' }}>
                  {evidenceItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--app-surface-bg-strong)' }}>
                      <span style={{ color: 'var(--app-text-muted)' }}>{item.label}</span>
                      <span className="text-right" style={{ color: 'var(--tarot-text-main)' }}>{formatEvidenceDate(item.value, item.status)}</span>
                    </div>
                  ))}
                  {sourceCount ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--app-surface-bg-strong)' }}>
                      <span style={{ color: 'var(--app-text-muted)' }}>출처</span>
                      <span style={{ color: 'var(--tarot-text-main)' }}>{sourceCount}건</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}

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
                        <p className="text-xs" style={{ color: 'var(--app-text-subtle)' }}>{section.key}</p>
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

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setIsLiked((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-90"
              style={iconButtonStyle}
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
                  <h3 className="mb-5 text-center text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>삭제 확인</h3>
                  <p className="text-center text-sm" style={{ color: 'var(--app-text-soft)' }}>이 투자 운세 결과를 닫고 홈으로 이동할까요?</p>

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

function EvidenceBadge({ label, status }: { label: string; status: EvidenceFreshnessStatus }) {
  return (
    <span className={`rounded-full border px-3 py-1.5 text-xs ${getEvidenceBadgeClass(status)}`}>
      {label}
    </span>
  );
}

function getEvidenceBadgeLabel(kind: 'market' | 'news' | 'position', status: EvidenceFreshnessStatus) {
  const target = kind === 'market' ? '실시간 시세' : kind === 'news' ? '최신 뉴스' : '평단 최신 조회';
  if (status === 'FRESH') return `${target} 반영`;
  if (status === 'PARTIAL') return `${target} 일부 반영`;
  if (status === 'STALE') return `${target} 지연`;
  return `${target} 미확인`;
}

function getEvidenceBadgeClass(status: EvidenceFreshnessStatus) {
  if (status === 'FRESH') return 'fi-status-badge-success';
  if (status === 'PARTIAL' || status === 'STALE') return 'fi-status-badge-warning';
  return 'fi-status-badge-danger';
}

function formatEvidenceDate(value?: string, status?: EvidenceFreshnessStatus) {
  if (!value) {
    return status === 'UNAVAILABLE' ? '조회 실패' : '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function deriveLimitedMessage(consultResult: ConsultResponse) {
  if (consultResult.evidence?.market?.status === 'UNAVAILABLE' || consultResult.evidence?.market?.status === 'STALE') {
    return '최신 시세를 확인하지 못해 지금 매수/매도 판단을 단정할 수 없습니다.';
  }
  if (consultResult.evidence?.news?.status === 'UNAVAILABLE' || consultResult.evidence?.news?.status === 'STALE') {
    return '최신 뉴스 근거를 확보하지 못해 이슈 기반 해석은 보류했습니다.';
  }
  if (consultResult.evidence?.position?.status === 'UNAVAILABLE' || consultResult.evidence?.position?.status === 'STALE') {
    return '평균단가 최신값을 읽지 못해 평단 기준 조언은 제공하지 않습니다.';
  }
  return '최신 근거가 충분하지 않아 투자 판단을 제한했습니다.';
}
