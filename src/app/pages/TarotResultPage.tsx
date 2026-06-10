import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { TarotCardDetailDialog } from '../components/TarotCardDetailDialog';
import { consult, getTarotDeckCards, resolveApiAssetUrl, saveHomeDailyTarotDraw, type TarotDeckCardResponse } from '@/lib/api';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';
import { getCurrentUser, saveHomeTarotDraw, saveLastConsultResult } from '@/lib/session';

type CardRevealState = 'back' | 'expanding' | 'revealing' | 'shrinking' | 'front';
type ConsultationType = 'saju' | 'tarot' | 'comprehensive' | null;
type TarotResultLocationState = {
  homeDailyDraw?: boolean;
  selectedCards?: number[];
  selectedType?: ConsultationType;
  selectedScenario?: string;
  selectedScenarioTitle?: string;
  question?: string;
  tarotDeckVersionId?: string;
};

interface CardData {
  id: number;
  selectedIndex: number;
  label: string;
  meaning: string;
  description?: string;
  revealState: CardRevealState;
  imageSrc?: string;
  videoSrc?: string;
}

function fract(value: number) {
  return value - Math.floor(value);
}

const STATIC_STARS = Array.from({ length: 80 }, (_, index) => ({
  id: index,
  left: `${fract(Math.sin(index * 12.9898) * 43758.5453) * 100}%`,
  top: `${fract(Math.sin((index + 1) * 78.233) * 12345.6789) * 100}%`,
  duration: 2 + fract(Math.sin((index + 5) * 23.173) * 6421.121) * 4,
  delay: fract(Math.sin((index + 9) * 17.713) * 9132.411) * 3,
}));

const REVEAL_PARTICLES = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${20 + fract(Math.sin((index + 1) * 14.237) * 6182.713) * 60}%`,
  top: `${20 + fract(Math.sin((index + 1) * 91.113) * 3921.511) * 60}%`,
  delay: index * 0.1,
}));

const CARD_WIDTH = 100;
const CARD_HEIGHT = 150;
const CARD_REVEAL_START_DELAY_MS = 300;
const CARD_REVEAL_TOTAL_DURATION_MS = 1800;
const modeByType = {
  saju: 'INVESTMENT_SAJU',
  tarot: 'INVESTMENT_TAROT',
  comprehensive: 'INVESTMENT_ALL',
} as const;

const pageGradientStyle = {
  background:
    'linear-gradient(180deg, var(--tarot-ambient-start) 0%, var(--tarot-ambient-mid) 52%, var(--tarot-ambient-end) 100%)',
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

const accentButtonStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--tarot-cta-border)',
  background:
    'linear-gradient(135deg, var(--tarot-cta-start) 0%, var(--tarot-cta-mid) 50%, var(--tarot-cta-end) 100%)',
  color: 'var(--tarot-text-main)',
};

const stableCtaStyle = {
  ...accentButtonStyle,
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
  isolation: 'isolate' as const,
};

const errorCardStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--app-danger-border)',
  backgroundColor: 'var(--app-danger-bg)',
  color: 'var(--app-danger-text)',
};

const frontCaptionStyle = {
  ...glassLayerStyle,
  borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 65%, transparent)',
  backgroundColor: 'color-mix(in srgb, var(--bg-main) 52%, transparent)',
};

const cardBackStyle = {
  borderColor: 'var(--tarot-card-cover-border)',
  background:
    'linear-gradient(145deg, var(--tarot-card-cover-start) 0%, var(--tarot-card-cover-mid) 52%, var(--tarot-card-cover-end) 100%)',
};

function TarotCardBackPattern() {
  return (
    <svg className="h-full w-full" viewBox="0 0 100 140">
      <polygon points="50,25 70,38 70,62 50,75 30,62 30,38" fill="none" stroke="var(--tarot-card-sigil)" strokeWidth="1.5" opacity="0.58" />
      <polygon points="50,32 65,42 65,58 50,68 35,58 35,42" fill="none" stroke="var(--tarot-card-sigil-soft)" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="50" r="8" fill="var(--tarot-card-sigil)" opacity="0.56" />
      <circle cx="50" cy="50" r="4.5" fill="var(--tarot-card-sigil)" opacity="0.78" />
      <line x1="50" y1="50" x2="50" y2="25" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
      <line x1="50" y1="50" x2="70" y2="38" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
      <line x1="50" y1="50" x2="70" y2="62" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
      <line x1="50" y1="50" x2="50" y2="75" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
      <line x1="50" y1="50" x2="30" y2="62" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
      <line x1="50" y1="50" x2="30" y2="38" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
      <text x="50" y="105" fontSize="8" fill="var(--tarot-card-sigil)" opacity="0.48" textAnchor="middle" fontFamily="serif">ARCANA</text>
    </svg>
  );
}

function TarotCardFallbackFace({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={cardBackStyle}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.18] via-transparent to-white/[0.05]" />
      <div className="absolute inset-4 rounded-xl border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 45%, transparent)' }} />
      <div className="absolute inset-0 flex items-center justify-center p-10">
        <TarotCardBackPattern />
      </div>
    </div>
  );
}

function CardMedia({
  card,
  alt,
  className,
  reduceEffects = false,
}: {
  card: CardData;
  alt: string;
  className: string;
  reduceEffects?: boolean;
}) {
  if (card.videoSrc) {
    return (
      <video
        src={card.videoSrc}
        className={className}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
      />
    );
  }

  if (card.imageSrc) {
    if (reduceEffects) {
      return (
        <img
          src={card.imageSrc}
          alt={alt}
          className={className}
        />
      );
    }

    return (
      <>
        <motion.img
          src={card.imageSrc}
          alt={alt}
          className={className}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, transparent 20%, color-mix(in srgb, var(--tarot-point-color) 20%, transparent) 50%, transparent 80%)',
            mixBlendMode: 'overlay',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.14] to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }}
        />
      </>
    );
  }

  return <TarotCardFallbackFace className={className} />;
}

function preloadCardMedia(card: CardData) {
  if (card.videoSrc) {
    return new Promise<void>((resolve) => {
      const video = document.createElement('video');
      const finalize = () => {
        video.removeEventListener('loadeddata', finalize);
        video.removeEventListener('error', finalize);
        resolve();
      };

      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = card.videoSrc;
      video.addEventListener('loadeddata', finalize, { once: true });
      video.addEventListener('error', finalize, { once: true });
    });
  }

  if (!card.imageSrc) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const image = new Image();
    const finalize = () => resolve();

    image.onload = finalize;
    image.onerror = finalize;
    image.src = card.imageSrc;
  });
}

function isNativeWebViewRuntime() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('is-native-webview');
}

export function TarotResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flowState = (location.state as TarotResultLocationState | null) ?? null;
  const selectedCards = flowState?.selectedCards ?? [0, 1, 2];
  const tarotDeckVersionId =
    (flowState?.tarotDeckVersionId ?? getSelectedTarotDeckId()) as string;
  const selectedDeck = getTarotDeckById(tarotDeckVersionId);
  const selectedType = flowState?.selectedType;
  const selectedScenario = flowState?.selectedScenario;
  const selectedScenarioTitle = flowState?.selectedScenarioTitle;
  const question = flowState?.question;
  const trimmedQuestion = question?.trim() ?? '';
  const isHomeDailyDraw = Boolean(flowState?.homeDailyDraw);
  const canSubmitConsult =
    Boolean(selectedType) &&
    Boolean(selectedScenario) &&
    Boolean(trimmedQuestion) &&
    selectedType !== null &&
    selectedType in modeByType;
  
  const [cards, setCards] = useState<CardData[]>(() =>
    selectedCards.map((selectedIndex, slotIndex) => ({
      id: slotIndex,
      selectedIndex,
      label: `${selectedIndex + 1}번 카드`,
      meaning: '',
      revealState: 'back',
    })),
  );
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isCardMediaPrepared, setIsCardMediaPrepared] = useState(false);
  const [selectedDetailCard, setSelectedDetailCard] = useState<CardData | null>(null);
  const reduceWebViewEffects = isNativeWebViewRuntime();

  useEffect(() => {
    setCards(
      selectedCards.map((selectedIndex, slotIndex) => ({
        id: slotIndex,
        selectedIndex,
        label: `${selectedIndex + 1}번 카드`,
        meaning: '',
        revealState: 'back',
      })),
    );
    setIsCardMediaPrepared(false);
    setSelectedDetailCard(null);
  }, [selectedCards]);

  useEffect(() => {
    let active = true;

    getTarotDeckCards(tarotDeckVersionId, selectedCards)
      .then((response) => {
        if (!active) return;
        if (response.length === 0) {
          setIsCardMediaPrepared(true);
          return;
        }

        const cardMap = new Map<number, TarotDeckCardResponse>();
        response.forEach((card) => {
          cardMap.set(card.selectedIndex, card);
        });

        const hydratedCards = selectedCards.map((selectedIndex, slotIndex) => {
          const baseCard: CardData = {
            id: slotIndex,
            selectedIndex,
            label: `${selectedIndex + 1}번 카드`,
            meaning: '',
            revealState: 'back',
          };

          const metadata = cardMap.get(selectedIndex);
          if (!metadata) return baseCard;

          return {
            ...baseCard,
            label: metadata.koreanName ?? metadata.name,
            meaning: metadata.meaning,
            description: metadata.description,
            imageSrc: resolveApiAssetUrl(metadata.imageUrl),
            videoSrc: resolveApiAssetUrl(metadata.videoUrl) || undefined,
          };
        });

        Promise.allSettled(hydratedCards.map((card) => preloadCardMedia(card))).finally(() => {
          if (!active) return;
          setCards(hydratedCards);
          setIsCardMediaPrepared(true);
        });

        if (!canSubmitConsult) {
          saveHomeTarotDraw({
            deckVersionId: tarotDeckVersionId,
            deckName: selectedDeck.name,
            cards: selectedCards
              .map((selectedIndex) => {
                const metadata = cardMap.get(selectedIndex);
                if (!metadata) return null;

                return {
                  selectedIndex,
                  label: metadata.koreanName ?? metadata.name,
                  meaning: metadata.meaning,
                  description: metadata.description,
                  imageSrc: resolveApiAssetUrl(metadata.imageUrl),
                  videoSrc: resolveApiAssetUrl(metadata.videoUrl) || undefined,
                };
              })
              .filter((card): card is NonNullable<typeof card> => card !== null),
            updatedAt: new Date().toISOString(),
          });
        }
      })
      .catch(() => {
        if (active) {
          setIsCardMediaPrepared(true);
        }
        // Keep the placeholder card presentation if the deck metadata API is unavailable.
      });

    return () => {
      active = false;
    };
  }, [canSubmitConsult, selectedCards, selectedDeck.name, tarotDeckVersionId]);

  const handleCardClick = (cardId: number) => {
    if (isAnimating || !isCardMediaPrepared) return;
    
    const card = cards.find((candidate) => candidate.id === cardId);
    if (!card) return;
    
    if (card.revealState === 'front') {
      if (cards.every((candidate) => candidate.revealState === 'front')) {
        setSelectedDetailCard(card);
      }
      return;
    }
    
    // If card is still back, start the reveal sequence
    if (card.revealState === 'back') {
      setIsAnimating(true);
      setExpandedCardId(cardId);
      
      // Step 1: Expanding
      setCards(prev => prev.map(c => 
        c.id === cardId ? { ...c, revealState: 'expanding' as CardRevealState } : c
      ));

      // Step 2: After expansion, start revealing animation
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          c.id === cardId ? { ...c, revealState: 'revealing' as CardRevealState } : c
        ));
      }, CARD_REVEAL_START_DELAY_MS);

      // Step 3: After reveal animation, transition to front (skip shrinking)
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          c.id === cardId ? { ...c, revealState: 'front' as CardRevealState } : c
        ));
        setExpandedCardId(null);
        setIsAnimating(false);
      }, CARD_REVEAL_TOTAL_DURATION_MS);
    }
  };

  const handleConfirm = async () => {
    if (isHomeDailyDraw) {
      setSubmitError('');
      setIsSubmitting(true);

      try {
        await saveHomeDailyTarotDraw({
          tarotDeckVersionId,
          tarotIndices: cards
            .slice()
            .sort((left, right) => left.id - right.id)
            .map((card) => card.selectedIndex),
        });
        navigate('/home');
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : '오늘의 카드 저장에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!canSubmitConsult) {
      navigate('/home');
      return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await consult({
        userId: currentUser.id,
        mode: modeByType[selectedType],
        scenario: selectedScenario
          ? (selectedScenario as 'TIMING_ENTRY' | 'TIMING_EXIT' | 'SAJU_MATCH' | 'RESCUE_PLAN' | 'MENTAL_GUIDE')
          : undefined,
        focusLabel: selectedScenarioTitle,
        question: trimmedQuestion,
        tarotIndices: selectedCards,
        tarotDeckVersionId,
        tarotInterpretationMode: 'MAIN_TRADITIONAL',
        referenceDateTime: new Date().toISOString(),
      });

      saveLastConsultResult(response);
      navigate('/investment-result', { state: { consultResult: response, source: 'consultation' } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '상담 요청에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCardsRevealed = cards.every(c => c.revealState === 'front');

  return (
    <div className="tarot-result-page fixed inset-0 overflow-hidden" style={pageGradientStyle}>
      <div className="absolute inset-0">
        {(reduceWebViewEffects ? STATIC_STARS.slice(0, 24) : STATIC_STARS).map((star) => (
          <motion.div
            key={star.id}
            className="absolute h-0.5 w-0.5 rounded-full"
            style={{
              left: star.left,
              top: star.top,
              backgroundColor: 'var(--tarot-text-main)',
            }}
            animate={reduceWebViewEffects ? { opacity: 0.28, scale: 1 } : {
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={reduceWebViewEffects ? { duration: 0 } : {
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}

        {!reduceWebViewEffects && (
          <>
            <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--tarot-ambient-blob-a)' }} />
            <div className="absolute left-1/2 top-2/3 h-96 w-96 -translate-x-1/2 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--tarot-ambient-blob-b)' }} />
          </>
        )}
      </div>

      <AnimatePresence>
        {expandedCardId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 backdrop-blur-md"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bg-main) 78%, transparent)',
              backdropFilter: reduceWebViewEffects ? 'none' : undefined,
              WebkitBackdropFilter: reduceWebViewEffects ? 'none' : undefined,
            }}
          />
        )}
      </AnimatePresence>

      <div
        className="absolute left-0 right-0 top-0 z-50 px-4 py-4"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--bg-main) 92%, transparent) 0%, transparent 100%)',
          backdropFilter: 'var(--app-card-blur)',
          WebkitBackdropFilter: 'var(--app-card-blur)',
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              navigate('/tarot-spread', {
                state: {
                  ...flowState,
                  selectedCards,
                  tarotDeckVersionId,
                },
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-90"
            style={glassCardStyle}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: 'var(--app-icon-muted)' }} />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>운세 결과</h1>
            <p className="text-xs" style={{ color: 'var(--app-accent-text-soft)' }}>{selectedDeck.name} · 카드를 터치하여 확인하세요</p>
          </div>

          <div className="h-10 w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Main Card Layout - Horizontal Row */}
      <div className="relative flex h-full items-center justify-center px-8 py-20">
        <div className="flex items-center justify-center gap-4">
          {cards.map((card, index) => {
            const isExpanded = expandedCardId === card.id;
            const isRevealing = card.revealState === 'revealing';
            const isFront = card.revealState === 'front';
            const isBack = card.revealState === 'back';
            
            // Only render in fixed position when expanding or revealing
            const isFullscreen = card.revealState === 'expanding' || card.revealState === 'revealing';
            
            return (
              <div key={card.id} className="relative" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
                {/* Normal position card (back or front state) */}
                {!isFullscreen && (
                  <motion.div
                    className="absolute inset-0 cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{ delay: index * 0.15, duration: 0.3 }}
                    onClick={() => handleCardClick(card.id)}
                    whileHover={!isAnimating && (isBack || (isFront && allCardsRevealed)) ? { scale: 1.05, y: -5 } : {}}
                    whileTap={!isAnimating && (isBack || (isFront && allCardsRevealed)) ? { scale: 0.95 } : {}}
                  >
                    {/* Card Back */}
                    {isBack && (
                      <div className="h-full w-full">
                        <div
                          className="h-full w-full overflow-hidden rounded-2xl border-2"
                          style={{
                            ...cardBackStyle,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.32)',
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center p-8">
                            <TarotCardBackPattern />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Front - Revealed */}
                    {isFront && (
                      <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="h-full w-full"
                      >
                        <div
                          className="relative h-full w-full overflow-hidden rounded-2xl border-2"
                          style={{
                            borderColor: 'var(--tarot-card-cover-border)',
                            backgroundColor: 'var(--bg-main)',
                            boxShadow: '0 0 30px var(--tarot-card-cover-glow), inset 0 0 20px color-mix(in srgb, var(--tarot-card-cover-glow) 55%, transparent)',
                          }}
                        >
                          <CardMedia
                            card={card}
                            alt={card.label || `Tarot Card ${index + 1}`}
                            className="h-full w-full object-cover"
                            reduceEffects={reduceWebViewEffects}
                          />

                          {card.videoSrc ? <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.18)' }} /> : null}

                          <div className="absolute left-3 top-3 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.22em]" style={{ ...frontCaptionStyle, color: 'var(--app-accent-text-soft)' }}>
                            ARCANA
                          </div>

                          <div className="absolute inset-x-3 bottom-3 rounded-xl px-3 py-2" style={frontCaptionStyle}>
                            <div className="text-xs font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{card.label}</div>
                          </div>

                          <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--tarot-card-cover-glow) 60%, transparent) 0%, transparent 30%, color-mix(in srgb, var(--tarot-card-cover-glow) 45%, transparent) 100%)' }} />

                          <div className="pointer-events-none absolute inset-3 rounded-xl border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 72%, transparent)' }} />
                          
                          {/* Subtle shimmer effect */}
                          <motion.div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                            animate={reduceWebViewEffects ? undefined : {
                              x: ['-100%', '200%'],
                            }}
                            transition={reduceWebViewEffects ? undefined : {
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 2,
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Fullscreen card (expanding or revealing state) */}
                {isFullscreen && (
                  <motion.div
                    className="tarot-result-fullscreen-card fixed left-1/2 top-1/2 z-[100] cursor-pointer"
                    style={{
                      x: '-50%',
                      y: '-50%',
                    }}
                    initial={false}
                    onClick={() => handleCardClick(card.id)}
                  >
                    {/* Card Back during expansion */}
                    {card.revealState === 'expanding' && (
                      <motion.div
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0"
                      >
                        <div
                          className="h-full w-full overflow-hidden rounded-2xl border-2"
                          style={{
                            ...cardBackStyle,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.32)',
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center p-8">
                            <TarotCardBackPattern />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Revealing State - Full screen with mystical animation */}
                    {isRevealing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0"
                      >
                        <div
                          className="relative h-full w-full overflow-hidden rounded-2xl border-2"
                          style={{
                            borderColor: 'var(--tarot-card-cover-border)',
                            background:
                              'linear-gradient(145deg, color-mix(in srgb, var(--tarot-card-cover-start) 52%, var(--bg-main)) 0%, color-mix(in srgb, var(--tarot-cta-mid) 38%, var(--bg-main)) 50%, color-mix(in srgb, var(--tarot-card-cover-end) 44%, var(--bg-main)) 100%)',
                            boxShadow: '0 0 60px var(--tarot-card-cover-glow), inset 0 0 40px color-mix(in srgb, var(--tarot-card-cover-glow) 70%, transparent)',
                          }}
                        >
                          <CardMedia
                            card={card}
                            alt={card.label || `Tarot Card ${index + 1}`}
                            className="absolute inset-0 h-full w-full object-cover"
                            reduceEffects={reduceWebViewEffects}
                          />

                          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.18)' }} />

                          {/* Mystical magic circle overlay animation */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {/* Outer rotating circle */}
                            {!reduceWebViewEffects && (
                            <motion.svg
                              className="absolute h-full w-full"
                              viewBox="0 0 320 480"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                            >
                              <circle cx="160" cy="240" r="120" fill="none" stroke="var(--tarot-point-color)" strokeWidth="1.5" opacity="0.7" />
                              <circle cx="160" cy="240" r="110" fill="none" stroke="var(--tarot-point-color)" strokeWidth="0.8" opacity="0.5" />
                              {Array.from({ length: 12 }).map((_, i) => {
                                const angle = (i * 360) / 12;
                                const x1 = 160 + 110 * Math.cos((angle * Math.PI) / 180);
                                const y1 = 240 + 110 * Math.sin((angle * Math.PI) / 180);
                                const x2 = 160 + 120 * Math.cos((angle * Math.PI) / 180);
                                const y2 = 240 + 120 * Math.sin((angle * Math.PI) / 180);
                                return (
                                  <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="var(--tarot-point-color)"
                                    strokeWidth="1"
                                    opacity="0.6"
                                  />
                                );
                              })}
                            </motion.svg>
                            )}

                            {/* Middle rotating ring */}
                            {!reduceWebViewEffects && (
                            <motion.svg
                              className="absolute h-full w-full"
                              viewBox="0 0 320 480"
                              animate={{ rotate: -360 }}
                              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            >
                              <circle cx="160" cy="240" r="80" fill="none" stroke="var(--tarot-point-color)" strokeWidth="1" opacity="0.6" />
                              {Array.from({ length: 8 }).map((_, i) => {
                                const angle = (i * 360) / 8;
                                const x = 160 + 75 * Math.cos((angle * Math.PI) / 180);
                                const y = 240 + 75 * Math.sin((angle * Math.PI) / 180);
                                return <circle key={i} cx={x} cy={y} r="4" fill="var(--tarot-point-color)" opacity="0.7" />;
                              })}
                            </motion.svg>
                            )}

                            {/* Inner counter-rotating circle */}
                            {!reduceWebViewEffects && (
                            <motion.svg
                              className="absolute h-full w-full"
                              viewBox="0 0 320 480"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                            >
                              <circle cx="160" cy="240" r="50" fill="none" stroke="var(--tarot-point-color)" strokeWidth="0.8" opacity="0.5" />
                              <circle cx="160" cy="240" r="40" fill="none" stroke="var(--tarot-point-color)" strokeWidth="0.5" opacity="0.4" />
                            </motion.svg>
                            )}

                            {/* Center pulsing light */}
                            <motion.div
                              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
                              style={{ backgroundColor: 'var(--tarot-point-color)', filter: reduceWebViewEffects ? 'blur(14px)' : 'blur(40px)' }}
                              animate={reduceWebViewEffects ? { scale: 1, opacity: 0.28 } : {
                                scale: [1, 1.8, 1],
                                opacity: [0.4, 0.7, 0.4],
                              }}
                              transition={reduceWebViewEffects ? { duration: 0 } : {
                                duration: 2,
                                repeat: Infinity,
                              }}
                            />

                            {/* Light rays */}
                            {!reduceWebViewEffects && Array.from({ length: 8 }).map((_, i) => {
                              const angle = (i * 360) / 8;
                              return (
                                <motion.div
                                  key={i}
                                  className="absolute left-1/2 top-1/2 h-1 w-32 origin-left"
                                  style={{
                                    background: 'linear-gradient(90deg, color-mix(in srgb, var(--tarot-point-color) 60%, transparent) 0%, transparent 100%)',
                                    transform: `rotate(${angle}deg)`,
                                  }}
                                  animate={{
                                    opacity: [0.3, 0.7, 0.3],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                  }}
                                />
                              );
                            })}

                            {/* Floating particles/sparkles */}
                            {!reduceWebViewEffects && REVEAL_PARTICLES.map((particle) => (
                              <motion.div
                                key={particle.id}
                                className="absolute h-1 w-1 rounded-full"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.92)',
                                  left: particle.left,
                                  top: particle.top,
                                }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 2, 0],
                                  y: [0, -30, -60],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: particle.delay,
                                }}
                              />
                            ))}
                          </div>

                          {/* Revealing glow pulse */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl"
                            animate={reduceWebViewEffects ? undefined : {
                              boxShadow: [
                                'inset 0 0 30px rgba(212, 175, 55, 0.5)',
                                'inset 0 0 60px rgba(212, 175, 55, 0.8)',
                                'inset 0 0 30px rgba(212, 175, 55, 0.5)',
                              ],
                            }}
                            transition={reduceWebViewEffects ? undefined : {
                              duration: 1.5,
                              repeat: Infinity,
                            }}
                          />

                          <div className="absolute inset-x-6 bottom-6 rounded-2xl border px-4 py-3" style={frontCaptionStyle}>
                            <div className="text-sm font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{card.label}</div>
                            {card.videoSrc ? (
                              <div className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>카드 비전 영상 해석 중...</div>
                            ) : (
                              <div className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>카드의 상징을 해석하고 있습니다.</div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom hint text */}
      {!allCardsRevealed && !isAnimating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tarot-result-bottom-hint absolute bottom-32 left-0 right-0 z-10 text-center">
          <p className="text-sm" style={{ color: 'var(--app-text-subtle)' }}>
            {isCardMediaPrepared ? '카드를 터치하여 운세를 확인하세요' : '카드 이미지를 준비하고 있습니다'}
          </p>
        </motion.div>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 z-50 px-6 py-6"
        style={{
          background:
            'linear-gradient(0deg, color-mix(in srgb, var(--bg-main) 92%, transparent) 0%, transparent 100%)',
          backdropFilter: 'var(--app-card-blur)',
          WebkitBackdropFilter: 'var(--app-card-blur)',
        }}
      >
        <div className="flex flex-col gap-3">
          {submitError ? (
            <div className="rounded-2xl border px-4 py-3 text-sm" style={errorCardStyle}>
              {submitError}
            </div>
          ) : null}

          {allCardsRevealed ? (
            <p className="text-center text-xs" style={{ color: 'var(--app-text-subtle)' }}>
              카드를 누르면 의미를 볼 수 있어요
            </p>
          ) : null}

          {/* Summary button - appears after all cards revealed */}
          <AnimatePresence>
            {allCardsRevealed && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="tarot-stable-cta group relative overflow-hidden rounded-full border px-6 py-3.5 transition-all"
                style={stableCtaStyle}
                whileHover={reduceWebViewEffects ? undefined : { scale: 1.02 }}
                whileTap={reduceWebViewEffects ? undefined : { scale: 0.98 }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)' }} />
                
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={reduceWebViewEffects ? undefined : {
                    boxShadow: [
                      '0 0 18px var(--tarot-card-cover-glow), inset 0 0 18px var(--tarot-card-cover-glow)',
                      '0 0 28px var(--tarot-card-cover-glow), inset 0 0 28px var(--tarot-card-cover-glow)',
                      '0 0 18px var(--tarot-card-cover-glow), inset 0 0 18px var(--tarot-card-cover-glow)',
                    ],
                  }}
                  transition={reduceWebViewEffects ? undefined : {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <div className="relative flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: 'var(--tarot-text-main)' }} />
                  <span className="font-bold" style={{ color: 'var(--tarot-text-main)' }}>
                    {isSubmitting
                      ? isHomeDailyDraw
                        ? '저장 중...'
                        : '리딩 중...'
                      : isHomeDailyDraw
                        ? '오늘의 카드 저장하기'
                        : canSubmitConsult
                          ? '운세 결과 보러 가기'
                          : '홈으로 돌아가기'}
                  </span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <TarotCardDetailDialog
        card={
          selectedDetailCard
            ? {
                label: selectedDetailCard.label,
                meaning: selectedDetailCard.meaning,
                description: selectedDetailCard.description,
                imageSrc: selectedDetailCard.imageSrc,
                videoSrc: selectedDetailCard.videoSrc,
              }
            : null
        }
        eyebrow="Selected Tarot Card"
        open={Boolean(selectedDetailCard)}
        onOpenChange={(open) => {
          if (!open) setSelectedDetailCard(null);
        }}
      />
    </div>
  );
}
