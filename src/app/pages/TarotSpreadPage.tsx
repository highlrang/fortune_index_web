import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { DEFAULT_TAROT_DECK_ID, getTarotDeckById } from '@/lib/tarot';

const TOTAL_CARDS = 78;
const MAX_SELECTIONS = 3;
const CARD_WIDTH = 85;
const CARD_HEIGHT = 128;
const CARD_OVERLAP = 26; // Cards overlap 70% (30% visible)
const DEFAULT_DECK_ORDER = Array.from({ length: TOTAL_CARDS }, (_, index) => index);

export function TarotSpreadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const deckOrder = ((location.state as { deckOrder?: number[] } | null)?.deckOrder ?? DEFAULT_DECK_ORDER) as number[];
  const tarotDeckVersionId =
    ((location.state as { tarotDeckVersionId?: string } | null)?.tarotDeckVersionId ?? DEFAULT_TAROT_DECK_ID) as string;
  const selectedDeck = getTarotDeckById(tarotDeckVersionId);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isLandscape, setIsLandscape] = useState(false);
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

  // Check if screen is in landscape mode
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

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
    console.log('Selected cards:', selectedCards);
    navigate('/tarot-result', { state: { selectedCards, deckOrder, tarotDeckVersionId } });
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
    <div className="fixed inset-0 overflow-hidden bg-[#0A0A12]">
      {/* Rotate device overlay */}
      <AnimatePresence>
        {!isLandscape && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0A0A12]/95 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center gap-6 px-8 text-center">
              <motion.div
                animate={{ rotate: 90 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="h-32 w-20 rounded-2xl border-4 border-white/30 bg-white/10" />
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -right-12 top-1/2 -translate-y-1/2"
                >
                  <RotateCcw className="h-8 w-8 text-white/60" />
                </motion.div>
              </motion.div>
              <div>
                <h2 className="mb-2 text-2xl font-semibold text-white">
                  화면을 돌려주세요
                </h2>
                <p className="text-sm text-white/60">
                  카드를 펼치려면 가로 모드가 필요합니다
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mystic night sky background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A1E] via-[#0D1330] to-[#0A0A1E]" />
        
        {/* Star field */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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

      {/* Top Header */}
      <div className="absolute left-0 right-0 top-0 z-50 bg-gradient-to-b from-[#0A0A12]/90 via-[#0A0A12]/70 to-transparent px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tarot-picker', { state: { tarotDeckVersionId } })}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 text-white/60" />
            </button>
            <div>
              <h1 className="text-base font-medium text-white">타로 카드 선택</h1>
              <p className="text-xs text-[#D4AF37]/70">
                {selectedDeck.name} · {selectedCards.length} / {MAX_SELECTIONS} 선택
              </p>
            </div>
          </div>

          {/* Selection counter */}
          <div className="flex gap-2">
            {Array.from({ length: MAX_SELECTIONS }).map((_, i) => (
              <motion.div
                key={i}
                className={`h-2.5 w-2.5 rounded-full border ${
                  i < selectedCards.length
                    ? 'border-[#D4AF37] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                    : 'border-white/30 bg-transparent'
                }`}
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
      </div>

      {/* TOP SECTION - Card Holder Slots (1/3 of screen) */}
      <div className="absolute left-0 right-0 top-0 z-40 h-[33%] border-b border-white/5 pt-16">
        {/* Soft golden glow background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/3 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/6 blur-3xl" />

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
                  className={`overflow-hidden rounded-xl border border-dashed bg-white/[0.02] backdrop-blur-sm transition-all ${
                    hasCard ? 'border-[#D4AF37]/30' : 'border-white/15'
                  }`}
                  style={{
                    width: `${CARD_WIDTH}px`,
                    height: `${CARD_HEIGHT}px`,
                  }}
                  animate={{
                    boxShadow: hasCard
                      ? '0 0 15px rgba(212, 175, 55, 0.25)'
                      : [
                          '0 0 8px rgba(255, 255, 255, 0.08)',
                          '0 0 12px rgba(255, 255, 255, 0.12)',
                          '0 0 8px rgba(255, 255, 255, 0.08)',
                        ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: hasCard ? 0 : Infinity,
                  }}
                >
                  {!hasCard && (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-2xl text-white/15">{slotIndex + 1}</span>
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
                        className="h-full w-full overflow-hidden rounded-xl border border-[#D4AF37] bg-gradient-to-br from-purple-900/95 via-violet-800/90 to-purple-900/95"
                        style={{
                          boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), inset 0 0 15px rgba(168, 85, 247, 0.35)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.06]" />
                        
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            boxShadow: [
                              'inset 0 0 15px rgba(168, 85, 247, 0.3)',
                              'inset 0 0 25px rgba(168, 85, 247, 0.5)',
                              'inset 0 0 15px rgba(168, 85, 247, 0.3)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        />

                        <div className="absolute inset-0 flex items-center justify-center p-3">
                          <svg className="h-full w-full" viewBox="0 0 100 140">
                            <polygon points="50,25 70,38 70,62 50,75 30,62 30,38" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" />
                            <polygon points="50,32 65,42 65,58 50,68 35,58 35,42" fill="none" stroke="white" strokeWidth="0.8" opacity="0.45" />
                            <circle cx="50" cy="50" r="6" fill="white" opacity="0.6" />
                            <circle cx="50" cy="50" r="3.5" fill="white" opacity="0.8" />
                            <line x1="50" y1="50" x2="50" y2="25" stroke="white" strokeWidth="0.7" opacity="0.4" />
                            <line x1="50" y1="50" x2="70" y2="38" stroke="white" strokeWidth="0.7" opacity="0.4" />
                            <line x1="50" y1="50" x2="70" y2="62" stroke="white" strokeWidth="0.7" opacity="0.4" />
                            <line x1="50" y1="50" x2="50" y2="75" stroke="white" strokeWidth="0.7" opacity="0.4" />
                            <line x1="50" y1="50" x2="30" y2="62" stroke="white" strokeWidth="0.7" opacity="0.4" />
                            <line x1="50" y1="50" x2="30" y2="38" stroke="white" strokeWidth="0.7" opacity="0.4" />
                            <text x="50" y="100" fontSize="7" fill="white" opacity="0.45" textAnchor="middle" fontFamily="serif">ARCANA</text>
                          </svg>
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
        {/* Gradient glow to indicate card mass */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-48 w-1/4 -translate-y-1/2 bg-gradient-to-r from-violet-500/8 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-48 w-1/4 -translate-y-1/2 bg-gradient-to-l from-violet-500/8 to-transparent blur-2xl" />

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
                    className={`overflow-hidden rounded-lg border bg-gradient-to-br from-purple-900/90 via-violet-800/85 to-purple-900/90 shadow-lg transition-all ${
                      isCentered && !isSelected
                        ? 'border-[#D4AF37]'
                        : 'border-[#D4AF37]/20'
                    }`}
                    style={{
                      width: `${CARD_WIDTH}px`,
                      height: `${CARD_HEIGHT}px`,
                      boxShadow: isCentered && !isSelected
                        ? '0 0 25px rgba(212, 175, 55, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.4)'
                        : '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                    whileHover={!isDragging && !isSelected ? { scale: 1.03 } : {}}
                    whileTap={!isDragging && !isSelected ? { scale: 0.97 } : {}}
                  >
                    {/* Glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.06]" />
                    
                    {/* Center card glow */}
                    {isCentered && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: [
                            'inset 0 0 15px rgba(168, 85, 247, 0.35)',
                            'inset 0 0 25px rgba(168, 85, 247, 0.55)',
                            'inset 0 0 15px rgba(168, 85, 247, 0.35)',
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
                      <svg className="h-full w-full" viewBox="0 0 100 140">
                        <polygon points="50,25 70,38 70,62 50,75 30,62 30,38" fill="none" stroke="white" strokeWidth="1.2" opacity="0.45" />
                        <polygon points="50,32 65,42 65,58 50,68 35,58 35,42" fill="none" stroke="white" strokeWidth="0.8" opacity="0.4" />
                        <circle cx="50" cy="50" r="6" fill="white" opacity="0.55" />
                        <circle cx="50" cy="50" r="3.5" fill="white" opacity="0.75" />
                        <line x1="50" y1="50" x2="50" y2="25" stroke="white" strokeWidth="0.6" opacity="0.35" />
                        <line x1="50" y1="50" x2="70" y2="38" stroke="white" strokeWidth="0.6" opacity="0.35" />
                        <line x1="50" y1="50" x2="70" y2="62" stroke="white" strokeWidth="0.6" opacity="0.35" />
                        <line x1="50" y1="50" x2="50" y2="75" stroke="white" strokeWidth="0.6" opacity="0.35" />
                        <line x1="50" y1="50" x2="30" y2="62" stroke="white" strokeWidth="0.6" opacity="0.35" />
                        <line x1="50" y1="50" x2="30" y2="38" stroke="white" strokeWidth="0.6" opacity="0.35" />
                        <text x="50" y="100" fontSize="7" fill="white" opacity="0.4" textAnchor="middle" fontFamily="serif">ARCANA</text>
                      </svg>
                    </div>

                    {/* Gold edge highlight */}
                    <div className="pointer-events-none absolute inset-0 rounded-lg border border-[#D4AF37]/12" />

                    {/* Center indicator */}
                    {isCentered && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                        <motion.div
                          className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"
                          animate={{
                            boxShadow: [
                              '0 0 4px rgba(212, 175, 55, 0.5)',
                              '0 0 8px rgba(212, 175, 55, 0.8)',
                              '0 0 4px rgba(212, 175, 55, 0.5)',
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
            className="group relative overflow-hidden rounded-full border border-[#D4AF37]/60 bg-gradient-to-br from-[#D4AF37]/50 via-amber-600/40 to-[#D4AF37]/50 px-6 py-2.5 backdrop-blur-xl transition-all hover:border-[#D4AF37]/80"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.2] via-transparent to-white/[0.1]" />
            
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 18px rgba(212, 175, 55, 0.5), inset 0 0 18px rgba(212, 175, 55, 0.3)',
                  '0 0 28px rgba(212, 175, 55, 0.7), inset 0 0 28px rgba(212, 175, 55, 0.5)',
                  '0 0 18px rgba(212, 175, 55, 0.5), inset 0 0 18px rgba(212, 175, 55, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <div className="relative flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">운세 보기</span>
            </div>
          </motion.button>
        )}
      </div>

      {/* Instruction hint */}
      <div className="absolute bottom-20 left-0 right-0 z-10 text-center">
        <p className="text-xs text-white/35">
          좌우로 드래그하여 카드를 탐색하세요
        </p>
      </div>
    </div>
  );
}
