import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  getTarotDeckCards,
  resolveApiAssetUrl,
  type TarotDeckCardResponse,
} from '@/lib/api';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';

type ConsultationType = 'saju' | 'tarot' | 'comprehensive' | null;
type ConsultationFlowState = {
  homeDailyDraw?: boolean;
  deckOrder?: number[];
  selectedType?: ConsultationType;
  selectedScenario?: string;
  selectedScenarioTitle?: string;
  question?: string;
  tarotDeckVersionId?: string;
};

const TOTAL_CARDS = 78;
const MAX_SELECTIONS = 3;
const CARD_WIDTH = 85;
const CARD_HEIGHT = 128;
const CARD_OVERLAP = 26; // Cards overlap 70% (30% visible)
const DEFAULT_DECK_ORDER = Array.from({ length: TOTAL_CARDS }, (_, index) => index);

function fract(value: number) {
  return value - Math.floor(value);
}

const STATIC_STARS = Array.from({ length: 50 }, (_, index) => ({
  id: index,
  left: `${fract(Math.sin(index * 12.9898) * 43758.5453) * 100}%`,
  top: `${fract(Math.sin((index + 1) * 78.233) * 12345.6789) * 100}%`,
  duration: 2 + fract(Math.sin((index + 3) * 31.337) * 9157.114) * 3,
  delay: fract(Math.sin((index + 7) * 19.113) * 7123.551) * 2,
}));

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

const cardBackStyle = {
  borderColor: 'var(--tarot-card-cover-border)',
  background:
    'linear-gradient(145deg, var(--tarot-card-cover-start) 0%, var(--tarot-card-cover-mid) 52%, var(--tarot-card-cover-end) 100%)',
};

function isNativeWebViewRuntime() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('is-native-webview');
}

function TarotCardBackPattern() {
  return (
    <svg className="h-full w-full" viewBox="0 0 100 140">
      <polygon points="50,25 70,38 70,62 50,75 30,62 30,38" fill="none" stroke="var(--tarot-card-sigil)" strokeWidth="1.2" opacity="0.55" />
      <polygon points="50,32 65,42 65,58 50,68 35,58 35,42" fill="none" stroke="var(--tarot-card-sigil-soft)" strokeWidth="0.8" opacity="0.48" />
      <circle cx="50" cy="50" r="6" fill="var(--tarot-card-sigil)" opacity="0.5" />
      <circle cx="50" cy="50" r="3.5" fill="var(--tarot-card-sigil)" opacity="0.72" />
      <line x1="50" y1="50" x2="50" y2="25" stroke="var(--tarot-card-sigil)" strokeWidth="0.7" opacity="0.4" />
      <line x1="50" y1="50" x2="70" y2="38" stroke="var(--tarot-card-sigil)" strokeWidth="0.7" opacity="0.4" />
      <line x1="50" y1="50" x2="70" y2="62" stroke="var(--tarot-card-sigil)" strokeWidth="0.7" opacity="0.4" />
      <line x1="50" y1="50" x2="50" y2="75" stroke="var(--tarot-card-sigil)" strokeWidth="0.7" opacity="0.4" />
      <line x1="50" y1="50" x2="30" y2="62" stroke="var(--tarot-card-sigil)" strokeWidth="0.7" opacity="0.4" />
      <line x1="50" y1="50" x2="30" y2="38" stroke="var(--tarot-card-sigil)" strokeWidth="0.7" opacity="0.4" />
      <text x="50" y="100" fontSize="7" fill="var(--tarot-card-sigil)" opacity="0.42" textAnchor="middle" fontFamily="serif">ARCANA</text>
    </svg>
  );
}

export function TarotSpreadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flowState = (location.state as ConsultationFlowState | null) ?? null;
  const deckOrder = (flowState?.deckOrder ?? DEFAULT_DECK_ORDER) as number[];
  const tarotDeckVersionId =
    (flowState?.tarotDeckVersionId ?? getSelectedTarotDeckId()) as string;
  const selectedDeck = getTarotDeckById(tarotDeckVersionId);
  const [selectedCards, setSelectedCards] = useState<Array<number | null>>(
    Array.from({ length: MAX_SELECTIONS }, () => null),
  );
  const [cardPreviewMap, setCardPreviewMap] = useState<
    Record<number, { imageSrc?: string; label: string }>
  >({});
  const [isDragging, setIsDragging] = useState(false);
  const reduceWebViewEffects = isNativeWebViewRuntime();
  const scrollX = useMotionValue(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Calculate which card is currently centered
  const centerCardIndex = useTransform(scrollX, (value) => {
    const totalWidth = TOTAL_CARDS * CARD_OVERLAP;
    const scrollPercentage = -value / totalWidth;
    const index = Math.round(scrollPercentage * TOTAL_CARDS);
    return Math.max(0, Math.min(TOTAL_CARDS - 1, index));
  });

  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const currentCenterIndexRef = useRef(0);

  const selectedCardIds = selectedCards.filter((cardId): cardId is number => cardId !== null);

  useEffect(() => {
    const unsubscribe = centerCardIndex.on('change', (latest) => {
      if (latest === currentCenterIndexRef.current) return;
      currentCenterIndexRef.current = latest;
      setCurrentCenterIndex(latest);
    });
    return () => unsubscribe();
  }, [centerCardIndex]);

  useEffect(() => {
    let active = true;

    getTarotDeckCards(tarotDeckVersionId)
      .then((response) => {
        if (!active || response.length === 0) return;

        const nextPreviewMap: Record<number, { imageSrc?: string; label: string }> = {};

        response.forEach((card: TarotDeckCardResponse) => {
          const preview = {
            imageSrc: resolveApiAssetUrl(card.imageUrl) ?? undefined,
            label: card.koreanName ?? card.name,
          };

          const candidateIndexes = [card.selectedIndex, card.sortOrder, card.sortOrder - 1]
            .filter((value, index, array) => array.indexOf(value) === index)
            .filter((value) => value >= 0 && value < TOTAL_CARDS);

          candidateIndexes.forEach((candidateIndex) => {
            const existing = nextPreviewMap[candidateIndex];
            if (!existing || (!existing.imageSrc && preview.imageSrc)) {
              nextPreviewMap[candidateIndex] = preview;
            }
          });
        });

        setCardPreviewMap(nextPreviewMap);
      })
      .catch(() => {
        if (active) {
          setCardPreviewMap({});
        }
      });

    return () => {
      active = false;
    };
  }, [tarotDeckVersionId]);

  // Select/deselect card
  const toggleCardSelection = (cardId: number) => {
    const existingSlotIndex = selectedCards.findIndex((value) => value === cardId);

    if (existingSlotIndex !== -1) {
      setSelectedCards(selectedCards.map((value, index) => (index === existingSlotIndex ? null : value)));
      return;
    }

    const emptySlotIndex = selectedCards.findIndex((value) => value === null);

    if (emptySlotIndex !== -1) {
      setSelectedCards(selectedCards.map((value, index) => (index === emptySlotIndex ? cardId : value)));
    } else {
      toast.info('카드는 이미 3장 모두 선택했어요.');
    }
  };

  // Remove card from slot
  const removeFromSlot = (cardId: number) => {
    setSelectedCards(selectedCards.map((value) => (value === cardId ? null : value)));
  };

  const handleConfirm = () => {
    navigate('/tarot-result', {
      state: {
        ...flowState,
        selectedCards: selectedCardIds,
        deckOrder,
        tarotDeckVersionId,
      },
    });
  };

  // Snap to nearest card on drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    const totalWidth = TOTAL_CARDS * CARD_OVERLAP;
    const currentScroll = scrollX.get();
    const scrollPercentage = -currentScroll / totalWidth;
    const nearestIndex = Math.round(scrollPercentage * TOTAL_CARDS);
    const clampedIndex = Math.max(0, Math.min(TOTAL_CARDS - 1, nearestIndex));
    
    // Snap to card
    const targetScroll = -(clampedIndex / TOTAL_CARDS) * totalWidth;
    currentCenterIndexRef.current = clampedIndex;
    setCurrentCenterIndex(clampedIndex);
    scrollX.set(targetScroll);
  };

  return (
    <div className="tarot-spread-page fixed inset-0 overflow-hidden" style={pageGradientStyle}>
      <div className="absolute inset-0">
        {(reduceWebViewEffects ? STATIC_STARS.slice(0, 20) : STATIC_STARS).map((star) => (
          <motion.div
            key={star.id}
            className="absolute h-0.5 w-0.5 rounded-full"
            style={{
              left: star.left,
              top: star.top,
              backgroundColor: 'var(--tarot-text-main)',
            }}
            animate={reduceWebViewEffects ? { opacity: 0.36 } : { opacity: [0.2, 0.7, 0.2] }}
            transition={reduceWebViewEffects ? { duration: 0 } : {
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>

      <div
        className="tarot-spread-header absolute left-0 right-0 top-0 z-50 px-4 py-3"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--bg-main) 92%, transparent) 0%, transparent 100%)',
          backdropFilter: 'var(--app-card-blur)',
          WebkitBackdropFilter: 'var(--app-card-blur)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                navigate('/tarot-picker', {
                  state: {
                    ...flowState,
                    tarotDeckVersionId,
                  },
                })
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border transition-opacity hover:opacity-90"
              style={glassCardStyle}
            >
              <ArrowLeft className="h-4 w-4" style={{ color: 'var(--app-icon-muted)' }} />
            </button>
            <div>
              <h1 className="text-base font-medium" style={{ color: 'var(--tarot-text-main)' }}>타로 카드 선택</h1>
              <p className="text-xs" style={{ color: 'var(--app-accent-text-soft)' }}>
                {selectedDeck.name} · {selectedCardIds.length} / {MAX_SELECTIONS} 선택
              </p>
            </div>
          </div>

          {/* Selection counter */}
          <div className="flex gap-2">
            {Array.from({ length: MAX_SELECTIONS }).map((_, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full border"
                style={
                  i < selectedCardIds.length
                    ? {
                        borderColor: 'var(--tarot-point-color)',
                        backgroundColor: 'var(--tarot-point-color)',
                        boxShadow: '0 0 8px var(--tarot-card-cover-glow)',
                      }
                    : {
                        borderColor: 'var(--tarot-card-line)',
                        backgroundColor: 'transparent',
                      }
                }
              />
            ))}
          </div>
        </div>

        <div className="tarot-spread-orientation-tip mx-auto mt-2 max-w-7xl">
          <div className="inline-flex rounded-full border px-3 py-1 text-[11px]" style={{ ...glassCardStyle, color: 'var(--app-text-muted)' }}>
            가로로 돌려서 이용하시면 카드 선택이 더 편합니다
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20" style={{ top: 'var(--tarot-spread-chrome-top)' }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--tarot-card-cover-glow) 14%, transparent) 0%, transparent 24%, transparent 72%, color-mix(in srgb, var(--tarot-card-cover-glow) 10%, transparent) 100%)',
          }}
        />
        <div
          className="absolute left-1/2 top-[5.5rem] h-40 w-[24rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: 'color-mix(in srgb, var(--tarot-card-cover-glow) 82%, transparent)', opacity: 0.34 }}
        />
        <div
          className="absolute left-1/2 top-[12rem] h-64 w-[44rem] -translate-x-1/2 rounded-full blur-[84px]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--tarot-ambient-blob-a) 78%, transparent)', opacity: 0.24 }}
        />
      </div>

      <div
        className="absolute left-0 right-0 z-40"
        style={{
          top: 'var(--tarot-spread-slots-top)',
          height: 'var(--tarot-spread-slots-height)',
        }}
      >
        {/* Card Slots */}
        <div className="tarot-spread-slots flex h-full items-center justify-center gap-3 px-4 pt-3">
          {Array.from({ length: MAX_SELECTIONS }).map((_, slotIndex) => {
            const cardIndex = selectedCards[slotIndex];
            const hasSelectedCard = cardIndex !== null && cardIndex !== undefined;
            const preview = hasSelectedCard ? cardPreviewMap[cardIndex] : undefined;

            return (
              <div
                key={slotIndex}
                className="relative"
              >
                {/* Empty Slot */}
                <div
                  className="overflow-hidden rounded-xl border border-dashed transition-all"
                  style={{
                    width: 'var(--tarot-spread-slot-width)',
                    height: 'var(--tarot-spread-slot-height)',
                    borderColor: hasSelectedCard ? 'transparent' : 'var(--tarot-card-line-soft)',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                  }}
                >
                  {!hasSelectedCard && (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-2xl" style={{ color: 'var(--app-text-subtle)' }}>{slotIndex + 1}</span>
                    </div>
                  )}
                </div>

                {/* Selected Card in Slot */}
                {hasSelectedCard && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => removeFromSlot(cardIndex)}
                  >
                    <div
                      className="relative h-full w-full overflow-hidden rounded-xl border"
                      style={{
                        ...cardBackStyle,
                        boxShadow: '0 8px 18px rgba(0, 0, 0, 0.24)',
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center p-3">
                        <TarotCardBackPattern />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION - Ultra-Dense Horizontal Carousel (2/3 of screen) */}
      <div className="absolute bottom-0 left-0 right-0 z-30" style={{ top: 'var(--tarot-spread-carousel-top)' }}>
        <div className="pointer-events-none absolute left-0 top-1/2 h-48 w-1/4 -translate-y-1/2 blur-2xl" style={{ background: 'linear-gradient(90deg, var(--tarot-card-cover-glow) 0%, transparent 100%)', opacity: 0.4 }} />
        <div className="pointer-events-none absolute right-0 top-1/2 h-48 w-1/4 -translate-y-1/2 blur-2xl" style={{ background: 'linear-gradient(270deg, var(--tarot-card-cover-glow) 0%, transparent 100%)', opacity: 0.4 }} />

        {/* Cards Container */}
        <div 
          ref={constraintsRef}
          className="relative h-full w-full overflow-hidden"
        >
          <motion.div
            drag="x"
            dragConstraints={{
              left: -(TOTAL_CARDS - 1) * CARD_OVERLAP,
              right: 0,
            }}
            dragElastic={reduceWebViewEffects ? 0 : 0.05}
            dragMomentum={!reduceWebViewEffects}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ x: scrollX, touchAction: 'none', willChange: 'transform' }}
            className="absolute left-1/2 top-1/2 flex h-full -translate-y-1/2 cursor-grab items-center active:cursor-grabbing"
          >
            {deckOrder.map((cardId, index) => {
              const isSelected = selectedCardIds.includes(cardId);
              const isCentered = index === currentCenterIndex;
              const preview = cardPreviewMap[cardId];

              // Calculate fan spread effect
              const centerIndex = TOTAL_CARDS / 2;
              const distanceFromCenter = index - centerIndex;
              const maxRotation = 15; // Maximum rotation angle in degrees
              const rotationAngle = (distanceFromCenter / centerIndex) * maxRotation;
              
              // Subtle vertical curve (arc)
              const verticalOffset = Math.abs(distanceFromCenter) * 0.15;

              return (
                <motion.div
                  key={index}
                  className="relative flex-shrink-0"
                  style={{
                    marginLeft: index === 0 ? '0px' : `-${CARD_WIDTH - CARD_OVERLAP}px`,
                    // Keep the natural stack order so the lifted card stays partially covered.
                    zIndex: index,
                  }}
                  animate={{
                    y: (isCentered && !isSelected ? -12 : 0) + verticalOffset,
                    opacity: isSelected ? 0 : 1,
                    rotate: rotationAngle,
                  }}
                  transition={reduceWebViewEffects ? { duration: 0.12 } : {
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  onClick={() => {
                    if (!isDragging && !isSelected) {
                      // If card is not active, make it active
                      if (!isCentered) {
                        currentCenterIndexRef.current = index;
                        setCurrentCenterIndex(index);
                      } else {
                        // If card is already active, select it
                        toggleCardSelection(cardId);
                      }
                    }
                  }}
                >
                  <motion.div
                    className="overflow-hidden rounded-lg border shadow-lg transition-all"
                    style={{
                      width: `${CARD_WIDTH}px`,
                      height: `${CARD_HEIGHT}px`,
                      ...cardBackStyle,
                      borderColor: isCentered && !isSelected ? 'var(--tarot-card-cover-border)' : 'color-mix(in srgb, var(--tarot-card-cover-border) 45%, transparent)',
                      boxShadow: isCentered && !isSelected
                        ? '0 8px 18px rgba(0, 0, 0, 0.24)'
                        : '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                    whileHover={!isDragging && !isSelected ? { scale: 1.03 } : {}}
                    whileTap={!isDragging && !isSelected ? { scale: 0.97 } : {}}
                  >
                    {/* Card back pattern */}
                    {reduceWebViewEffects ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="h-9 w-9 rounded-full border"
                          style={{
                            borderColor: 'var(--tarot-card-sigil)',
                            boxShadow: '0 0 18px color-mix(in srgb, var(--tarot-card-sigil) 28%, transparent)',
                          }}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-3">
                        <TarotCardBackPattern />
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 rounded-lg border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 40%, transparent)' }} />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4">
        {/* Confirm button */}
        {selectedCardIds.length === MAX_SELECTIONS && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleConfirm}
            className="group relative overflow-hidden rounded-full border px-6 py-2.5 transition-all"
            style={accentButtonStyle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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

            <div className="relative flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--tarot-text-main)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--tarot-text-main)' }}>운세 보기</span>
            </div>
          </motion.button>
        )}
      </div>
    </div>
  );
}
