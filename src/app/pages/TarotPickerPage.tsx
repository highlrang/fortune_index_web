import { memo, useEffect, useRef, useState } from 'react';
import { motion, PanInfo, useSpring } from 'motion/react';
import { ArrowLeft, Shuffle, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';

type ConsultationType = 'market' | 'saju' | 'tarot' | 'comprehensive' | null;
type ConsultationFlowState = {
  selectedType?: ConsultationType;
  selectedScenario?: string;
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
const POST_SHUFFLE_UI_DELAY_MS = 220;
const SHUFFLE_VERTICAL_TRAVEL = 180;
const RANDOM_SHUFFLE_ANIMATION_MS = 720;
const INITIAL_DECK_ORDER = Array.from({ length: TOTAL_CARDS }, (_, index) => index);
const CARD_WIDTH = 220;
const CARD_HEIGHT = 340;

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
};

const deckCardFaceStyle = {
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
  transform: 'translateZ(0)',
};

function getCutShuffledOrder(order: number[], cutIndex: number) {
  return [...order.slice(cutIndex), ...order.slice(0, cutIndex)];
}

function getRandomShuffledOrder(order: number[]) {
  const next = [...order];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

const DeckCardFace = memo(function DeckCardFace({
  isBottomCard,
  isTopCard,
  isVisible,
}: DeckCardFaceProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-purple-900/80 via-violet-800/70 to-purple-900/80"
      style={{
        ...deckCardFaceStyle,
        opacity: isVisible ? (isTopCard || isBottomCard ? 1 : 0.95) : 0.3,
        borderColor: 'rgba(212, 175, 55, 0.45)',
        boxShadow: isTopCard || isBottomCard
          ? '0 6px 20px rgba(0, 0, 0, 0.22)'
          : '0 1px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="absolute inset-0 rounded-2xl border border-white/6" />
      {isTopCard && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.06]" />
          <motion.div
            className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_74%)]"
            animate={{ opacity: [0.16, 0.34, 0.16] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-10">
            <svg className="h-full w-full" viewBox="0 0 100 140">
              <polygon
                points="50,20 75,35 75,65 50,80 25,65 25,35"
                fill="none"
                stroke="white"
                strokeWidth="0.8"
                opacity="0.4"
              />
              <polygon
                points="50,30 68,42 68,58 50,70 32,58 32,42"
                fill="none"
                stroke="white"
                strokeWidth="0.6"
                opacity="0.35"
              />
              <circle cx="50" cy="50" r="5" fill="white" opacity="0.5" />
              <circle cx="50" cy="50" r="2.5" fill="white" opacity="0.7" />
              <circle cx="50" cy="15" r="2" fill="white" opacity="0.3" />
              <circle cx="50" cy="85" r="2" fill="white" opacity="0.3" />
              <line x1="50" y1="50" x2="50" y2="20" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="75" y2="35" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="75" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="50" y2="80" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="25" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="25" y2="35" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <text x="50" y="105" fontSize="10" fill="white" opacity="0.3" textAnchor="middle" fontFamily="serif">
                ✦ ARCANA ✦
              </text>
              <text x="50" y="120" fontSize="7" fill="white" opacity="0.2" textAnchor="middle" fontFamily="serif">
                MAJOR
              </text>
            </svg>
          </div>
        </>
      )}

      {isBottomCard && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.06]" />
          <motion.div
            className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.16),transparent_76%)]"
            animate={{ opacity: [0.14, 0.3, 0.14] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <svg className="h-full w-full" viewBox="0 0 100 140">
              <rect x="8" y="8" width="84" height="124" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" rx="4" />
              <rect x="12" y="12" width="76" height="116" fill="none" stroke="white" strokeWidth="0.4" opacity="0.25" rx="3" />
              <circle cx="50" cy="70" r="25" fill="none" stroke="white" strokeWidth="0.6" opacity="0.35" />
              <circle cx="50" cy="70" r="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="70" r="15" fill="none" stroke="white" strokeWidth="0.4" opacity="0.25" />
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
                    stroke="white"
                    strokeWidth="0.4"
                    opacity="0.3"
                  />
                );
              })}
              <circle cx="50" cy="70" r="3" fill="white" opacity="0.5" />
              <circle cx="50" cy="70" r="1.5" fill="white" opacity="0.7" />
              <circle cx="50" cy="25" r="8" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="25" r="5" fill="none" stroke="white" strokeWidth="0.4" opacity="0.25" />
              <circle cx="50" cy="25" r="2" fill="white" opacity="0.4" />
              <text x="20" y="22" fontSize="8" fill="white" opacity="0.25">✦</text>
              <text x="77" y="22" fontSize="8" fill="white" opacity="0.25">✦</text>
              <text x="20" y="126" fontSize="8" fill="white" opacity="0.25">✦</text>
              <text x="77" y="126" fontSize="8" fill="white" opacity="0.25">✦</text>
              <text x="50" y="112" fontSize="7" fill="white" opacity="0.25" textAnchor="middle" fontFamily="serif">
                TAROT
              </text>
              <text x="50" y="122" fontSize="6" fill="white" opacity="0.2" textAnchor="middle" fontFamily="serif">
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

  const isDraggingRotation = useRef(false);
  const shuffleCommitTimeoutRef = useRef<number | null>(null);
  const shuffledUiTimeoutRef = useRef<number | null>(null);
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
    if (shuffledUiTimeoutRef.current !== null) {
      window.clearTimeout(shuffledUiTimeoutRef.current);
      shuffledUiTimeoutRef.current = null;
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

  const handleMergedDeckHotspotClick = (physicalIndex: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMergedStack || isShuffling) return;

    setHasShuffled(false);
    setIsMergedStack(false);
    setVisualDeckOrder(deckOrder);
    setSplitIndex(physicalIndex + 1);
  };

  const startShuffle = () => {
    if (isShuffling) return;

    clearShuffleTimers();

    setIsShuffling(true);
    setSwappedOrder(true);

    shuffleCommitTimeoutRef.current = window.setTimeout(() => {
      const nextDeckOrder = getCutShuffledOrder(visualDeckOrder, splitIndex);
      setDeckOrder(nextDeckOrder);
      setSwappedOrder(false);
      setIsShuffling(false);
      setIsMergedStack(true);

      shuffledUiTimeoutRef.current = window.setTimeout(() => {
        setHasShuffled(true);
      }, POST_SHUFFLE_UI_DELAY_MS);
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
  const splitPointZ = (splitIndex - 1) * CARD_THICKNESS;
  const depthFactor = splitIndex / TOTAL_CARDS;
  const compensatedDistance = SPLIT_DISTANCE * (1 + depthFactor * SPLIT_DEPTH_MULTIPLIER);
  const upperDeckZ = splitPointZ - compensatedDistance / 2;
  const lowerDeckZ = splitPointZ + compensatedDistance / 2;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A12]">
      {/* Mystic purple gradient background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-900/30 to-violet-950/50" />
        
        {/* Star dust particles */}
        {STATIC_STARS.map((star) => (
          <div
            key={star.id}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              opacity: star.opacity,
            }}
          />
        ))}
        
        {/* Ambient glows */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
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
            >
              <ArrowLeft className="h-5 w-5 text-white/60" />
            </button>
            <div>
              <h1 className="text-xl font-medium text-white">카드 섞기</h1>
              <p className="text-xs text-white/50">{selectedDeck.name} 덱으로 운명의 순서를 만들어보세요</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRandomShuffle}
            disabled={isShuffling}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-xl transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="랜덤 셔플"
            title="랜덤 셔플"
          >
            <Shuffle className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Guide text */}
        <div className="mb-4 text-center">
          <p className="text-base leading-relaxed text-white/80">
            {isSplit 
              ? '덱을 터치해서 위아래 순서를 바꿔보세요' 
              : '측면을 터치해서 분리하고, 좌우로 회전시켜보세요'}
          </p>
        </div>

        {/* Card deck - horizontal lying stack */}
        <div className="relative mb-8 flex min-h-[450px] items-center justify-center" style={{ perspective: '1200px' }}>
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
              }}
              animate={{
                rotateZ: isRandomShuffleAnimating ? [0, -2.5, 2.2, -1, 0.35, 0] : 0,
                scale: isRandomShuffleAnimating ? [1, 0.985, 1.01, 0.996, 1] : 1,
                y: isRandomShuffleAnimating ? [0, -8, 3, -2, 0] : 0,
              }}
              transition={{
                duration: RANDOM_SHUFFLE_ANIMATION_MS / 1000,
                ease: 'easeInOut',
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
                  const isTopCard = i === 0;
                  const isBottomCard = i === TOTAL_CARDS - 1;

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
                    >
                      <DeckCardFace
                        isBottomCard={isBottomCard}
                        isTopCard={isTopCard}
                        isVisible={isVisible}
                      />

                      {!isBottomCard && (
                        <div
                          onClick={handleCardHotspotClick(i)}
                          className="absolute bottom-0 left-0 right-0 cursor-pointer transition-colors hover:bg-[#D4AF37]/30"
                          style={{
                            height: '10px',
                            zIndex: 1000,
                          }}
                        >
                          <div className="h-full w-full border-b-2 border-[#D4AF37]/0 transition-colors hover:border-[#D4AF37]/80" />
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
                pointerEvents={isMergedStack ? 'none' : 'auto'}
                whileHover={{ scale: isShuffling ? 1 : 1.02 }}
                whileTap={{ scale: isShuffling ? 1 : 0.98 }}
              >
                {upperDeckCards.map((cardIndex, i) => {
                  const zOffset = i * CARD_THICKNESS - splitPointZ;
                  const isVisible = i % 2 === 0 || i < 5 || i > upperDeckCards.length - 6;
                  const isTopCard = i === 0;
                  const isBottomCard = i === upperDeckCards.length - 1;

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
                pointerEvents={isMergedStack ? 'none' : 'auto'}
                whileHover={{ scale: isShuffling ? 1 : 1.02 }}
                whileTap={{ scale: isShuffling ? 1 : 0.98 }}
              >
                {lowerDeckCards.map((cardIndex, i) => {
                  const zOffset = i * CARD_THICKNESS;
                  const deckSize = lowerDeckCards.length;
                  const isVisible = i % 2 === 0 || i < 5 || i > deckSize - 6;
                  const isTopCard = i === 0;
                  const isBottomCard = i === deckSize - 1;

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
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {isMergedStack && (
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {visualDeckOrder.map((cardIndex, i) => {
                    const zOffset = i * CARD_THICKNESS;
                    const isBottomCard = i === TOTAL_CARDS - 1;

                    if (isBottomCard) {
                      return null;
                    }

                    return (
                      <motion.div
                        key={`merged-hotspot-${cardIndex}`}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{
                          width: `${CARD_WIDTH}px`,
                          height: `${CARD_HEIGHT}px`,
                          z: zOffset,
                          pointerEvents: 'none',
                        }}
                      >
                        <div
                          onClick={handleMergedDeckHotspotClick(i)}
                          className="absolute bottom-0 left-0 right-0 cursor-pointer transition-colors hover:bg-[#D4AF37]/30"
                          style={{
                            height: '10px',
                            zIndex: 1000,
                            pointerEvents: 'auto',
                          }}
                        >
                          <div className="h-full w-full border-b-2 border-[#D4AF37]/0 transition-colors hover:border-[#D4AF37]/80" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keep button area mounted to avoid repainting the whole content stack after shuffle */}
        <div className="pb-8 pt-2" style={{ minHeight: '104px' }}>
          <motion.div
            initial={false}
            animate={{
              opacity: hasShuffled ? 1 : 0,
              y: hasShuffled ? 0 : 20,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={hasShuffled ? '' : 'pointer-events-none'}
          >
            <motion.button
              onClick={handleConfirm}
              className="group relative w-full overflow-hidden rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-600/60 via-violet-600/50 to-purple-600/60 px-6 py-5 backdrop-blur-xl transition-all hover:border-purple-400/60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-white/[0.05]" />
              
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.2)',
                    '0 0 30px rgba(168, 85, 247, 0.6), inset 0 0 30px rgba(168, 85, 247, 0.4)',
                    '0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.2)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <div className="relative flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="text-base font-semibold text-white">
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
