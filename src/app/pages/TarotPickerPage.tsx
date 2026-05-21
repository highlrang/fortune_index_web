import { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, PanInfo, useSpring } from 'motion/react';
import { ArrowLeft, Shuffle, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';

type ConsultationType = 'saju' | 'tarot' | 'comprehensive' | null;
type ConsultationFlowState = {
  homeDailyDraw?: boolean;
  selectedType?: ConsultationType;
  selectedScenario?: string;
  selectedScenarioTitle?: string;
  question?: string;
  selectedCards?: number[];
  tarotDeckVersionId?: string;
};

const TOTAL_CARDS = 78;
const CARD_THICKNESS = 1; // px per card - reduced for thinner deck
const SPLIT_DISTANCE = 56;
const SPLIT_DEPTH_MULTIPLIER = 0.65;
const ROTATION_ANGLE = 65; // degrees - card deck rotation on X axis
const SHUFFLE_ANIMATION_DURATION = 1.2;
const SHUFFLE_ANIMATION_MS = SHUFFLE_ANIMATION_DURATION * 1000;
const SHUFFLE_VERTICAL_TRAVEL = 180;
const RANDOM_SHUFFLE_ANIMATION_MS = 980;
const RANDOM_SHUFFLE_CHUNK_COUNT = 4;
const INITIAL_DECK_ORDER = Array.from({ length: TOTAL_CARDS }, (_, index) => index);
const CARD_WIDTH = 220;
const CARD_HEIGHT = 340;
const MERGED_TOP_CARD_Z = TOTAL_CARDS * CARD_THICKNESS;

function fract(value: number) {
  return value - Math.floor(value);
}

const STATIC_STARS = Array.from({ length: 60 }, (_, index) => ({
  id: index,
  left: `${fract(Math.sin(index * 12.9898) * 43758.5453) * 100}%`,
  top: `${fract(Math.sin((index + 1) * 78.233) * 12345.6789) * 100}%`,
  opacity: 0.14 + fract(Math.sin((index + 1) * 4.123) * 2468.1357) * 0.38,
}));

type DeckCardFaceProps = {
  isBottomCard: boolean;
  isTopCard: boolean;
  isVisible: boolean;
  reduceEffects?: boolean;
};

const deckCardFaceStyle = {
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
  transform: 'translateZ(0)',
};

const tarotPageVars = {
  color: 'var(--tarot-text-main)',
};

const glassPanelStyle = {
  borderColor: 'var(--app-surface-border)',
  backgroundColor: 'var(--app-surface-bg)',
  backdropFilter: 'var(--app-card-blur)',
  WebkitBackdropFilter: 'var(--app-card-blur)',
};

function isNativeWebViewRuntime() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('is-native-webview');
}

function getCutShuffledOrder(order: number[], cutIndex: number) {
  return [...order.slice(cutIndex), ...order.slice(0, cutIndex)];
}

function getSinglePassInterleavedOrder(order: number[], cutIndex: number) {
  const upperHalf = order.slice(0, cutIndex);
  const lowerHalf = order.slice(cutIndex);
  const merged: number[] = [];

  let upperIndex = 0;
  let lowerIndex = 0;
  let takeLowerNext = lowerHalf.length >= upperHalf.length;

  while (upperIndex < upperHalf.length || lowerIndex < lowerHalf.length) {
    const currentHalf = takeLowerNext ? lowerHalf : upperHalf;
    const currentIndex = takeLowerNext ? lowerIndex : upperIndex;
    const remaining = currentHalf.length - currentIndex;

    if (remaining <= 0) {
      takeLowerNext = !takeLowerNext;
      continue;
    }

    const packetSize = Math.min(
      remaining,
      1 + Math.floor(Math.random() * (remaining > 2 ? 3 : 2)),
    );

    for (let offset = 0; offset < packetSize; offset += 1) {
      merged.push(currentHalf[currentIndex + offset]);
    }

    if (takeLowerNext) {
      lowerIndex += packetSize;
    } else {
      upperIndex += packetSize;
    }

    takeLowerNext = !takeLowerNext;
  }

  return merged;
}

function getRandomShuffledOrder(order: number[]) {
  const next = [...order];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

function getRandomShuffleChunkMotion(index: number, isAnimating: boolean) {
  if (!isAnimating) {
    return {
      animate: {
        x: 0,
        y: 0,
        rotateZ: 0,
        scale: 1,
      },
      transition: {
        duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    };
  }

  const chunkSize = Math.ceil(TOTAL_CARDS / RANDOM_SHUFFLE_CHUNK_COUNT);
  const chunkIndex = Math.floor(index / chunkSize);
  const cardIndexInChunk = index % chunkSize;
  const chunkCenter = chunkIndex - (RANDOM_SHUFFLE_CHUNK_COUNT - 1) / 2;
  const direction = chunkCenter === 0 ? 1 : Math.sign(chunkCenter);
  const depthWeight = 1 - index / TOTAL_CARDS;
  const chunkStrength = 0.9 + Math.abs(chunkCenter) * 0.28;
  const intraChunkOffset = cardIndexInChunk - (chunkSize - 1) / 2;
  const spreadX = chunkCenter * 14 * chunkStrength + intraChunkOffset * 2;
  const spreadY = -(18 + Math.abs(chunkCenter) * 9) * (0.72 + depthWeight * 0.28) + intraChunkOffset * 2.4;
  const rotation = direction * (7 + Math.abs(chunkCenter) * 3.5) + intraChunkOffset * 1.4;
  const settleX = spreadX * -0.24;
  const settleY = spreadY * 0.22;

  return {
    animate: {
      x: [0, spreadX * 0.5, spreadX, settleX, 0],
      y: [0, spreadY * 0.46, spreadY, settleY, 0],
      rotateZ: [0, rotation * 0.58, rotation, rotation * -0.18, 0],
      scale: [1, 1.016 + depthWeight * 0.008, 0.994, 1.004, 1],
    },
    transition: {
      duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000,
      delay: chunkIndex * 0.04 + cardIndexInChunk * 0.012,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  };
}

const DeckCardFace = memo(function DeckCardFace({
  isBottomCard,
  isTopCard,
  isVisible,
  reduceEffects = false,
}: DeckCardFaceProps) {
  const shouldRenderDetailedFace = isVisible || isTopCard || isBottomCard;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border"
      style={{
        ...deckCardFaceStyle,
        opacity: isVisible ? (isTopCard || isBottomCard ? 1 : 0.95) : 0.3,
        background:
          'linear-gradient(145deg, var(--tarot-card-cover-start) 0%, var(--tarot-card-cover-mid) 52%, var(--tarot-card-cover-end) 100%)',
        borderColor: 'var(--tarot-card-cover-border)',
        boxShadow: isTopCard || isBottomCard
          ? reduceEffects
            ? '0 6px 16px rgba(0, 0, 0, 0.22)'
            : '0 10px 28px var(--tarot-card-cover-glow)'
          : '0 1px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="absolute inset-0 rounded-2xl border" style={{ borderColor: 'var(--tarot-card-line-soft)' }} />
      {shouldRenderDetailedFace && isTopCard && (
        <>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)' }} />
          {!reduceEffects && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background:
                  'radial-gradient(circle at center, var(--tarot-accent-glow-soft) 0%, transparent 74%)',
              }}
              animate={{ opacity: [0.16, 0.34, 0.16] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center p-10">
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
                ✦ ARCANA ✦
              </text>
              <text x="50" y="120" fontSize="7" fill="var(--tarot-card-sigil-soft)" opacity="0.28" textAnchor="middle" fontFamily="serif">
                MAJOR
              </text>
            </svg>
          </div>
        </>
      )}

      {shouldRenderDetailedFace && isBottomCard && (
        <>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)' }} />
          {!reduceEffects && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background:
                  'radial-gradient(circle at center, var(--tarot-accent-glow-soft) 0%, transparent 76%)',
              }}
              animate={{ opacity: [0.14, 0.3, 0.14] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <svg className="h-full w-full" viewBox="0 0 100 140">
              <rect x="8" y="8" width="84" height="124" fill="none" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.34" rx="4" />
              <rect x="12" y="12" width="76" height="116" fill="none" stroke="var(--tarot-card-sigil-soft)" strokeWidth="0.4" opacity="0.28" rx="3" />
              <circle cx="50" cy="70" r="25" fill="none" stroke="var(--tarot-card-sigil)" strokeWidth="0.6" opacity="0.35" />
              <circle cx="50" cy="70" r="20" fill="none" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="70" r="15" fill="none" stroke="var(--tarot-card-sigil-soft)" strokeWidth="0.4" opacity="0.25" />
              {[...Array(8)].map((_, idx) => {
                const angle = (idx * 45 - 90) * (Math.PI / 180);
                const x2 = 50 + Math.cos(angle) * 15;
                const y2 = 70 + Math.sin(angle) * 15;
                return (
                  <line
                    key={idx}
                    x1="50"
                    y1="70"
                    x2={x2}
                    y2={y2}
                    stroke="var(--tarot-card-sigil)"
                    strokeWidth="0.4"
                    opacity="0.3"
                  />
                );
              })}
              <circle cx="50" cy="70" r="3" fill="var(--tarot-card-sigil)" opacity="0.46" />
              <circle cx="50" cy="70" r="1.5" fill="var(--tarot-card-sigil)" opacity="0.66" />
              <circle cx="50" cy="25" r="8" fill="none" stroke="var(--tarot-card-sigil)" strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="25" r="5" fill="none" stroke="var(--tarot-card-sigil-soft)" strokeWidth="0.4" opacity="0.25" />
              <circle cx="50" cy="25" r="2" fill="var(--tarot-card-sigil)" opacity="0.38" />
              <text x="20" y="22" fontSize="8" fill="var(--tarot-card-sigil-soft)" opacity="0.3">✦</text>
              <text x="77" y="22" fontSize="8" fill="var(--tarot-card-sigil-soft)" opacity="0.3">✦</text>
              <text x="20" y="126" fontSize="8" fill="var(--tarot-card-sigil-soft)" opacity="0.3">✦</text>
              <text x="77" y="126" fontSize="8" fill="var(--tarot-card-sigil-soft)" opacity="0.3">✦</text>
              <text x="50" y="112" fontSize="7" fill="var(--tarot-card-sigil)" opacity="0.28" textAnchor="middle" fontFamily="serif">
                TAROT
              </text>
              <text x="50" y="122" fontSize="6" fill="var(--tarot-card-sigil-soft)" opacity="0.24" textAnchor="middle" fontFamily="serif">
                MYSTIC ORACLE
              </text>
            </svg>
          </div>
        </>
      )}
    </div>
  );
});

export function TarotPickerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flowState = (location.state as ConsultationFlowState | null) ?? null;
  const tarotDeckVersionId =
    (flowState?.tarotDeckVersionId ?? getSelectedTarotDeckId()) as string;
  const selectedDeck = getTarotDeckById(tarotDeckVersionId);
  const [isSplit, setIsSplit] = useState(false);
  const [splitIndex, setSplitIndex] = useState(39);
  const [deckOrder, setDeckOrder] = useState<number[]>(INITIAL_DECK_ORDER);
  const [visualDeckOrder, setVisualDeckOrder] = useState<number[]>(INITIAL_DECK_ORDER);
  const [swappedOrder, setSwappedOrder] = useState(false); // Track if decks are swapped
  const [isShuffling, setIsShuffling] = useState(false); // Track shuffling animation
  const [hasShuffled, setHasShuffled] = useState(false); // Track if user has shuffled at least once
  const [isMergedStack, setIsMergedStack] = useState(false);
  const [isRandomShuffleAnimating, setIsRandomShuffleAnimating] = useState(false);
  const reduceWebViewEffects = isNativeWebViewRuntime();

  const isDraggingRotation = useRef(false);
  const shuffleCommitTimeoutRef = useRef<number | null>(null);
  const randomShuffleTimeoutRef = useRef<number | null>(null);
  const rotation = useSpring(0, {
    stiffness: 200,
    damping: 20,
  });

  const clearShuffleTimers = () => {
    if (shuffleCommitTimeoutRef.current !== null) {
      window.clearTimeout(shuffleCommitTimeoutRef.current);
      shuffleCommitTimeoutRef.current = null;
    }
    if (randomShuffleTimeoutRef.current !== null) {
      window.clearTimeout(randomShuffleTimeoutRef.current);
      randomShuffleTimeoutRef.current = null;
    }
  };

  useEffect(() => clearShuffleTimers, []);

  // Rotation drag (unified deck only, horizontal drag)
  const handleRotationDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    isDraggingRotation.current = true;
    const newRotation = rotation.get() + info.delta.x * 0.8;
    rotation.set(Math.max(-30, Math.min(30, newRotation)));
  };

  const handleRotationDragEnd = () => {
    setTimeout(() => {
      isDraggingRotation.current = false;
    }, 50);
    rotation.set(0);
  };

  // Split deck at specific card index when hotspot is clicked
  const handleCardHotspotClick = (physicalIndex: number) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering deck click
    if (isDraggingRotation.current || isSplit) return;
    
    // physicalIndex is the physical rendering position (i), not the logical card index
    // Split right after this physical position
    const finalSplitIndex = physicalIndex + 1;
    
    setHasShuffled(false);
    setIsMergedStack(false);
    setVisualDeckOrder(deckOrder);
    setSplitIndex(finalSplitIndex);
    setIsSplit(true);
  };

  const startShuffle = () => {
    if (isShuffling || isMergedStack) return;

    clearShuffleTimers();

    const nextDeckOrder = getSinglePassInterleavedOrder(visualDeckOrder, splitIndex);

    setIsShuffling(true);
    setSwappedOrder(true);

    shuffleCommitTimeoutRef.current = window.setTimeout(() => {
      setDeckOrder(nextDeckOrder);
      setVisualDeckOrder(nextDeckOrder);
      setSwappedOrder(false);
      setIsShuffling(false);
      setIsMergedStack(true);
      setHasShuffled(true);
    }, SHUFFLE_ANIMATION_MS);
  };

  // Click upper deck to swap (merge and swap order)
  const handleUpperDeckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startShuffle();
  };

  // Click lower deck to swap (merge and swap order)
  const handleLowerDeckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startShuffle();
  };

  const handleConfirm = () => {
    navigate('/tarot-spread', {
      state: {
        ...flowState,
        deckOrder,
        tarotDeckVersionId,
      },
    });
  };

  const handleRandomShuffle = () => {
    if (isShuffling) return;

    clearShuffleTimers();

    const nextDeckOrder = getRandomShuffledOrder(deckOrder);
    setDeckOrder(nextDeckOrder);
    setVisualDeckOrder(nextDeckOrder);
    setHasShuffled(true);
    setIsMergedStack(false);
    setIsSplit(false);
    setSwappedOrder(false);
    setIsRandomShuffleAnimating(true);
    rotation.set(0);

    randomShuffleTimeoutRef.current = window.setTimeout(() => {
      setIsRandomShuffleAnimating(false);
    }, RANDOM_SHUFFLE_ANIMATION_MS);
  };

  const upperDeckCards = visualDeckOrder.slice(0, splitIndex);
  const lowerDeckCards = visualDeckOrder.slice(splitIndex);
  const canProceedToSpread = hasShuffled && !isShuffling;
  const splitPointZ = (splitIndex - 1) * CARD_THICKNESS;
  const depthFactor = splitIndex / TOTAL_CARDS;
  const compensatedDistance = SPLIT_DISTANCE * (1 + depthFactor * SPLIT_DEPTH_MULTIPLIER);
  const upperDeckZ = splitPointZ - compensatedDistance / 2;
  const lowerDeckZ = splitPointZ + compensatedDistance / 2;

  return (
    <div className="tarot-picker-page relative min-h-screen overflow-hidden" style={{ ...tarotPageVars, backgroundColor: 'var(--tarot-bg-color)' }}>
      {/* Mystic purple gradient background */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--tarot-ambient-start) 0%, var(--tarot-ambient-mid) 50%, var(--tarot-ambient-end) 100%)',
          }}
        />
        
        {/* Star dust particles */}
        {(reduceWebViewEffects ? STATIC_STARS.slice(0, 24) : STATIC_STARS).map((star) => (
          <div
            key={star.id}
            className="absolute h-1 w-1 rounded-full"
            style={{
              left: star.left,
              top: star.top,
              opacity: star.opacity,
              backgroundColor: 'var(--tarot-text-main)',
            }}
          />
        ))}
        
        {/* Ambient glows */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-a)' }} />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-b)' }} />
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-md px-5 pt-6">
        {/* Top Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate('/consultation', {
                  state: {
                    ...flowState,
                    tarotDeckVersionId,
                  },
                })
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
              style={{
                borderColor: 'var(--tarot-surface-border)',
                backgroundColor: 'var(--tarot-surface-bg)',
              }}
            >
              <ArrowLeft className="h-5 w-5" style={{ color: 'var(--tarot-text-muted)' }} />
            </button>
            <div>
              <h1 className="text-xl font-medium" style={{ color: 'var(--tarot-text-main)' }}>카드 섞기</h1>
              <p className="text-xs" style={{ color: 'var(--tarot-text-muted)' }}>측면을 눌러 덱을 가르고, 좌우로 천천히 돌려 오늘의 리듬을 정하세요.</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={handleRandomShuffle}
            disabled={isShuffling}
            className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border backdrop-blur-xl transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              borderColor: 'var(--tarot-surface-border)',
              backgroundColor: 'var(--tarot-surface-bg)',
              color: 'var(--tarot-text-muted)',
            }}
            aria-label="랜덤 셔플"
            title="랜덤 셔플"
            whileHover={isShuffling ? undefined : { scale: 1.06 }}
            whileTap={isShuffling ? undefined : { scale: 0.92, rotate: -8 }}
            animate={
              isRandomShuffleAnimating
                ? {
                    scale: [1, 1.16, 0.94, 1.06, 1],
                    rotate: [0, -14, 14, -7, 0],
                    borderColor: [
                      'rgba(255,255,255,0.1)',
                      'rgba(212,175,55,0.85)',
                      'rgba(168,85,247,0.55)',
                      'rgba(255,255,255,0.1)',
                    ],
                    backgroundColor: [
                      'rgba(255,255,255,0.05)',
                      'rgba(212,175,55,0.14)',
                      'rgba(168,85,247,0.16)',
                      'rgba(255,255,255,0.05)',
                    ],
                  }
                : {
                    scale: 1,
                    rotate: 0,
                    borderColor: 'rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }
            }
            transition={{ duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={
                isRandomShuffleAnimating
                  ? {
                      opacity: [0, 0.95, 0],
                      scale: [0.72, 1.55, 1.9],
                    }
                  : { opacity: 0, scale: 1 }
              }
              transition={{ duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000, ease: 'easeOut' }}
              style={{
                background:
                  'radial-gradient(circle, rgba(212,175,55,0.46) 0%, rgba(168,85,247,0.24) 42%, rgba(168,85,247,0) 76%)',
              }}
            />
            <motion.div
              className="absolute inset-[1px] rounded-full"
              animate={
                isRandomShuffleAnimating
                  ? {
                      opacity: [0.2, 1, 0.34],
                      boxShadow: [
                        '0 0 0 rgba(212, 175, 55, 0)',
                        '0 0 28px rgba(212, 175, 55, 0.5)',
                        '0 0 16px rgba(168, 85, 247, 0.28)',
                      ],
                    }
                  : {
                      opacity: 1,
                      boxShadow: '0 0 0 rgba(212, 175, 55, 0)',
                    }
              }
              transition={{ duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative z-10"
              animate={
                isRandomShuffleAnimating
                  ? {
                      rotate: [0, -22, 22, -10, 0],
                      scale: [1, 1.18, 0.95, 1.08, 1],
                    }
                  : { rotate: 0, scale: 1 }
              }
              transition={{ duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
            >
              <Shuffle className="h-4.5 w-4.5" />
            </motion.div>
          </motion.button>
        </div>

        {/* Card deck - horizontal lying stack */}
        <div className="relative mb-4 flex min-h-[450px] items-center justify-center" style={{ perspective: '1200px' }}>
          <AnimatePresence>
            {isRandomShuffleAnimating ? (
              <motion.div
                key="random-shuffle-burst"
                className="pointer-events-none absolute inset-x-6 top-8 bottom-8 rounded-full"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{
                  opacity: [0, 0.72, 0.24, 0],
                  scale: [0.82, 1.06, 1.16],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000, ease: 'easeOut' }}
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(212,175,55,0.16) 0%, rgba(168,85,247,0.16) 36%, rgba(10,10,18,0) 74%)',
                  filter: 'blur(8px)',
                }}
              />
            ) : null}
          </AnimatePresence>
          {!isSplit ? (
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.04}
              dragMomentum={false}
              onDrag={handleRotationDrag}
              onDragEnd={handleRotationDragEnd}
              className="cursor-grab active:cursor-grabbing"
              style={{
                transformStyle: 'preserve-3d',
                rotateY: rotation,
                willChange: 'transform',
                touchAction: 'none',
              }}
              animate={{
                rotateZ: isRandomShuffleAnimating ? [0, -1.6, 1.2, -0.7, 0.2, 0] : 0,
                scale: isRandomShuffleAnimating ? [1, 0.992, 1.008, 0.996, 1] : 1,
                x: isRandomShuffleAnimating ? [0, -6, 5, -2, 0] : 0,
                y: isRandomShuffleAnimating ? [0, -5, 2, -1, 0] : 0,
              }}
              transition={{
                duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                className="relative"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${ROTATION_ANGLE}deg)`,
                }}
              >
                {visualDeckOrder.map((cardIndex, i) => {
                  const zOffset = i * CARD_THICKNESS;
                  const isVisible = i % 2 === 0 || i < 5 || i > TOTAL_CARDS - 6;
                  const isTopCard = i === TOTAL_CARDS - 1;
                  const isBottomCard = i === 0;
                  const shuffleCardMotion = getRandomShuffleChunkMotion(i, isRandomShuffleAnimating);

                  return (
                    <motion.div
                      key={cardIndex}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                        z: zOffset,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                      animate={shuffleCardMotion.animate}
                      transition={shuffleCardMotion.transition}
                    >
                      <DeckCardFace
                        isBottomCard={isBottomCard}
                        isTopCard={isTopCard}
                        isVisible={isVisible}
                        reduceEffects={reduceWebViewEffects}
                      />

                      {!isBottomCard && (
                        <div
                          onClick={handleCardHotspotClick(i)}
                          className="absolute bottom-0 left-0 right-0 cursor-pointer transition-colors"
                          style={{
                            height: '10px',
                            zIndex: 1000,
                          }}
                        >
                          <div
                            className="h-full w-full border-b-2 transition-colors"
                            style={{
                              borderColor: 'transparent',
                            }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div
              className="relative"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${ROTATION_ANGLE}deg)`,
              }}
            >
              <motion.div
                onClick={handleUpperDeckClick}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  pointerEvents: isMergedStack ? 'none' : 'auto',
                }}
                animate={{
                  z: isShuffling
                    ? [upperDeckZ, upperDeckZ, lowerDeckZ, TOTAL_CARDS - 1]
                    : isMergedStack
                      ? TOTAL_CARDS - 1
                      : upperDeckZ,
                  y: isShuffling ? [0, SHUFFLE_VERTICAL_TRAVEL, SHUFFLE_VERTICAL_TRAVEL, 0] : 0,
                }}
                transition={{
                  z: {
                    duration: SHUFFLE_ANIMATION_DURATION,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.35, 0.72, 1],
                  },
                  y: {
                    duration: SHUFFLE_ANIMATION_DURATION,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.35, 0.72, 1],
                  },
                }}
                whileHover={{ scale: isShuffling ? 1 : 1.02 }}
                whileTap={{ scale: isShuffling ? 1 : 0.98 }}
              >
                {upperDeckCards.map((cardIndex, i) => {
                  const zOffset = i * CARD_THICKNESS - splitPointZ;
                  const isVisible = i % 2 === 0 || i < 5 || i > upperDeckCards.length - 6;
                  const isTopCard = i === upperDeckCards.length - 1;
                  const isBottomCard = !isMergedStack && i === 0;

                  return (
                    <motion.div
                      key={`upper-${cardIndex}`}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                        z: zOffset,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      <DeckCardFace
                        isBottomCard={isBottomCard}
                        isTopCard={isTopCard}
                        isVisible={isVisible}
                        reduceEffects={reduceWebViewEffects}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                onClick={handleLowerDeckClick}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  pointerEvents: isMergedStack ? 'none' : 'auto',
                }}
                animate={{
                  z: isShuffling
                    ? [lowerDeckZ, lowerDeckZ, upperDeckZ, 0]
                    : isMergedStack
                      ? 0
                      : lowerDeckZ,
                  y: isShuffling ? [0, -SHUFFLE_VERTICAL_TRAVEL, -SHUFFLE_VERTICAL_TRAVEL, 0] : 0,
                }}
                transition={{
                  z: {
                    duration: SHUFFLE_ANIMATION_DURATION,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.35, 0.72, 1],
                  },
                  y: {
                    duration: SHUFFLE_ANIMATION_DURATION,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.35, 0.72, 1],
                  },
                }}
                whileHover={{ scale: isShuffling ? 1 : 1.02 }}
                whileTap={{ scale: isShuffling ? 1 : 0.98 }}
              >
                {lowerDeckCards.map((cardIndex, i) => {
                  const zOffset = i * CARD_THICKNESS;
                  const deckSize = lowerDeckCards.length;
                  const isVisible = i % 2 === 0 || i < 5 || i > deckSize - 6;
                  const isTopCard = i === deckSize - 1;
                  const isBottomCard = i === 0;

                  return (
                    <motion.div
                      key={`lower-${cardIndex}`}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                        z: zOffset,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      <DeckCardFace
                        isBottomCard={isBottomCard}
                        isTopCard={isTopCard}
                        isVisible={isVisible}
                        reduceEffects={reduceWebViewEffects}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {isMergedStack && (
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${CARD_WIDTH}px`,
                    height: `${CARD_HEIGHT}px`,
                    transform: `translateZ(${MERGED_TOP_CARD_Z}px)`,
                    transformStyle: 'preserve-3d',
                    zIndex: 5,
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <DeckCardFace
                    isBottomCard={false}
                    isTopCard
                    isVisible
                    reduceEffects={reduceWebViewEffects}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keep button area mounted to avoid repainting the whole content stack after shuffle */}
        <div className="-mt-3 pb-2 pt-0" style={{ minHeight: '68px' }}>
          <motion.div
            initial={false}
            animate={{
              opacity: canProceedToSpread ? 1 : 0,
              y: canProceedToSpread ? 0 : 20,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={canProceedToSpread ? '' : 'pointer-events-none'}
          >
            <motion.button
              onClick={handleConfirm}
              className="group relative w-full overflow-hidden rounded-2xl border px-6 py-5 backdrop-blur-xl transition-all"
              style={{
                borderColor: 'var(--tarot-cta-border)',
                background:
                  'linear-gradient(135deg, var(--tarot-cta-start) 0%, var(--tarot-cta-mid) 50%, var(--tarot-cta-end) 100%)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-white/[0.05]" />
              
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  boxShadow:
                    '0 0 22px var(--tarot-accent-glow-soft), inset 0 0 18px var(--tarot-accent-glow-soft)',
                }}
              />

              <div className="relative flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: 'var(--tarot-text-main)' }} />
                <span className="text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>
                  카드 펼치기
                </span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
