import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Sparkles, TrendingUp, Eye, ChevronRight, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import {
  getHistoryDetail,
  getHistoryList,
  type ConsultResponse,
  type ConsultingHistoryListItemResponse,
  type SharedConsultingHistoryResponse,
} from '@/lib/api';
import { getCurrentUser } from '@/lib/session';

export type ConsultationType = '투자 운세' | '투자 타로 운세' | '투자 사주 운세' | '투자 종합 운세';

export function ConsultationHistoryPage() {
  const navigate = useNavigate();
  const currentUserId = getCurrentUser()?.id ?? null;
  const [items, setItems] = useState<ConsultingHistoryListItemResponse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openingHistoryId, setOpeningHistoryId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<ConsultationType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  useEffect(() => {
    let active = true;

    if (!currentUserId) {
      setError('로그인 후 상담 내역을 확인할 수 있습니다.');
      setLoading(false);
      return;
    }

    setError('');
    setLoading(true);

    getHistoryList(currentUserId)
      .then((response) => {
        if (!active) return;
        setItems(response);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : '상담 내역을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUserId]);

  const handleOpenHistory = async (historyId: number) => {
    if (!currentUserId || openingHistoryId !== null) return;

    setOpeningHistoryId(historyId);
    setError('');

    try {
      const detail = await getHistoryDetail(historyId, currentUserId);
      navigate('/investment-result', {
        state: { consultResult: mapHistoryDetailToConsultResult(detail) },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '상담 결과를 불러오지 못했습니다.');
    } finally {
      setOpeningHistoryId(null);
    }
  };

  const consultationTypes: Array<ConsultationType | 'all'> = [
    'all',
    '투자 운세',
    '투자 타로 운세',
    '투자 사주 운세',
    '투자 종합 운세',
  ];

  const filteredItems = useMemo(() => {
    const base =
      filterType === 'all' ? items : items.filter((item) => mapModeToLabel(item.mode) === filterType);

    return [...base].sort((a, b) => {
      if (sortOrder === 'oldest') return a.consultedAt.localeCompare(b.consultedAt);
      return b.consultedAt.localeCompare(a.consultedAt);
    });
  }, [filterType, items, sortOrder]);

  const groupedItems = useMemo(() => groupByDate(filteredItems, sortOrder), [filteredItems, sortOrder]);

  return (
    <div className="fi-page min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-50 px-6 pb-4 pt-5">
          <div className="mb-4 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-lg font-semibold fi-text-main">상담 내역</h1>
              <p className="text-xs fi-text-accent">Consultation History</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fi-glass relative overflow-hidden rounded-2xl p-4"
            style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

            <div className="relative space-y-3">
              <div>
                <label className="mb-2 block text-xs font-medium fi-text-muted">상담 종류</label>
                <div className="flex flex-wrap gap-2">
                  {consultationTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className="rounded-full border px-4 py-2 text-xs font-medium transition-all"
                      style={
                        filterType === type
                          ? {
                              borderColor: 'var(--app-accent-border-strong)',
                              background: 'var(--app-accent-surface)',
                              color: 'var(--app-accent-text-soft)',
                              backdropFilter: 'var(--card-blur)',
                              WebkitBackdropFilter: 'var(--card-blur)',
                            }
                          : {
                              borderColor: 'var(--card-border)',
                              background: 'var(--card-surface)',
                              color: 'var(--app-text-muted)',
                              backdropFilter: 'var(--card-blur)',
                              WebkitBackdropFilter: 'var(--card-blur)',
                            }
                      }
                    >
                      {type === 'all' ? '전체' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium fi-text-muted">정렬</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSortOrder('latest')}
                    className="rounded-full border px-4 py-2 text-xs font-medium transition-all"
                    style={
                      sortOrder === 'latest'
                        ? {
                            borderColor: 'var(--app-accent-border-strong)',
                            background: 'var(--app-accent-surface)',
                            color: 'var(--app-accent-text-soft)',
                            backdropFilter: 'var(--card-blur)',
                            WebkitBackdropFilter: 'var(--card-blur)',
                          }
                        : {
                            borderColor: 'var(--card-border)',
                            background: 'var(--card-surface)',
                            color: 'var(--app-text-muted)',
                            backdropFilter: 'var(--card-blur)',
                            WebkitBackdropFilter: 'var(--card-blur)',
                          }
                    }
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    className="rounded-full border px-4 py-2 text-xs font-medium transition-all"
                    style={
                      sortOrder === 'oldest'
                        ? {
                            borderColor: 'var(--app-accent-border-strong)',
                            background: 'var(--app-accent-surface)',
                            color: 'var(--app-accent-text-soft)',
                            backdropFilter: 'var(--card-blur)',
                            WebkitBackdropFilter: 'var(--card-blur)',
                          }
                        : {
                            borderColor: 'var(--card-border)',
                            background: 'var(--card-surface)',
                            color: 'var(--app-text-muted)',
                            backdropFilter: 'var(--card-blur)',
                            WebkitBackdropFilter: 'var(--card-blur)',
                          }
                    }
                  >
                    오래된순
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs fi-text-subtle">
                  총 <span className="font-semibold fi-text-accent">{filteredItems.length}</span>건
                </span>
                {filterType !== 'all' && (
                  <button
                    onClick={() => setFilterType('all')}
                    className="flex items-center gap-1 text-xs fi-text-accent transition-colors hover:opacity-80"
                  >
                    <X className="h-3 w-3" />
                    필터 초기화
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-6 pb-24 pt-4">
          {loading ? <p className="text-center text-sm fi-text-muted">상담 내역을 불러오는 중...</p> : null}

          {error ? (
            <div className="fi-danger rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          {!loading && !error && groupedItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="fi-glass mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <Calendar className="h-10 w-10" style={{ color: 'var(--glow-purple)' }} />
              </div>
              <h3 className="mb-2 text-lg font-semibold fi-text-main">상담 내역이 없습니다</h3>
              <p className="text-sm fi-text-muted">
                {filterType !== 'all' ? '해당 조건의 상담 내역이 없습니다' : '첫 상담을 시작해보세요'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {groupedItems.map(([date, group], dateIndex) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dateIndex * 0.1 }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="fi-accent-card flex h-10 w-10 items-center justify-center rounded-full">
                      <Calendar className="h-5 w-5 fi-text-accent" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold fi-text-main">{formatDate(date)}</h2>
                      <p className="text-xs fi-text-subtle">{group.length}건의 상담</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.map((item, itemIndex) => {
                      const typeLabel = mapModeToLabel(item.mode);
                      const TypeIcon = getTypeIcon(item.mode);
                      const colorClass = getTypeColor(typeLabel);
                      return (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: dateIndex * 0.1 + itemIndex * 0.05 }}
                          onClick={() => handleOpenHistory(item.id)}
                          className="fi-glass group relative w-full overflow-hidden rounded-2xl p-5 text-left transition-all hover:opacity-95"
                          style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

                          <div className="relative">
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colorClass}`}
                                >
                                  <TypeIcon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="mb-1 text-base font-semibold fi-text-main">{typeLabel}</h3>
                                  <div className="flex items-center gap-2 text-xs fi-text-subtle">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(item.consultedAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              <ChevronRight className="h-4 w-4 fi-text-subtle transition-transform group-hover:translate-x-1" />
                            </div>

                            <div className="mb-3 flex flex-wrap gap-2">
                              <span className="fi-badge rounded-full px-3 py-1 text-xs">
                                {item.stockName}
                              </span>
                              {item.tarotCardNames.map((cat) => (
                                <span
                                  key={`${item.id}-${cat}`}
                                  className="fi-badge rounded-full px-3 py-1 text-xs"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-end gap-1 text-xs fi-text-accent transition-colors group-hover:opacity-80">
                              <span>{openingHistoryId === item.id ? '불러오는 중...' : '자세히 보기'}</span>
                              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation activeTab="consult" />
    </div>
  );
}

function groupByDate(items: ConsultingHistoryListItemResponse[], sortOrder: 'latest' | 'oldest') {
  const groups: Record<string, ConsultingHistoryListItemResponse[]> = {};

  items.forEach((item) => {
    const date = item.consultedAt.slice(0, 10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });

  return Object.entries(groups).sort((a, b) =>
    sortOrder === 'oldest' ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]),
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return '오늘';
  if (dateStr === yesterdayStr) return '어제';

  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

function mapModeToLabel(mode: ConsultingHistoryListItemResponse['mode']): ConsultationType {
  if (mode === 'STOCK_TAROT') return '투자 타로 운세';
  if (mode === 'STOCK_SAJU') return '투자 사주 운세';
  if (mode === 'STOCK_ALL') return '투자 종합 운세';
  return '투자 운세';
}

function getTypeIcon(mode: ConsultingHistoryListItemResponse['mode']) {
  if (mode === 'STOCK_TAROT') return Eye;
  if (mode === 'STOCK_SAJU') return Sparkles;
  return TrendingUp;
}

function getTypeColor(type: ConsultationType) {
  if (type.includes('타로')) return 'from-purple-500/20 to-violet-600/20 text-purple-400';
  if (type.includes('사주')) return 'from-amber-500/20 to-orange-600/20 text-amber-400';
  return 'from-emerald-500/20 to-green-600/20 text-emerald-400';
}

function mapHistoryDetailToConsultResult(detail: SharedConsultingHistoryResponse): ConsultResponse {
  return {
    mode: detail.mode,
    stock: {
      code: detail.stock.ticker,
      name: detail.stock.companyName,
      currentPrice: detail.stock.marketPrice,
      changeRate: detail.stock.changeRate,
      sector: '-',
      fallback: false,
    },
    saju: detail.saju
      ? {
          dayMaster: { symbol: '-', fiveElement: '-', yinYang: '-' },
          dayBranch: { symbol: '-', fiveElement: '-', yinYang: '-' },
          monthBranch: { symbol: '-', fiveElement: '-', yinYang: '-' },
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
        tarot_analysis: { title: '타로 분석', content: detail.tarotAnalysisText ?? '' },
        saju_analysis: { title: '사주 분석', content: detail.sajuAnalysisText ?? '' },
      },
      finalAdvice: detail.aiAnswerText,
      riskScore: 0,
      rawJson: detail.aiResponseJson,
    },
    history: {
      id: detail.id,
      userId: detail.userId,
      shareKey: detail.shareKey,
      consultedAt: detail.consultedAt,
      aiAnswerText: detail.aiAnswerText,
      marketAnalysisText: detail.marketAnalysisText,
      tarotAnalysisText: detail.tarotAnalysisText,
      sajuAnalysisText: detail.sajuAnalysisText,
    },
    thread: {
      id: detail.threadId,
      title: detail.stock.companyName,
      lastQuestionSummary: detail.question,
      lastAnsweredAt: detail.consultedAt,
      status: detail.threadStatus,
      lastEvidenceUpdatedAt: detail.lastEvidenceUpdatedAt,
      expiresAt: detail.expiresAt,
      canResume: Boolean(detail.threadId) && (detail.threadStatus === 'OPEN' || detail.threadStatus === 'EXPIRING_SOON'),
    },
    evidence: detail.evidence,
    limitations: detail.limitations,
  };
}
