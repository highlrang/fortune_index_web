import { motion } from 'motion/react';
import { ArrowRight, Layers, MoonStar, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { pickConsultationQuestion } from '@/lib/consultPrompts';
import {
  ApiError,
  getHomeDailyTarotDraw,
  resolveApiAssetUrl,
  type ConsultScenario,
  type HomeDailyTarotDrawResponse,
} from '@/lib/api';
import { getSelectedTarotDeckId } from '@/lib/tarot';
import { TarotCardDetailDialog, TarotCardFallbackFace } from './TarotCardDetailDialog';

type ConsultationType = 'saju' | 'tarot' | 'zodiac' | 'comprehensive';

type QuickPrompt = {
  id: string;
  type: ConsultationType;
  label: string;
  scenario: ConsultScenario;
  accentColor: string;
};

const quickPromptTemplates: QuickPrompt[] = [
  {
    id: 'saju-match',
    type: 'saju',
    label: '사주',
    scenario: 'ENTRY_READY',
    accentColor: 'rgba(251, 191, 36, 0.18)',
  },
  {
    id: 'tarot-entry',
    type: 'tarot',
    label: '타로',
    scenario: 'ENTRY_READY',
    accentColor: 'rgba(217, 70, 239, 0.16)',
  },
  {
    id: 'zodiac-guide',
    type: 'zodiac',
    label: '별자리',
    scenario: 'FLOW_CHECK',
    accentColor: 'rgba(96, 165, 250, 0.16)',
  },
  {
    id: 'all-rescue',
    type: 'comprehensive',
    label: '종합',
    scenario: 'MENTAL_CARE',
    accentColor: 'rgba(251, 113, 133, 0.16)',
  },
];

const tarotCardPositions = [
  'translate-y-4 rotate-[-10deg]',
  '-translate-y-1',
  'translate-y-4 rotate-[10deg]',
];

const dailyTarotReadingLabels = [
  '오늘의 흐름',
  '신경 쓸 포인트',
  '오늘의 조언',
] as const;

const dailyTarotCardFrameStyle = {
  borderColor: 'var(--tarot-card-cover-border)',
  backgroundColor: 'var(--bg-main)',
};

const dailyTarotCardCaptionStyle = {
  borderWidth: 'var(--app-hairline-border)',
  borderStyle: 'solid' as const,
  borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 65%, transparent)',
  backgroundColor: 'color-mix(in srgb, var(--bg-main) 52%, transparent)',
  backdropFilter: 'var(--app-card-blur)',
  WebkitBackdropFilter: 'var(--app-card-blur)',
};

type HomeTarotDisplayCard = {
  index: number;
  selectedIndex: number;
  label: string;
  meaning: string;
  description?: string;
  imageSrc?: string;
  videoSrc?: string;
};

function HomeTarotCardBackPattern() {
  return (
    <svg className="h-full w-full" viewBox="0 0 100 140">
      <polygon
        points="50,20 75,35 75,65 50,80 25,65 25,35"
        fill="none"
        stroke="var(--tarot-card-sigil)"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <polygon
        points="50,30 68,42 68,58 50,70 32,58 32,42"
        fill="none"
        stroke="var(--tarot-card-sigil)"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <circle cx="50" cy="50" r="5" fill="var(--tarot-card-sigil)" opacity="0.42" />
      <circle cx="50" cy="50" r="2.5" fill="var(--tarot-card-sigil)" opacity="0.62" />
      <circle cx="50" cy="15" r="2" fill="var(--tarot-card-sigil-soft)" opacity="0.42" />
      <circle cx="50" cy="85" r="2" fill="var(--tarot-card-sigil-soft)" opacity="0.42" />
      <line x1="50" y1="50" x2="50" y2="20" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.3" />
      <line x1="50" y1="50" x2="75" y2="35" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.3" />
      <line x1="50" y1="50" x2="75" y2="65" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.3" />
      <line x1="50" y1="50" x2="50" y2="80" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.3" />
      <line x1="50" y1="50" x2="25" y2="65" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.3" />
      <line x1="50" y1="50" x2="25" y2="35" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.3" />
      <text x="50" y="120" fontSize="7" fill="var(--tarot-card-sigil-soft)" opacity="0.28" textAnchor="middle" fontFamily="serif">
        메이저
      </text>
    </svg>
  );
}

function HomeTarotSpreadCardFace() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center p-3.5">
        <HomeTarotCardBackPattern />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(115deg, transparent 18%, rgba(255,255,255,0.1) 45%, transparent 58%)' }}
      />
    </div>
  );
}

function mapDailyDrawCards(draw: HomeDailyTarotDrawResponse | null): HomeTarotDisplayCard[] {
  if (!draw?.cards.length) return [];

  return [...draw.cards]
    .sort((left, right) => left.index - right.index)
    .map(({ index, card }) => ({
      index,
      selectedIndex: card.selectedIndex,
      label: card.koreanName ?? card.name,
      meaning: card.meaning,
      description: card.description,
      imageSrc: resolveApiAssetUrl(card.imageUrl),
      videoSrc: resolveApiAssetUrl(card.videoUrl) || undefined,
    }));
}

function getDailyDrawErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return '로그인이 만료됐어요. 다시 로그인해주세요.';
    if (error.status === 403) return '현재 계정에서는 홈 카드 뽑기를 이용할 수 없어요.';
  }

  return '카드를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
}

function getDailyDrawErrorStatus(error: unknown) {
  return error instanceof ApiError ? error.status : null;
}

function getDailyTarotReadingLabel(card: HomeTarotDisplayCard | null) {
  if (!card) return '';
  return dailyTarotReadingLabels[card.index] ?? '오늘의 카드';
}

function DailyTarotCardFace({ card, isFeatured }: { card: HomeTarotDisplayCard; isFeatured: boolean }) {
  return (
    <div
      className="relative h-32 overflow-hidden rounded-[22px] border"
      style={{
        ...dailyTarotCardFrameStyle,
        boxShadow: isFeatured
          ? '0 0 28px var(--tarot-card-cover-glow), 0 20px 45px -30px var(--app-accent-glow)'
          : '0 0 18px color-mix(in srgb, var(--tarot-card-cover-glow) 65%, transparent), 0 16px 36px -30px rgba(0,0,0,0.45)',
      }}
    >
      {card.videoSrc ? (
        <video
          key={card.videoSrc}
          src={card.videoSrc}
          className="block h-full w-full object-cover opacity-100"
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
        />
      ) : card.imageSrc ? (
        <img
          src={card.imageSrc}
          alt={card.label}
          className="block h-full w-full object-cover opacity-100"
        />
      ) : (
        <TarotCardFallbackFace className="h-full w-full" />
      )}

      {card.videoSrc ? <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.18)' }} /> : null}

      <div className="absolute inset-x-2 bottom-2 rounded-xl px-2 py-1.5" style={dailyTarotCardCaptionStyle}>
        <p className="truncate text-[11px] font-semibold leading-tight" style={{ color: 'var(--tarot-text-main)' }}>
          {card.label}
        </p>
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--tarot-card-cover-glow) 48%, transparent) 0%, transparent 30%, color-mix(in srgb, var(--tarot-card-cover-glow) 36%, transparent) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-2 rounded-[16px] border"
        style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 72%, transparent)' }}
      />
    </div>
  );
}

export function HomeFortuneJourneySection() {
  const navigate = useNavigate();
  const [homeTarotDraw, setHomeTarotDraw] = useState<HomeDailyTarotDrawResponse | null>(null);
  const [selectedCard, setSelectedCard] = useState<HomeTarotDisplayCard | null>(null);
  const [isTarotDrawLoading, setIsTarotDrawLoading] = useState(true);
  const [tarotDrawError, setTarotDrawError] = useState('');
  const [tarotDrawErrorStatus, setTarotDrawErrorStatus] = useState<number | null>(null);
  const quickPrompts = useMemo(
    () =>
      quickPromptTemplates.map((prompt) => ({
        ...prompt,
        question: pickConsultationQuestion(prompt.scenario, prompt.type),
      })),
    [],
  );
  const drawnCards = useMemo(() => mapDailyDrawCards(homeTarotDraw), [homeTarotDraw]);
  const canDrawTarot = Boolean(homeTarotDraw?.canDraw);
  const canRetryTarotDraw = Boolean(tarotDrawError && tarotDrawErrorStatus !== 401 && tarotDrawErrorStatus !== 403);
  const shouldPromptLogin = tarotDrawErrorStatus === 401;
  const isTarotButtonDisabled =
    isTarotDrawLoading ||
    (!canDrawTarot && !canRetryTarotDraw && !shouldPromptLogin);

  useEffect(() => {
    let active = true;

    getHomeDailyTarotDraw()
      .then((draw) => {
        if (!active) return;
        setHomeTarotDraw(draw);
        setTarotDrawError('');
        setTarotDrawErrorStatus(null);
      })
      .catch((error) => {
        if (!active) return;
        setTarotDrawError(getDailyDrawErrorMessage(error));
        setTarotDrawErrorStatus(getDailyDrawErrorStatus(error));
      })
      .finally(() => {
        if (!active) return;
        setIsTarotDrawLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleDailyTarotDraw = () => {
    if (isTarotButtonDisabled) return;

    if (shouldPromptLogin) {
      navigate('/login');
      return;
    }

    if (canRetryTarotDraw) {
      setIsTarotDrawLoading(true);
      setTarotDrawError('');
      setTarotDrawErrorStatus(null);

      getHomeDailyTarotDraw()
        .then((draw) => {
          setHomeTarotDraw(draw);
        })
        .catch((error) => {
          setTarotDrawError(getDailyDrawErrorMessage(error));
          setTarotDrawErrorStatus(getDailyDrawErrorStatus(error));
        })
        .finally(() => {
          setIsTarotDrawLoading(false);
        });
      return;
    }

    navigate('/tarot-picker', {
      state: {
        homeDailyDraw: true,
        tarotDeckVersionId: homeTarotDraw?.deckVersionId ?? getSelectedTarotDeckId(),
      },
    });
  };

  return (
    <section className="fi-glass relative overflow-hidden rounded-3xl px-5 py-6 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
      <div className="absolute -right-10 top-0 h-36 w-36 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />

      <div className="relative">
        <div className="mb-5">
          <h2 className="mt-2 text-xl font-semibold fi-text-main">오늘은 어떻게 볼까요?</h2>
          <p className="mt-2 text-sm leading-6 fi-text-muted">
            질문을 바로 고르거나, 카드 3장을 뽑아 오늘 기운을 먼저 볼 수 있습니다.
          </p>
        </div>

        <div
          className="mb-5 space-y-0 divide-y divide-white/5 overflow-hidden rounded-2xl border"
          style={{
            borderWidth: 'var(--app-hairline-border)',
            borderStyle: 'solid',
            borderColor: 'var(--card-border)',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'var(--card-blur)',
            WebkitBackdropFilter: 'var(--card-blur)',
          }}
        >
          {quickPrompts.map((prompt) => {
            const Icon =
              prompt.type === 'saju'
                ? Star
                : prompt.type === 'tarot'
                  ? Sparkles
                  : prompt.type === 'zodiac'
                    ? MoonStar
                    : Layers;

            return (
              <button
                key={prompt.id}
                type="button"
                onClick={() =>
                  navigate('/consultation', {
                    state: {
                      selectedType: prompt.type,
                      selectedScenario: prompt.scenario,
                      question: prompt.question,
                    },
                  })
                }
                className="relative w-full overflow-hidden px-4 py-4 text-left transition-colors hover:bg-white/[0.03]"
              >
                <div
                  className="pointer-events-none absolute -left-8 top-0 h-full w-[85%] rounded-full blur-2xl"
                  style={{ background: prompt.accentColor }}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border" style={{ borderColor: 'var(--app-accent-border-strong)', background: 'var(--app-accent-surface)' }}>
                      <Icon className="h-5 w-5" style={{ color: 'var(--app-accent-text-soft)' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] fi-text-subtle">{prompt.label}</p>
                      <p className="mt-1 text-sm leading-6 fi-text-main">{prompt.question}</p>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 fi-text-muted" />
                </div>
              </button>
            );
          })}
        </div>

        <motion.div
          className="overflow-hidden rounded-[28px] border px-5 py-5"
          style={{
            borderWidth: 'var(--app-hairline-border)',
            borderStyle: 'solid',
            borderColor: 'var(--app-accent-border-strong)',
            background:
              'linear-gradient(145deg, color-mix(in srgb, var(--app-accent-soft) 42%, transparent) 0%, color-mix(in srgb, var(--bg-main) 88%, transparent) 100%)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="mt-2 text-lg font-semibold fi-text-main">오늘의 타로 바로 뽑기</h3>
              <p className="mt-2 text-sm leading-6 fi-text-muted">
                세 장의 카드를 오늘의 흐름, 신경 쓸 포인트, 오늘의 조언으로 가볍게 읽어볼 수 있어요.
              </p>
            </div>
          </div>

          {drawnCards.length ? (
            <div className="mb-5 py-3">
              <div className="flex items-start justify-center gap-3">
                {drawnCards.map((card, index) => (
                  <motion.button
                    key={`${card.index}-${card.selectedIndex}-${card.label}`}
                    type="button"
                    onClick={() => setSelectedCard(card)}
                    className={`group relative w-24 text-center ${tarotCardPositions[index] ?? ''}`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <DailyTarotCardFace card={card} isFeatured={index === 1} />
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-5 flex items-end justify-center gap-3 py-3">
              {tarotCardPositions.map((position, index) => (
                <motion.div
                  key={index}
                  className={`relative h-32 w-24 ${position}`}
                >
                  <div
                    className="absolute inset-0 overflow-hidden rounded-[22px] border"
                    style={{
                      borderColor: 'var(--tarot-card-cover-border)',
                      background:
                        'linear-gradient(145deg, var(--tarot-card-cover-start) 0%, var(--tarot-card-cover-mid) 52%, var(--tarot-card-cover-end) 100%)',
                      boxShadow: index === 1 ? '0 20px 45px -30px var(--app-accent-glow)' : '0 16px 36px -30px rgba(0,0,0,0.45)',
                    }}
                  >
                    <HomeTarotSpreadCardFace />
                    <div className="pointer-events-none absolute inset-0 rounded-[22px] border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 36%, transparent)' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tarotDrawError ? (
            <div
              className="mb-4 rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: 'var(--app-danger-border)',
                backgroundColor: 'var(--app-danger-bg)',
                color: 'var(--app-danger-text)',
              }}
            >
              {tarotDrawError}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleDailyTarotDraw}
            disabled={isTarotButtonDisabled}
            className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              borderWidth: 'var(--app-hairline-border)',
              borderStyle: 'solid',
              borderColor: 'var(--app-accent-border-strong)',
              background: 'var(--app-accent-surface)',
              color: 'var(--tarot-text-main)',
              opacity: isTarotButtonDisabled ? 0.58 : 1,
            }}
          >
            {isTarotDrawLoading
              ? '카드 확인 중'
              : canDrawTarot
                  ? '오늘의 카드 뽑기'
                  : canRetryTarotDraw
                    ? '다시 시도하기'
                    : shouldPromptLogin
                      ? '로그인하러 가기'
                      : '오늘 카드 확인 완료'}
          </button>
        </motion.div>
      </div>

      <TarotCardDetailDialog
        card={selectedCard}
        eyebrow={getDailyTarotReadingLabel(selectedCard)}
        open={selectedCard !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCard(null);
        }}
      />
    </section>
  );
}
