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
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 text-lg text-white">표시할 상담 결과가 없습니다.</p>
          <button
            onClick={() => navigate('/consultation')}
            className="rounded-full border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-sm text-amber-200"
          >
            상담하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-auto bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-50 bg-gradient-to-b from-indigo-950/95 via-indigo-900/90 to-transparent px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/home')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 text-white/60" />
            </button>

            <div className="text-center">
              <h1 className="text-lg font-semibold text-white">{titleByMode[consultResult.mode]}</h1>
              <p className="text-xs text-[#D4AF37]/70">{consultResult.stock.name}</p>
            </div>

            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10">
              <Share2 className="h-4 w-4 text-white/60" />
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
              <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="rounded-full border border-rose-400/30 bg-rose-500/10 p-2">
                    <ShieldAlert className="h-4 w-4 text-rose-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rose-50">최신 근거가 충분하지 않아 답변이 제한되었습니다.</p>
                    <p className="mt-2 text-xs leading-6 text-rose-100/80">
                      {consultResult.limitations?.[0]?.message ?? deriveLimitedMessage(consultResult)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate('/consultation', { state: { selectedType: 'market' } })}
                        className="rounded-full border border-rose-300/30 bg-rose-400/10 px-4 py-2 text-xs text-rose-50"
                      >
                        다시 시도
                      </button>
                      <button
                        onClick={() => navigate('/consultation')}
                        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/75"
                      >
                        일반 조언 다시 보기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-purple-900/40 via-violet-800/30 to-purple-900/40 p-8 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.05]" />

              <div className="relative">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                  <h2 className="text-center text-sm font-medium uppercase tracking-wider text-[#D4AF37]">
                    투자 확신 점수
                  </h2>
                </div>

                <div className="mb-3 flex items-center justify-center">
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-amber-600/15 to-[#D4AF37]/20">
                    <div className="text-center">
                      <span className="text-6xl font-bold text-white">{confidenceScore}</span>
                      <span className="ml-2 text-2xl text-white/60">점</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-base font-medium text-white/80">
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
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

              <div className="relative space-y-4">
                <h3 className="text-center text-base font-semibold text-white">오늘의 핵심 요약</h3>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20">
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-white/80">{consultResult.ai.finalAdvice}</p>
                </div>

                {hasPremiumAccess && consultResult.thread?.id ? (
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
                    <div className="flex items-center gap-2 text-cyan-100">
                      <Layers className="h-4 w-4" />
                      <p className="text-sm font-medium">이 상담 이어서 질문하기</p>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-cyan-50/75">
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
                      className="mt-4 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-50"
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
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-cyan-200" />
                  <h3 className="text-base font-semibold text-white">이번 답변의 근거</h3>
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

                <div className="space-y-3 text-sm text-white/75">
                  {evidenceItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-black/10 px-4 py-3">
                      <span className="text-white/60">{item.label}</span>
                      <span className="text-right text-white">{formatEvidenceDate(item.value, item.status)}</span>
                    </div>
                  ))}
                  {sourceCount ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-black/10 px-4 py-3">
                      <span className="text-white/60">출처</span>
                      <span className="text-white">{sourceCount}건</span>
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
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-6 backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-amber-600/20">
                        <section.icon className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                        <p className="text-xs text-white/50">{section.key}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-sm leading-7 text-white/70 whitespace-pre-wrap">{section.content}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {consultResult.tarot?.cards?.length ? (
            <div className="mt-8 rounded-2xl border border-purple-400/20 bg-purple-500/5 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold text-white">선택된 타로 카드</h3>
              <div className="flex flex-wrap gap-2">
                {consultResult.tarot.cards.map((card) => (
                  <span
                    key={`${card.code}-${card.selectedIndex}`}
                    className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs text-purple-200"
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'text-[#D4AF37]' : 'text-white/60'}`} />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4 text-white/60" />
              </button>

              <button
                onClick={() => navigate('/consultation-history')}
                className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-3 text-sm text-[#D4AF37]"
              >
                상담 내역 보기
              </button>
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-6 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

                <div className="relative">
                  <h3 className="mb-5 text-center text-base font-semibold text-white">삭제 확인</h3>
                  <p className="text-center text-sm text-white/80">이 투자 운세 결과를 닫고 홈으로 이동할까요?</p>

                  <div className="mt-6 flex items-center justify-center space-x-4">
                    <button
                      className="flex h-8 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/20 via-amber-600/15 to-[#D4AF37]/20 text-sm font-medium text-white"
                      onClick={() => navigate('/home')}
                    >
                      확인
                    </button>

                    <button
                      className="flex h-8 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/20 via-amber-600/15 to-[#D4AF37]/20 text-sm font-medium text-white"
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
  if (status === 'FRESH') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100';
  if (status === 'PARTIAL') return 'border-amber-400/30 bg-amber-500/10 text-amber-100';
  if (status === 'STALE') return 'border-orange-400/30 bg-orange-500/10 text-orange-100';
  return 'border-rose-400/30 bg-rose-500/10 text-rose-100';
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
