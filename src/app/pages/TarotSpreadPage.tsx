import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';

type ConsultationType = 'market' | 'saju' | 'tarot' | 'comprehensive' | null;
type ConsultationFlowState = {
  deckOrder?: number[];
  selectedType?: ConsultationType;
  selectedScenario?: string;
  question?: string;
  tarotDeckVersionId?: string;
};

const TOTAL_CARDS = 78;
const MAX_SELECTIONS = 3;
const CARD_WIDTH = 85;
const CARD_HEIGHT = 128;
const CARD_OVERLAP = 26; // Cards overlap 70% (30% visible)
const DEFAULT_DECK_ORDER = Array.from({ length: TOTAL_CARDS }, (_, index) => index);

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
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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

  useEffect(() => {
    const unsubscribe = centerCardIndex.on('change', (latest) => {
      setCurrentCenterIndex(latest);
    });
    return () => unsubscribe();
  }, [centerCardIndex]);

  // Select/deselect card
  const toggleCardSelection = (cardId: number) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((value) => value !== cardId));
    } else if (selectedCards.length < MAX_SELECTIONS) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  // Remove card from slot
  const removeFromSlot = (cardId: number) => {
    setSelectedCards(selectedCards.filter((value) => value !== cardId));
  };

  const handleConfirm = () => {
    navigate('/tarot-result', {
      state: {
        ...flowState,
        selectedCards,
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
    scrollX.set(targetScroll);
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={pageGradientStyle}>
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: 'var(--tarot-text-main)',
            }}
            animate={{
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div
        className="absolute left-0 right-0 top-0 z-50 px-4 py-3"
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
                {selectedDeck.name} · {selectedCards.length} / {MAX_SELECTIONS} 선택
              </p>
            </div>
          </div>

          {/* Selection counter */}
          <div className="flex gap-2">
            {Array.from({ length: MAX_SELECTIONS }).map((_, i) => (
              <motion.div
                key={i}
                className="h-2.5 w-2.5 rounded-full border"
                style={
                  i < selectedCards.length
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
                animate={{
                  scale: i < selectedCards.length ? [1, 1.4, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                }}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-2 max-w-7xl">
          <div className="inline-flex rounded-full border px-3 py-1 text-[11px]" style={{ ...glassCardStyle, color: 'var(--app-text-muted)' }}>
            가로로 돌려서 이용하시면 카드 선택이 더 편합니다
          </div>
        </div>
      </div>

      <div className="absolute left-0 right-0 top-0 z-40 h-[33%] pt-16" style={{ borderBottom: '1px solid var(--app-surface-divider)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, var(--tarot-card-cover-glow) 50%, transparent 100%)', opacity: 0.35 }} />
        <div className="absolute left-1/2 top-1/2 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-card-cover-glow)' }} />

        {/* Card Slots */}
        <div className="flex h-full items-center justify-center gap-3 px-4">
          {Array.from({ length: MAX_SELECTIONS }).map((_, slotIndex) => {
            const cardIndex = selectedCards[slotIndex];
            const hasCard = cardIndex !== undefined;

            return (
              <motion.div
                key={slotIndex}
                className="relative"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: slotIndex * 0.1 }}
              >
                {/* Empty Slot */}
                <motion.div
                  className="overflow-hidden rounded-xl border border-dashed transition-all"
                  style={{
                    width: `${CARD_WIDTH}px`,
                    height: `${CARD_HEIGHT}px`,
                    ...glassCardStyle,
                    borderColor: hasCard ? 'var(--tarot-card-cover-border)' : 'var(--tarot-card-line-soft)',
                    backgroundColor: 'color-mix(in srgb, var(--app-surface-bg) 70%, transparent)',
                  }}
                  animate={{
                    boxShadow: hasCard
                      ? '0 0 15px var(--tarot-card-cover-glow)'
                      : [
                          '0 0 8px color-mix(in srgb, var(--tarot-card-line) 35%, transparent)',
                          '0 0 12px color-mix(in srgb, var(--tarot-card-line) 55%, transparent)',
                          '0 0 8px color-mix(in srgb, var(--tarot-card-line) 35%, transparent)',
                        ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: hasCard ? 0 : Infinity,
                  }}
                >
                  {!hasCard && (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-2xl" style={{ color: 'var(--app-text-subtle)' }}>{slotIndex + 1}</span>
                    </div>
                  )}
                </motion.div>

                {/* Selected Card in Slot */}
                <AnimatePresence>
                  {hasCard && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 150 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: 150 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      }}
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => removeFromSlot(cardIndex)}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className="h-full w-full overflow-hidden rounded-xl border"
                        style={{
                          ...cardBackStyle,
                          boxShadow: '0 0 20px var(--tarot-card-cover-glow), inset 0 0 18px rgba(255, 255, 255, 0.12)',
                        }}
                      >
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)' }} />
                        
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            boxShadow: [
                              'inset 0 0 15px rgba(255,255,255,0.08)',
                              'inset 0 0 25px var(--tarot-card-cover-glow)',
                              'inset 0 0 15px rgba(255,255,255,0.08)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        />

                        <div className="absolute inset-0 flex items-center justify-center p-3">
                          <TarotCardBackPattern />
                        </div>

                        {/* Remove number badge */}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION - Ultra-Dense Horizontal Carousel (2/3 of screen) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-[67%]">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--tarot-card-cover-glow) 0%, transparent 35%)', opacity: 0.4 }} />
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
            dragElastic={0.05}
            dragMomentum={true}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ x: scrollX }}
            className="absolute left-1/2 top-1/2 flex h-full -translate-y-1/2 cursor-grab items-center active:cursor-grabbing"
          >
            {deckOrder.map((cardId, index) => {
              const isSelected = selectedCards.includes(cardId);
              const isCentered = index === currentCenterIndex;

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
                    zIndex: isCentered ? 1000 : index,
                  }}
                  animate={{
                    y: (isCentered && !isSelected ? -8 : 0) + verticalOffset,
                    opacity: isSelected ? 0 : 1,
                    rotate: rotationAngle,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  onClick={() => {
                    if (!isDragging && !isSelected) {
                      // If card is not active, make it active
                      if (!isCentered) {
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
                        ? '0 0 25px var(--tarot-card-cover-glow), inset 0 0 20px rgba(255,255,255,0.12)'
                        : '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                    whileHover={!isDragging && !isSelected ? { scale: 1.03 } : {}}
                    whileTap={!isDragging && !isSelected ? { scale: 0.97 } : {}}
                  >
                    {/* Glass effect */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)' }} />
                    
                    {/* Center card glow */}
                    {isCentered && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: [
                            'inset 0 0 15px rgba(255,255,255,0.08)',
                            'inset 0 0 25px var(--tarot-card-cover-glow)',
                            'inset 0 0 15px rgba(255,255,255,0.08)',
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    )}
                    
                    {/* Card back pattern */}
                    <div className="absolute inset-0 flex items-center justify-center p-3">
                      <TarotCardBackPattern />
                    </div>

                    <div className="pointer-events-none absolute inset-0 rounded-lg border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 40%, transparent)' }} />

                    {/* Center indicator */}
                    {isCentered && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                        <motion.div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--tarot-point-color)' }}
                          animate={{
                            boxShadow: [
                              '0 0 4px var(--tarot-card-cover-glow)',
                              '0 0 8px var(--tarot-card-cover-glow)',
                              '0 0 4px var(--tarot-card-cover-glow)',
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-5 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4">
        {/* Confirm button */}
        {selectedCards.length === MAX_SELECTIONS && (
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
              animate={{
                boxShadow: [
                  '0 0 18px var(--tarot-card-cover-glow), inset 0 0 18px var(--tarot-card-cover-glow)',
                  '0 0 28px var(--tarot-card-cover-glow), inset 0 0 28px var(--tarot-card-cover-glow)',
                  '0 0 18px var(--tarot-card-cover-glow), inset 0 0 18px var(--tarot-card-cover-glow)',
                ],
              }}
              transition={{
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

      <div className="absolute bottom-20 left-0 right-0 z-10 text-center">
        <p className="text-xs" style={{ color: 'var(--app-text-subtle)' }}>
          좌우로 드래그하여 카드를 탐색하세요
        </p>
      </div>
    </div>
  );
}
