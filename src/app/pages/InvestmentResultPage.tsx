import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Eye,
  MoonStar,
  Heart,
  Clock,
  Trash2,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import { TarotCardDetailDialog } from '../components/TarotCardDetailDialog';
import {
  getTarotDeckCards,
  likeConsultingHistory,
  unlikeConsultingHistory,
  resolveApiAssetUrl,
  type ConsultResponse,
  type TarotDeckCardResponse,
} from '@/lib/api';
import { getCurrentUser, getLastConsultResult } from '@/lib/session';

type TarotResultCard = NonNullable<ConsultResponse['tarot']>['cards'][number];

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

const resultPanelStyle = {
  ...glassLayerStyle,
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--app-surface-bg) 88%, transparent) 0%, color-mix(in srgb, var(--app-surface-bg-strong) 76%, transparent) 100%)',
  borderColor: 'color-mix(in srgb, var(--app-surface-border) 82%, transparent)',
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.14)',
};

const iconButtonStyle = {
  ...glassCardStyle,
  color: 'var(--app-icon-muted)',
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


function getRiskToneLabel(score: number): string {
  if (score < 50) return "안 좋음";
  if (score < 70) return "중간";
  return "좋음";
}

function getRiskToneStyle(score: number) {
  if (score < 50) {
    return {
      backgroundColor: 'rgba(59, 130, 246, 0.14)',
      borderColor: 'rgba(96, 165, 250, 0.42)',
      color: 'rgb(147, 197, 253)',
      glowColor: 'rgba(59, 130, 246, 0.22)',
    };
  }

  if (score < 70) {
    return {
      backgroundColor: 'rgba(16, 185, 129, 0.14)',
      borderColor: 'rgba(52, 211, 153, 0.42)',
      color: 'rgb(110, 231, 183)',
      glowColor: 'rgba(16, 185, 129, 0.22)',
    };
  }

  return {
    backgroundColor: 'rgba(244, 114, 182, 0.12)',
    borderColor: 'rgba(251, 113, 133, 0.34)',
    color: 'rgb(253, 164, 175)',
    glowColor: 'rgba(244, 114, 182, 0.18)',
  };
}


const titleByMode = {
  INVESTMENT_SAJU: '사주 해석',
  INVESTMENT_TAROT: '타로 해석',
  INVESTMENT_ZODIAC: '별자리 해석',
  INVESTMENT_ALL: '종합 해석',
} as const;

function getScenarioLabel(scenario: NonNullable<ConsultResponse['history']['scenario']>) {
  if (scenario === 'TIMING_ENTRY') return '매수 타이밍';
  if (scenario === 'TIMING_EXIT') return '매도 타이밍';
  if (scenario === 'SAJU_MATCH') return '나와 맞는 자산';
  if (scenario === 'RESCUE_PLAN') return '손실 회복 전략';
  if (scenario === 'MENTAL_GUIDE') return '투자 멘탈 가이드';
  return scenario;
}

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
    if (!consultResult || typeof consultResult.ai?.riskScore !== "number") return null;
    return Math.min(100, Math.max(0, consultResult.ai.riskScore));
  }, [consultResult]);
  const tarotCards = consultResult?.tarot?.cards ?? [];
  const tarotDeckVersionId = tarotCards[0]?.deckVersionId;
  const tarotSelectedIndicesKey = tarotCards.map((card) => card.selectedIndex).join(',');

  const [isLiked, setIsLiked] = useState(Boolean(navigationState?.initialLiked));
  const [likePending, setLikePending] = useState(false);
  const [likeError, setLikeError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTarotCard, setSelectedTarotCard] = useState<TarotResultCard | null>(null);
  const [tarotCardMetadata, setTarotCardMetadata] = useState<Map<number, TarotDeckCardResponse>>(new Map());

  useEffect(() => {
    setIsLiked(Boolean(navigationState?.initialLiked));
  }, [navigationState?.initialLiked, consultResult?.history?.id]);

  useEffect(() => {
    if (!tarotDeckVersionId || tarotCards.length === 0) {
      setTarotCardMetadata(new Map());
      return;
    }

    let active = true;
    const selectedIndices = tarotCards.map((card) => card.selectedIndex);

    getTarotDeckCards(tarotDeckVersionId, selectedIndices)
      .then((response) => {
        if (!active) return;

        setTarotCardMetadata(
          new Map(response.map((card) => [card.selectedIndex, card])),
        );
      })
      .catch(() => {
        if (!active) return;
        setTarotCardMetadata(new Map());
      });

    return () => {
      active = false;
    };
  }, [tarotDeckVersionId, tarotSelectedIndicesKey]);


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
        <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center px-6 text-center">
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
  const scenarioLabel = consultResult.history?.scenario ? getScenarioLabel(consultResult.history.scenario) : '';
  const question = consultResult.history?.question?.trim() ?? '';
  const hasConsultContext = Boolean(scenarioLabel || question);
  const riskToneStyle = typeof riskScore === 'number' ? getRiskToneStyle(riskScore) : null;
  const selectedTarotCardMetadata =
    selectedTarotCard ? tarotCardMetadata.get(selectedTarotCard.selectedIndex) : undefined;
  const selectedTarotCardDetail = selectedTarotCard
    ? {
        label: selectedTarotCard.koreanName ?? selectedTarotCardMetadata?.koreanName ?? selectedTarotCardMetadata?.name ?? selectedTarotCard.name,
        meaning: selectedTarotCardMetadata?.meaning ?? selectedTarotCard.meaning,
        description: selectedTarotCardMetadata?.description ?? selectedTarotCard.description,
        imageSrc: resolveApiAssetUrl(selectedTarotCardMetadata?.imageUrl) || resolveApiAssetUrl(selectedTarotCard.imageUrl),
        videoSrc: resolveApiAssetUrl(selectedTarotCardMetadata?.videoUrl) || resolveApiAssetUrl(selectedTarotCard.videoUrl) || undefined,
      }
    : null;
  const handleBack = () => {
    if (location.key === 'default') {
      navigate('/home');
      return;
    }

    navigate(-1);
  };

  return (
    <div className="fi-mobile-screen" style={pageGradientStyle}>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-a)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-b)' }} />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col">
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
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-90"
              style={iconButtonStyle}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="text-center">
              <h1 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{resultTitle}</h1>
              <p className="text-xs" style={{ color: 'var(--app-accent-text-soft)' }}>{focusLabel}</p>
            </div>

            <div className="h-10 w-10" aria-hidden="true" />
          </div>
        </div>

        <div className="fi-mobile-scroll px-6 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] pt-4">
          {typeof riskScore === "number" && riskToneStyle ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-4"
            >
              <div
                className="relative overflow-hidden rounded-2xl px-5 py-4"
                style={{
                  ...glassCardStyle,
                  boxShadow: `0 14px 36px ${riskToneStyle.glowColor}`,
                }}
              >
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${riskToneStyle.glowColor} 0%, transparent 72%)` }} />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: riskToneStyle.color }}>투자 컨디션</p>
                  </div>
                  <div
                    className="flex shrink-0 items-baseline gap-1 rounded-full border px-3 py-2"
                    style={{
                      backgroundColor: riskToneStyle.backgroundColor,
                      borderColor: riskToneStyle.borderColor,
                    }}
                  >
                    <span className="text-lg font-semibold" style={{ color: riskToneStyle.color }}>{riskScore}</span>
                    <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>/100 · {getRiskToneLabel(riskScore)}</span>
                  </div>
                </div>
                <div className="relative mt-4 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.14)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${riskScore}%`,
                      backgroundColor: riskToneStyle.color,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}

          {hasConsultContext ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.45 }}
              className="mb-4"
            >
              <div className="relative overflow-hidden rounded-xl p-4" style={resultPanelStyle}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--app-text-subtle)' }}>
                      나의 질문
                    </p>
                    {scenarioLabel ? (
                      <span
                        className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
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

                  {question ? (
                    <p className="text-sm leading-6" style={{ color: 'var(--app-text-soft)' }}>{question}</p>
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
            <div className="relative overflow-hidden rounded-xl p-5" style={resultPanelStyle}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />

              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={accentButtonStyle}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase" style={{ color: 'var(--app-text-subtle)' }}>Core Summary</p>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>오늘의 핵심 요약</h3>
                  </div>
                </div>

                <p className="text-sm leading-7" style={{ color: 'var(--app-text-soft)' }}>{finalAdvice}</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              >
                <div className="relative overflow-hidden rounded-xl p-5" style={resultPanelStyle}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--app-surface-highlight) 0%, transparent 72%)' }} />

                  <div className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={accentButtonStyle}>
                        <section.icon className="h-[18px] w-[18px]" />
                      </div>
                      <div>
                        <p className="text-[11px]" style={{ color: 'var(--app-text-subtle)' }}>해석</p>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{section.title}</h3>
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-7" style={{ color: 'var(--app-text-soft)' }}>{section.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {consultResult.tarot?.cards?.length ? (
            <div className="mt-8 rounded-2xl p-5" style={glassCardStyle}>
              <h3 className="mb-4 text-base font-semibold" style={{ color: "var(--tarot-text-main)" }}>선택된 타로 카드</h3>
              <div className="grid grid-cols-3 gap-3">
                {consultResult.tarot.cards.map((card) => {
                  const metadata = tarotCardMetadata.get(card.selectedIndex);
                  const imageSrc = resolveApiAssetUrl(metadata?.imageUrl) || resolveApiAssetUrl(card.imageUrl);
                  const cardLabel = card.koreanName ?? metadata?.koreanName ?? metadata?.name ?? card.name;

                  return (
                    <button
                      key={`${card.code}-${card.selectedIndex}`}
                      type="button"
                      onClick={() => setSelectedTarotCard(card)}
                      className="min-w-0 rounded-xl text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--tarot-point-color)] focus:ring-offset-2 focus:ring-offset-transparent"
                      aria-label={`${cardLabel} 상세 정보 보기`}
                    >
                      <div
                        className="relative aspect-[2/3] overflow-hidden rounded-xl border"
                        style={{
                          borderColor: "var(--tarot-card-cover-border)",
                          background:
                            "linear-gradient(145deg, var(--tarot-card-cover-start) 0%, var(--tarot-card-cover-mid) 52%, var(--tarot-card-cover-end) 100%)",
                          boxShadow: "0 8px 18px rgba(0, 0, 0, 0.22)",
                        }}
                      >
                        {imageSrc ? (
                          <img src={imageSrc} alt={cardLabel} className="block h-full w-full object-cover opacity-100" loading="lazy" />
                        ) : (
                          <div className="flex h-full items-center justify-center px-3 text-center text-xs" style={{ color: "var(--tarot-card-sigil)" }}>
                            {cardLabel}
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 rounded-xl border" style={{ borderColor: "color-mix(in srgb, var(--tarot-card-cover-border) 48%, transparent)" }} />
                      </div>
                    </button>
                  );
                })}
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

          <TarotCardDetailDialog
            card={selectedTarotCardDetail}
            eyebrow="Selected Tarot Card"
            open={selectedTarotCard !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedTarotCard(null);
            }}
          />
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
