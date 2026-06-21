import { memo, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
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
const CARD_OVERLAP = 34; // Cards still overlap heavily, but expose enough width for faster scrolling.
const DRAG_SCROLL_SENSITIVITY = 4.2;
const SPREAD_MAX_ROTATION = 15;
const REDUCED_SPREAD_MAX_ROTATION = 8;
const SPREAD_VERTICAL_CURVE = 0.15;
const REDUCED_SPREAD_VERTICAL_CURVE = 0.08;
const DEFAULT_DECK_ORDER = Array.from({ length: TOTAL_CARDS }, (_, index) => index);
const CENTER_SNAP_TRANSITION = {
  type: 'spring',
  stiffness: 360,
  damping: 32,
} as const;
const NATIVE_SCROLL_SETTLE_MS = 140;

function fract(value: number) {
  return value - Math.floor(value);
}

function clampScrollX(value: number) {
  return Math.max(-(TOTAL_CARDS - 1) * CARD_OVERLAP, Math.min(0, value));
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

const stableCtaStyle = {
  ...accentButtonStyle,
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
  isolation: 'isolate' as const,
};

const cardBackStyle = {
  borderColor: 'var(--tarot-card-cover-border)',
  background:
    'linear-gradient(145deg, var(--tarot-card-cover-start) 0%, var(--tarot-card-cover-mid) 52%, var(--tarot-card-cover-end) 100%)',
};

const cardFaceGlowStyle = {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)',
};

function isNativeWebViewRuntime() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('is-native-webview');
}

function TarotCardBackPattern() {
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
      <text x="50" y="105" fontSize="10" fill="var(--tarot-card-sigil)" opacity="0.34" textAnchor="middle" fontFamily="serif">
        ✦ 아르카나 ✦
      </text>
      <text x="50" y="120" fontSize="7" fill="var(--tarot-card-sigil-soft)" opacity="0.28" textAnchor="middle" fontFamily="serif">
        메이저
      </text>
    </svg>
  );
}

function TarotCardBackMinimalPattern() {
  return (
    <svg className="h-full w-full" viewBox="0 0 100 140">
      <polygon points="50,24 72,38 72,62 50,76 28,62 28,38" fill="none" stroke="var(--tarot-card-sigil)" strokeWidth="1" opacity="0.42" />
      <polygon points="50,34 64,43 64,57 50,66 36,57 36,43" fill="none" stroke="var(--tarot-card-sigil-soft)" strokeWidth="0.8" opacity="0.36" />
      <circle cx="50" cy="50" r="4.5" fill="var(--tarot-card-sigil)" opacity="0.48" />
      <text x="50" y="102" fontSize="7" fill="var(--tarot-card-sigil)" opacity="0.34" textAnchor="middle" fontFamily="serif">
        아르카나
      </text>
    </svg>
  );
}

function TarotSpreadCardFace({ minimal = false }: { minimal?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={cardFaceGlowStyle} />
      <div
        className="absolute inset-1.5 rounded-[10px] border"
        style={{ borderColor: 'var(--tarot-card-line-soft)' }}
      />

      {minimal ? (
        <div className="absolute inset-0 flex items-center justify-center p-3.5">
          <TarotCardBackMinimalPattern />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-3.5">
          <TarotCardBackPattern />
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(115deg, transparent 18%, rgba(255,255,255,0.1) 45%, transparent 58%)' }}
      />
    </div>
  );
}

type SpreadCardProps = {
  cardId: number;
  index: number;
  isSelected: boolean;
  isCentered: boolean;
  isDragging: boolean;
  reduceEffects: boolean;
  onActivate: (index: number, cardId: number) => void;
};

const SpreadCard = memo(function SpreadCard({
  cardId,
  index,
  isSelected,
  isCentered,
  isDragging,
  reduceEffects,
  onActivate,
}: SpreadCardProps) {
  const centerIndex = TOTAL_CARDS / 2;
  const distanceFromCenter = index - centerIndex;
  const maxRotation = reduceEffects ? REDUCED_SPREAD_MAX_ROTATION : SPREAD_MAX_ROTATION;
  const rotationAngle = (distanceFromCenter / centerIndex) * maxRotation;
  const verticalCurve = reduceEffects ? REDUCED_SPREAD_VERTICAL_CURVE : SPREAD_VERTICAL_CURVE;
  const verticalOffset = Math.abs(distanceFromCenter) * verticalCurve;
  const isSettledCenter = isCentered && !isSelected && !isDragging;
  const liftOffset = isSettledCenter ? (reduceEffects ? -6 : -10) : 0;
  const cardScale = isSettledCenter ? 1.015 : 1;

  return (
    <motion.div
      className="relative flex-shrink-0"
      style={{
        marginLeft: index === 0 ? '0px' : `-${CARD_WIDTH - CARD_OVERLAP}px`,
        zIndex: index,
        opacity: isSelected ? 0 : 1,
        rotate: rotationAngle,
        y: liftOffset + verticalOffset,
        scale: cardScale,
        willChange: isCentered || isDragging ? 'transform, opacity' : 'auto',
      }}
      animate={{
        opacity: isSelected ? 0 : 1,
        y: liftOffset + verticalOffset,
        scale: cardScale,
      }}
      transition={reduceEffects ? { duration: 0.06 } : CENTER_SNAP_TRANSITION}
      onClick={() => {
        if (!isDragging && !isSelected) {
          onActivate(index, cardId);
        }
      }}
    >
      <motion.div
        className="relative overflow-hidden rounded-lg border"
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          ...cardBackStyle,
          borderColor: isCentered && !isSelected ? 'var(--tarot-card-cover-border)' : 'color-mix(in srgb, var(--tarot-card-cover-border) 42%, transparent)',
          boxShadow: reduceEffects
            ? isSettledCenter
              ? '0 5px 12px rgba(0, 0, 0, 0.2)'
              : '0 1px 3px rgba(0, 0, 0, 0.16)'
            : isSettledCenter
              ? '0 9px 18px rgba(0, 0, 0, 0.25)'
              : '0 2px 7px rgba(0, 0, 0, 0.26)',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        whileHover={!reduceEffects && !isDragging && !isSelected ? { scale: 1.025 } : {}}
        whileTap={!reduceEffects && !isDragging && !isSelected ? { scale: 0.98 } : {}}
      >
        <TarotSpreadCardFace minimal={reduceEffects} />

        <div className="pointer-events-none absolute inset-0 rounded-lg border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 36%, transparent)' }} />
      </motion.div>
    </motion.div>
  );
});

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
  const [isDragging, setIsDragging] = useState(false);
  const [isNativeScrolling, setIsNativeScrolling] = useState(false);
  const reduceWebViewEffects = isNativeWebViewRuntime();
  const scrollX = useMotionValue(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const webViewScrollRef = useRef<HTMLDivElement>(null);
  const webViewScrollRafRef = useRef<number | null>(null);
  const webViewScrollSettleTimeoutRef = useRef<number | null>(null);
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const currentCenterIndexRef = useRef(0);

  const selectedCardIds = selectedCards.filter((cardId): cardId is number => cardId !== null);

  useEffect(() => {
    if (!reduceWebViewEffects) return undefined;

    return () => {
      if (webViewScrollRafRef.current !== null) {
        window.cancelAnimationFrame(webViewScrollRafRef.current);
      }
      if (webViewScrollSettleTimeoutRef.current !== null) {
        window.clearTimeout(webViewScrollSettleTimeoutRef.current);
      }
    };
  }, [reduceWebViewEffects]);

  useMotionValueEvent(scrollX, 'change', (latest) => {
    if (reduceWebViewEffects) return;

    const nextCenterIndex = Math.max(
      0,
      Math.min(TOTAL_CARDS - 1, Math.round(-latest / CARD_OVERLAP)),
    );

    if (nextCenterIndex !== currentCenterIndexRef.current) {
      currentCenterIndexRef.current = nextCenterIndex;
      setCurrentCenterIndex(nextCenterIndex);
    }
  });

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
    const currentScroll = scrollX.get();
    const nearestIndex = Math.round(-currentScroll / CARD_OVERLAP);
    const clampedIndex = Math.max(0, Math.min(TOTAL_CARDS - 1, nearestIndex));
    
    // Snap to card
    const targetScroll = -clampedIndex * CARD_OVERLAP;
    currentCenterIndexRef.current = clampedIndex;
    setCurrentCenterIndex(clampedIndex);
    scrollX.set(targetScroll);
  };

  const handleActivateCard = (index: number, cardId: number) => {
    if (index !== currentCenterIndexRef.current) {
      const targetScroll = -index * CARD_OVERLAP;
      currentCenterIndexRef.current = index;
      setCurrentCenterIndex(index);
      scrollX.set(targetScroll);
      return;
    }

    toggleCardSelection(cardId);
  };

  const handleWebViewScroll = () => {
    setIsNativeScrolling(true);

    if (webViewScrollSettleTimeoutRef.current !== null) {
      window.clearTimeout(webViewScrollSettleTimeoutRef.current);
    }

    webViewScrollSettleTimeoutRef.current = window.setTimeout(() => {
      setIsNativeScrolling(false);
      webViewScrollSettleTimeoutRef.current = null;
    }, NATIVE_SCROLL_SETTLE_MS);

    if (!webViewScrollRef.current || webViewScrollRafRef.current !== null) return;

    webViewScrollRafRef.current = window.requestAnimationFrame(() => {
      const container = webViewScrollRef.current;
      webViewScrollRafRef.current = null;
      if (!container) return;

      const nextCenterIndex = Math.max(
        0,
        Math.min(TOTAL_CARDS - 1, Math.round(container.scrollLeft / CARD_OVERLAP)),
      );

      if (nextCenterIndex !== currentCenterIndexRef.current) {
        currentCenterIndexRef.current = nextCenterIndex;
        setCurrentCenterIndex(nextCenterIndex);
      }
    });
  };

  const handleWebViewActivateCard = (index: number, cardId: number) => {
    if (index !== currentCenterIndexRef.current) {
      currentCenterIndexRef.current = index;
      setCurrentCenterIndex(index);
      setIsNativeScrolling(true);
      webViewScrollRef.current?.scrollTo({
        left: index * CARD_OVERLAP,
        behavior: 'smooth',
      });
      if (webViewScrollSettleTimeoutRef.current !== null) {
        window.clearTimeout(webViewScrollSettleTimeoutRef.current);
      }
      webViewScrollSettleTimeoutRef.current = window.setTimeout(() => {
        setIsNativeScrolling(false);
        webViewScrollSettleTimeoutRef.current = null;
      }, NATIVE_SCROLL_SETTLE_MS);
      return;
    }

    toggleCardSelection(cardId);
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
        {!reduceWebViewEffects && (
          <>
            <div
              className="absolute left-1/2 top-[5.5rem] h-40 w-[24rem] -translate-x-1/2 rounded-full blur-3xl"
              style={{ backgroundColor: 'color-mix(in srgb, var(--tarot-card-cover-glow) 82%, transparent)', opacity: 0.34 }}
            />
            <div
              className="absolute left-1/2 top-[12rem] h-64 w-[44rem] -translate-x-1/2 rounded-full blur-[84px]"
              style={{ backgroundColor: 'color-mix(in srgb, var(--tarot-ambient-blob-a) 78%, transparent)', opacity: 0.24 }}
            />
          </>
        )}
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
                      <TarotSpreadCardFace minimal={reduceWebViewEffects} />
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
        {!reduceWebViewEffects && (
          <>
            <div className="pointer-events-none absolute left-0 top-1/2 h-48 w-1/4 -translate-y-1/2 blur-2xl" style={{ background: 'linear-gradient(90deg, var(--tarot-card-cover-glow) 0%, transparent 100%)', opacity: 0.4 }} />
            <div className="pointer-events-none absolute right-0 top-1/2 h-48 w-1/4 -translate-y-1/2 blur-2xl" style={{ background: 'linear-gradient(270deg, var(--tarot-card-cover-glow) 0%, transparent 100%)', opacity: 0.4 }} />
          </>
        )}

        {/* Cards Container */}
        {reduceWebViewEffects ? (
          <div
            ref={webViewScrollRef}
            className="tarot-spread-native-scroll relative h-full w-full overflow-x-auto overflow-y-hidden"
            onScroll={handleWebViewScroll}
          >
            <div
              className="flex h-full items-center"
              style={{
                paddingLeft: `calc(50vw - ${CARD_WIDTH / 2}px)`,
                paddingRight: `calc(50vw - ${CARD_WIDTH / 2}px)`,
              }}
            >
              {deckOrder.map((cardId, index) => (
                <SpreadCard
                  key={`${cardId}-${index}`}
                  cardId={cardId}
                  index={index}
                  isSelected={selectedCardIds.includes(cardId)}
                  isCentered={index === currentCenterIndex}
                  isDragging={isNativeScrolling}
                  reduceEffects
                  onActivate={handleWebViewActivateCard}
                />
              ))}
            </div>
          </div>
        ) : (
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
              dragElastic={0.05}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDrag={(_, info) => {
                scrollX.set(clampScrollX(scrollX.get() + info.delta.x * (DRAG_SCROLL_SENSITIVITY - 1)));
              }}
              onDragEnd={handleDragEnd}
              style={{ x: scrollX, touchAction: 'none', willChange: isDragging ? 'transform' : 'auto' }}
              className="absolute left-1/2 top-1/2 flex h-full -translate-y-1/2 cursor-grab items-center active:cursor-grabbing"
            >
              {deckOrder.map((cardId, index) => (
                <SpreadCard
                  key={`${cardId}-${index}`}
                  cardId={cardId}
                  index={index}
                  isSelected={selectedCardIds.includes(cardId)}
                  isCentered={index === currentCenterIndex}
                  isDragging={isDragging}
                  reduceEffects={false}
                  onActivate={handleActivateCard}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4">
        {/* Confirm button */}
        {selectedCardIds.length === MAX_SELECTIONS && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleConfirm}
            className="tarot-stable-cta group relative overflow-hidden rounded-full border px-6 py-2.5 transition-all"
            style={stableCtaStyle}
            whileHover={reduceWebViewEffects ? undefined : { scale: 1.05 }}
            whileTap={reduceWebViewEffects ? undefined : { scale: 0.95 }}
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
