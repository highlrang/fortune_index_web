import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, TrendingUp, Sparkles, Eye, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import {
  getHistoryDetail,
  getLikedConsultingHistories,
  unlikeConsultingHistory,
  type ConsultResponse,
  type ConsultingHistorySummaryResponse,
  type SharedConsultingHistoryResponse,
} from '@/lib/api';
import { getCurrentUser } from '@/lib/session';

type FortuneType = '투자 운세' | '투자 타로 운세' | '투자 사주 운세' | '투자 종합 운세';

export function LikedFortunesPage() {
  const navigate = useNavigate();
  const currentUserId = getCurrentUser()?.id ?? null;
  const [fortunes, setFortunes] = useState<ConsultingHistorySummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openingHistoryId, setOpeningHistoryId] = useState<number | null>(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    if (!currentUserId) {
      setError('로그인 후 좋아요한 운세를 확인할 수 있습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    getLikedConsultingHistories(currentUserId, { page: 0, size: 20 })
      .then((response) => {
        if (!active) return;
        setFortunes(response.content ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : '좋아요한 운세를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUserId]);

  const visibleFortunes = useMemo(
    () => fortunes.filter((fortune) => fortune.feedback === 'HELPFUL'),
    [fortunes],
  );

  const getTypeIcon = (type: FortuneType) => {
    switch (type) {
      case '투자 타로 운세':
        return <Eye className="h-5 w-5" />;
      case '투자 사주 운세':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: FortuneType) => {
    switch (type) {
      case '투자 타로 운세':
        return 'from-purple-500/20 to-violet-600/20 border-purple-500/30 fi-status-text-info';
      case '투자 사주 운세':
        return 'from-amber-500/20 to-orange-600/20 border-amber-500/30 fi-status-text-warning';
      default:
        return 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 fi-status-text-success';
    }
  };

  const handleDelete = async (historyId: number) => {
    if (!currentUserId || deletingHistoryId !== null) return;

    setDeletingHistoryId(historyId);
    setError('');

    try {
      await unlikeConsultingHistory(currentUserId, historyId);
      setFortunes((current) => current.filter((item) => item.id !== historyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : '좋아요를 취소하지 못했습니다.');
    } finally {
      setDeletingHistoryId(null);
    }
  };

  const handleFortuneClick = async (fortune: ConsultingHistorySummaryResponse) => {
    if (!currentUserId || openingHistoryId !== null) return;

    setOpeningHistoryId(fortune.id);
    setError('');

    try {
      const detail = await getHistoryDetail(fortune.id, currentUserId);
      navigate('/investment-result', {
        state: {
          consultResult: mapHistoryDetailToConsultResult(detail),
          initialLiked: true,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '운세 상세를 불러오지 못했습니다.');
    } finally {
      setOpeningHistoryId(null);
    }
  };

  return (
    <div className="fi-page min-h-screen pb-24">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-50 px-6 py-4 backdrop-blur-xl" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--bg-main) 94%, transparent) 0%, transparent 100%)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/my')}
              className="fi-icon-button flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold fi-text-main">좋아요한 운세</h1>
              <p className="text-xs fi-text-accent">Liked Fortunes</p>
            </div>

            <div className="w-10" />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          {loading ? <p className="text-center text-sm fi-text-muted">좋아요한 운세를 불러오는 중...</p> : null}

          {error ? (
            <div className="fi-danger mb-4 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          {!loading && visibleFortunes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Heart className="h-10 w-10 fi-text-subtle" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold fi-text-main">좋아요한 운세가 없습니다</h3>
              <p className="text-sm fi-text-muted">
                운세 결과에서 하트 버튼을 눌러<br />
                저장해보세요
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {visibleFortunes.map((fortune, index) => {
                const fortuneType = mapModeToFortuneType(fortune);
                return (
                  <motion.div
                    key={fortune.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="fi-glass group relative overflow-hidden rounded-2xl p-5 transition-all hover:opacity-95"
                    style={{
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

                    <div className="relative">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br backdrop-blur-xl ${getTypeColor(fortuneType)}`}>
                            {getTypeIcon(fortuneType)}
                          </div>
                          <div>
                            <h3 className="font-semibold fi-text-main">{fortuneType}</h3>
                            <div className="mt-1 flex items-center gap-2 text-xs fi-text-muted">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(fortune.consultedAt)}
                            </div>
                          </div>
                        </div>

                        {typeof fortune.currentValue === 'number' ? (
                          <div className="fi-badge flex items-center gap-2 rounded-full px-3 py-1">
                            <span className="text-sm font-bold fi-text-accent">{formatCurrentValue(fortune.currentValue)}</span>
                          </div>
                        ) : null}
                      </div>

                      <p className="mb-4 text-sm leading-relaxed fi-text-muted">
                        {buildSummary(fortune)}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => void handleFortuneClick(fortune)}
                          disabled={openingHistoryId === fortune.id}
                          className="fi-cta flex-1 rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
                        >
                          {openingHistoryId === fortune.id ? '불러오는 중...' : '자세히 보기'}
                        </button>
                        <button
                          onClick={() => void handleDelete(fortune.id)}
                          disabled={deletingHistoryId === fortune.id}
                          className="fi-glass flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-red-500/10 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4 fi-text-muted group-hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

function mapModeToFortuneType(fortune: ConsultingHistorySummaryResponse): FortuneType {
  if (fortune.tarotCardNames.length > 0 && fortune.scenario === 'SAJU_MATCH') {
    return '투자 종합 운세';
  }
  if (fortune.scenario === 'SAJU_MATCH') return '투자 사주 운세';
  if (fortune.tarotCardNames.length > 0) return '투자 타로 운세';
  return '투자 운세';
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatCurrentValue(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChangeRate(value?: number | null) {
  if (typeof value !== 'number') return null;
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function buildSummary(fortune: ConsultingHistorySummaryResponse) {
  const parts = [
    fortune.selectedFocusLabel ? `대상: ${fortune.selectedFocusLabel}` : null,
    formatChangeRate(fortune.changeRate) ? `변동률: ${formatChangeRate(fortune.changeRate)}` : null,
    fortune.tarotCardNames.length ? `카드: ${fortune.tarotCardNames.join(', ')}` : null,
  ].filter(Boolean);

  return parts.join(' · ') || '저장된 운세입니다.';
}

function mapHistoryDetailToConsultResult(detail: SharedConsultingHistoryResponse): ConsultResponse {
  return {
    mode: detail.mode,
    focus: {
      label: detail.focus.label,
      currentValue: detail.focus.currentValue,
      changeRate: detail.focus.changeRate,
      interestArea: detail.focus.label,
      fallback: false,
    },
    saju: detail.saju
      ? {
          analysis: {
            natalChart: {},
            keyPalaces: {},
            characters: [],
            tenGods: [],
            fiveElementBalance: {
              wood: detail.saju.wood,
              fire: detail.saju.fire,
              earth: detail.saju.earth,
              metal: detail.saju.metal,
              water: detail.saju.water,
            },
            yinYangBalance: { yinCount: 0, yangCount: 0, totalCount: 0 },
            annualFortune: {},
            majorFortune: {},
          },
          dayMaster: { symbol: '-', fiveElement: '-', yinYang: '-' },
          dayBranch: { symbol: '-', fiveElement: '-', yinYang: '-' },
          monthBranch: { symbol: '-', fiveElement: '-', yinYang: '-' },
          currentFortune: {},
        }
      : undefined,
    tarot: detail.tarot
      ? {
          interpretationMode: detail.tarot.interpretationMode ?? 'MAIN_TRADITIONAL',
          cards: detail.tarot.cards.map((card) => ({
            selectedIndex: card.selectedIndex,
            code: card.code,
            deckType: card.deckType as 'TAROT' | 'ORACLE',
            name: card.name,
            sortOrder: card.sortOrder,
            arcanaType: card.arcanaType,
            suit: card.suit,
            meaning: card.meaning,
            imageUrl: card.imageUrl ?? '',
            videoUrl: card.videoUrl,
          })),
        }
      : undefined,
    ai: {
      provider: '-',
      model: '-',
      mode: detail.mode,
      analysisResults: {
        investment_analysis: { title: '투자 분석', content: detail.investmentAnalysisText ?? '' },
        tarot_analysis: { title: '타로 분석', content: detail.tarotAnalysisText ?? '' },
        saju_analysis: { title: '사주 분석', content: detail.sajuAnalysisText ?? '' },
      },
      finalAdvice: detail.aiAnswerText,
      riskScore: 0,
      rawJson: detail.aiResponseJson,
      evidence: {
        grounded: false,
        citations: [],
      },
    },
    history: {
      ...detail,
    },
    investmentEvidence: {
      routing: {
        requiresInvestmentData: false,
        requiresFortuneFlowData: false,
        requiresSymbolQuote: false,
        requiresPositionData: false,
        requiresWebSearch: false,
        questionType: '',
        reason: '',
      },
      priceFresh: false,
      positionFresh: false,
      newsFresh: false,
      investmentDataUsed: false,
      investmentFlowDataUsed: false,
      symbolQuoteUsed: false,
      positionDataUsed: false,
      webSearchUsed: false,
      grounded: false,
      citations: [],
      staleReasons: [],
    },
  };
}
