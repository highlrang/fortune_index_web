import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, ChevronRight, Clock, X, Heart, Search, Star, Coins, HandCoins } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import {
  getHistoryDetail,
  getHistoryList,
  getLikedConsultingHistories,
  type ConsultingHistoryListItemResponse,
} from '@/lib/api';
import { mapHistoryDetailToConsultResult } from '@/lib/consultHistory';
import { getCurrentUser } from '@/lib/session';

export type ConsultationType =
  | '재물 흐름'
  | '타로 재물 흐름'
  | '사주 재물 흐름'
  | '별자리 재물 흐름'
  | '종합 재물 흐름';
type LikeFilter = 'all' | 'liked';

const activeChipStyle = {
  borderColor: 'var(--app-accent-border-strong)',
  background: 'var(--app-accent-surface)',
  color: 'var(--app-accent-text-soft)',
  backdropFilter: 'var(--card-blur)',
  WebkitBackdropFilter: 'var(--card-blur)',
};

const inactiveChipStyle = {
  borderColor: 'var(--card-border)',
  background: 'var(--card-surface)',
  color: 'var(--app-text-muted)',
  backdropFilter: 'var(--card-blur)',
  WebkitBackdropFilter: 'var(--card-blur)',
};

const activeSegmentStyle = {
  background: 'var(--app-accent-soft)',
  color: 'var(--app-accent-text-strong)',
};

const inactiveSegmentStyle = {
  color: 'var(--app-text-muted)',
};

export function ConsultationHistoryPage() {
  const navigate = useNavigate();
  const currentUserId = getCurrentUser()?.id ?? null;
  const [items, setItems] = useState<ConsultingHistoryListItemResponse[]>([]);
  const [likedHistoryIds, setLikedHistoryIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openingHistoryId, setOpeningHistoryId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<ConsultationType | 'all'>('all');
  const [likeFilter, setLikeFilter] = useState<LikeFilter>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;

    if (!currentUserId) {
      setError('로그인 후 상담 내역을 확인할 수 있습니다.');
      setLoading(false);
      return;
    }

    setError('');
    setLoading(true);

    Promise.all([
      getHistoryList(currentUserId),
      getLikedConsultingHistories(currentUserId, { page: 0, size: 200 }),
    ])
      .then(([historyResponse, likedResponse]) => {
        if (!active) return;
        setItems(historyResponse);
        setLikedHistoryIds((likedResponse.content ?? []).map((item) => item.id));
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
        state: { consultResult: mapHistoryDetailToConsultResult(detail), source: 'history' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '상담 결과를 불러오지 못했습니다.');
    } finally {
      setOpeningHistoryId(null);
    }
  };

  const consultationTypes: Array<ConsultationType | 'all'> = [
    'all',
    '재물 흐름',
    '타로 재물 흐름',
    '사주 재물 흐름',
    '별자리 재물 흐름',
    '종합 재물 흐름',
  ];

  const filteredItems = useMemo(() => {
    const likedIdSet = new Set(likedHistoryIds);
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const typeFiltered =
      filterType === 'all' ? items : items.filter((item) => mapModeToLabel(item.mode) === filterType);
    const likedFiltered =
      likeFilter === 'liked' ? typeFiltered.filter((item) => likedIdSet.has(item.id)) : typeFiltered;
    const base = normalizedQuery
      ? likedFiltered.filter((item) => {
          const scenarioLabel = item.scenario ? getScenarioLabel(item.scenario) : '';
          const searchableText = [
            mapModeToLabel(item.mode),
            scenarioLabel,
            item.focusLabel,
            item.question,
            item.overallSummary,
            item.consultedAt,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return searchableText.includes(normalizedQuery);
        })
      : likedFiltered;

    return [...base].sort((a, b) => {
      if (sortOrder === 'oldest') return a.consultedAt.localeCompare(b.consultedAt);
      return b.consultedAt.localeCompare(a.consultedAt);
    });
  }, [filterType, items, likeFilter, likedHistoryIds, searchQuery, sortOrder]);

  const hasActiveFilters = filterType !== 'all' || likeFilter !== 'all' || searchQuery.trim().length > 0;
  const selectedTypeLabel = filterType === 'all' ? '전체 유형' : getShortTypeLabel(filterType);

  return (
    <div className="fi-page min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md">
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
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fi-text-subtle" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="질문, 요약, 유형 검색"
                  className="w-full rounded-2xl border py-3 pl-10 pr-10 text-sm outline-none transition-all"
                  style={{
                    borderColor: 'var(--card-border)',
                    background: 'var(--app-surface-bg-strong)',
                    color: 'var(--tarot-text-main)',
                  }}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full"
                    style={{ color: 'var(--app-text-muted)' }}
                    aria-label="검색어 지우기"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {consultationTypes.map((type) => {
                  const isActive = filterType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className="h-9 rounded-xl border px-2 text-xs font-medium transition-all"
                      style={isActive ? activeChipStyle : inactiveChipStyle}
                    >
                      {type === 'all' ? '전체' : getShortTypeLabel(type)}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setLikeFilter((value) => (value === 'liked' ? 'all' : 'liked'))}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all"
                  style={likeFilter === 'liked' ? activeChipStyle : inactiveChipStyle}
                >
                  <Heart className={`h-3.5 w-3.5 ${likeFilter === 'liked' ? 'fill-current' : ''}`} />
                  좋아요
                </button>

                <div className="flex rounded-full border p-0.5" style={{ borderColor: 'var(--card-border)', background: 'var(--card-surface)' }}>
                  <button
                    onClick={() => setSortOrder('latest')}
                    className="h-8 rounded-full px-3 text-xs font-medium transition-all"
                    style={sortOrder === 'latest' ? activeSegmentStyle : inactiveSegmentStyle}
                  >
                    최신
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    className="h-8 rounded-full px-3 text-xs font-medium transition-all"
                    style={sortOrder === 'oldest' ? activeSegmentStyle : inactiveSegmentStyle}
                  >
                    오래된
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--app-surface-border)' }}>
                <span className="text-xs fi-text-subtle">
                  {selectedTypeLabel} · <span className="font-semibold fi-text-accent">{filteredItems.length}</span>건
                </span>
                {hasActiveFilters ? (
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setLikeFilter('all');
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-1 text-xs fi-text-accent transition-colors hover:opacity-80"
                  >
                    <X className="h-3 w-3" />
                    초기화
                  </button>
                ) : null}
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

          {!loading && !error && filteredItems.length === 0 ? (
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
                {filterType !== 'all' || likeFilter !== 'all'
                  ? '해당 조건의 상담 내역이 없습니다'
                  : '첫 상담을 시작해보세요'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, itemIndex) => {
                const typeLabel = mapModeToLabel(item.mode);
                const TypeIcon = getTypeIcon(item.mode);
                const colorClass = getTypeColor(typeLabel);
                const isLiked = likedHistoryIds.includes(item.id);
                const isOpening = openingHistoryId === item.id;
                const scenarioLabel = item.scenario ? getScenarioLabel(item.scenario) : '';

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.035 }}
                    onClick={() => handleOpenHistory(item.id)}
                    disabled={isOpening}
                    className="group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--app-surface-border) 82%, transparent)',
                      background:
                        'linear-gradient(180deg, color-mix(in srgb, var(--app-surface-bg) 88%, transparent) 0%, color-mix(in srgb, var(--app-surface-bg-strong) 78%, transparent) 100%)',
                      boxShadow: '0 10px 26px rgba(0, 0, 0, 0.12)',
                      backdropFilter: 'var(--app-card-blur)',
                      WebkitBackdropFilter: 'var(--app-card-blur)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

                    <div className="relative space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <HistoryTypeBadge colorClass={colorClass} Icon={TypeIcon} />
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <h3 className="truncate text-sm font-semibold fi-text-main">{typeLabel}</h3>
                              {isLiked ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-300">
                                  <Heart className="h-3 w-3 fill-current" />
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs fi-text-subtle">
                              <Clock className="h-3 w-3" />
                              <span>{formatHistoryDateTime(item.consultedAt)}</span>
                              {scenarioLabel ? (
                                <span
                                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
                                  style={{
                                    borderColor: 'var(--app-accent-border)',
                                    backgroundColor: 'var(--app-accent-soft)',
                                    color: 'var(--app-accent-text-strong)',
                                  }}
                                >
                                  {scenarioLabel}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 fi-text-subtle transition-transform group-hover:translate-x-1" />
                      </div>

                      {item.question ? (
                        <p
                          className="text-sm fi-text-main"
                          style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                          }}
                        >
                          {item.question}
                        </p>
                      ) : null}

                      <p
                        className="text-sm leading-relaxed fi-text-muted"
                        style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          overflow: 'hidden',
                        }}
                      >
                        {item.overallSummary}
                      </p>

                      <div className="flex items-center justify-end gap-1 text-xs fi-text-accent transition-colors group-hover:opacity-80">
                        <span>{isOpening ? '불러오는 중...' : '상세 보기'}</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation activeTab="consult" />
    </div>
  );
}

function formatHistoryDateTime(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const targetDateStr = dateStr.slice(0, 10);
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (targetDateStr === todayStr) return `오늘 ${time}`;
  if (targetDateStr === yesterdayStr) return `어제 ${time}`;

  const isDifferentYear = date.getFullYear() !== today.getFullYear();

  if (isDifferentYear) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`;
}

function mapModeToLabel(mode: ConsultingHistoryListItemResponse['mode']): ConsultationType {
  if (mode === 'INVESTMENT_TAROT') return '타로 재물 흐름';
  if (mode === 'INVESTMENT_SAJU') return '사주 재물 흐름';
  if (mode === 'INVESTMENT_ZODIAC') return '별자리 재물 흐름';
  if (mode === 'INVESTMENT_ALL') return '종합 재물 흐름';
  return '재물 흐름';
}

function getShortTypeLabel(type: ConsultationType) {
  if (type.includes('타로')) return '타로';
  if (type.includes('사주')) return '사주';
  if (type.includes('별자리')) return '별자리';
  if (type.includes('종합')) return '종합';
  return '재물';
}

function getTypeIcon(mode: ConsultingHistoryListItemResponse['mode']) {
  if (mode === 'INVESTMENT_TAROT') return Coins;
  if (mode === 'INVESTMENT_SAJU') return HandCoins;
  if (mode === 'INVESTMENT_ZODIAC') return Star;
  return TrendingUp;
}

function HistoryTypeBadge({
  colorClass,
  Icon,
}: {
  colorClass: string;
  Icon: ReturnType<typeof getTypeIcon>;
}) {
  return (
    <div
      className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colorClass}`}
    >
      <Icon className="h-[18px] w-[18px]" />
    </div>
  );
}

function getTypeColor(type: ConsultationType) {
  if (type.includes('타로')) return 'from-purple-500/20 to-violet-600/20 text-purple-400';
  if (type.includes('사주')) return 'from-amber-500/20 to-orange-600/20 text-amber-400';
  if (type.includes('별자리')) return 'from-sky-500/20 to-blue-600/20 text-sky-400';
  return 'from-red-500/20 to-rose-600/20 text-red-400';
}

function getScenarioLabel(scenario: NonNullable<ConsultingHistoryListItemResponse['scenario']>) {
  if (scenario === 'FLOW_CHECK') return '흐름';
  if (scenario === 'ENTRY_READY') return '시작';
  if (scenario === 'HOLD_OR_EXIT') return '정리';
  if (scenario === 'MENTAL_CARE') return '회복';
  return scenario;
}
