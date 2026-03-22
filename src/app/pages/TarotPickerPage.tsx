import { useState, useRef } from 'react';
import { motion, PanInfo } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';

const TOTAL_CARDS = 78;
const CARD_THICKNESS = 1; // px per card - reduced for thinner deck
const SPLIT_DISTANCE = 80; // Increased gap for better visibility
const ROTATION_ANGLE = 65; // degrees - card deck rotation on X axis
const SWAP_THRESHOLD = 15; // Lowered threshold for immediate swapping
const INITIAL_DECK_ORDER = Array.from({ length: TOTAL_CARDS }, (_, index) => index);

export function TarotPickerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const tarotDeckVersionId =
    ((location.state as { tarotDeckVersionId?: string } | null)?.tarotDeckVersionId ?? getSelectedTarotDeckId()) as string;
  const selectedDeck = getTarotDeckById(tarotDeckVersionId);
  const [rotation, setRotation] = useState(0);
  const [isSplit, setIsSplit] = useState(false);
  const [splitIndex, setSplitIndex] = useState(39);
  const [deckOrder, setDeckOrder] = useState<number[]>(INITIAL_DECK_ORDER);
  const [swappedOrder, setSwappedOrder] = useState(false); // Track if decks are swapped
  const [isShuffling, setIsShuffling] = useState(false); // Track shuffling animation
  const [hasShuffled, setHasShuffled] = useState(false); // Track if user has shuffled at least once
  
  const isDraggingRotation = useRef(false);
  const applyCutShuffle = () => {
    setDeckOrder((prev) => [...prev.slice(splitIndex), ...prev.slice(0, splitIndex)]);
  };
  
  // Rotation drag (unified deck only, horizontal drag)
  const handleRotationDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    isDraggingRotation.current = true;
    setRotation(prev => {
      const newRotation = prev + info.delta.x * 0.8; // Increased sensitivity
      // Limit rotation to -30 to +30 degrees
      return Math.max(-30, Math.min(30, newRotation));
    });
  };

  const handleRotationDragEnd = () => {
    setTimeout(() => {
      isDraggingRotation.current = false;
    }, 50);
    // Smoothly return to center
    setRotation(0);
  };

  // Click to split/merge deck (touch only, not drag)
  const handleDeckClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingRotation.current) return;
    
    // Merge decks back when clicking on background (not on hotspot)
    if (isSplit) {
      setIsSplit(false);
      setSwappedOrder(false);
    }
  };

  // Split deck at specific card index when hotspot is clicked
  const handleCardHotspotClick = (physicalIndex: number) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering deck click
    if (isDraggingRotation.current || isSplit) return;
    
    // physicalIndex is the physical rendering position (i), not the logical card index
    // Split right after this physical position
    const finalSplitIndex = physicalIndex + 1;
    
    setSplitIndex(finalSplitIndex);
    setIsSplit(true);
  };

  // Click upper deck to swap (merge and swap order)
  const handleUpperDeckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShuffling) return;
    
    // Start shuffling animation
    setIsShuffling(true);
    setSwappedOrder(true);
    
    // After animation completes, merge and swap
    setTimeout(() => {
      applyCutShuffle();
      setIsSplit(false);
      setSwappedOrder(false);
      setIsShuffling(false);
      setHasShuffled(true);
    }, 1000);
  };

  // Click lower deck to swap (merge and swap order)
  const handleLowerDeckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShuffling) return;
    
    // Start shuffling animation
    setIsShuffling(true);
    setSwappedOrder(true);
    
    // After animation completes, merge and swap
    setTimeout(() => {
      applyCutShuffle();
      setIsSplit(false);
      setSwappedOrder(false);
      setIsShuffling(false);
      setHasShuffled(true);
    }, 1000);
  };

  // Deck drag handlers (split state only, vertical drag)
  const handleDeckGroupDragStart = () => {
    isDraggingRotation.current = true;
  };

  const handleUpperDeckDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Upper deck drags down (positive Y)
    dragStartY.current += info.delta.y;
    
    // Visual feedback - only allow downward drag
    if (dragStartY.current > 0) {
      setDragOffset(dragStartY.current);
    }
    
    // Threshold check - merge and swap when dragged down enough
    if (dragStartY.current > SWAP_THRESHOLD) {
      // Upper deck moves to bottom position - toggle swap state
      setSwappedOrder(!swappedOrder);
      setIsSplit(false);
      dragStartY.current = 0;
      setDragOffset(0);
    }
  };

  const handleLowerDeckDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Lower deck drags up (negative Y)
    dragStartY.current += info.delta.y;
    
    // Visual feedback - only allow upward drag
    if (dragStartY.current < 0) {
      setDragOffset(dragStartY.current);
    }
    
    // Threshold check - merge and swap when dragged up enough
    if (dragStartY.current < -SWAP_THRESHOLD) {
      // Lower deck moves to top position - toggle swap state
      setSwappedOrder(!swappedOrder);
      setIsSplit(false);
      dragStartY.current = 0;
      setDragOffset(0);
    }
  };

  const handleDeckGroupDragEnd = () => {
    setTimeout(() => {
      isDraggingRotation.current = false;
    }, 50);
    
    // Immediately reset drag state to prevent stuck visual state
    dragStartY.current = 0;
    setDragOffset(0);
  };

  // Click to merge when split (touch only)
  const handleDeckGroupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRotation.current) return;
    
    // Merge decks back
    setIsSplit(false);
    setSwappedOrder(false);
    setDragOffset(0);
  };

  const handleConfirm = () => {
    navigate('/tarot-spread', { state: { deckOrder, tarotDeckVersionId } });
  };

  // Render individual card
  const renderCard = (i: number, isVisible: boolean, isTopCard: boolean, isBottomCard: boolean) => (
    <div
      className="h-full w-full overflow-hidden rounded-2xl border border-[#D4AF37] bg-gradient-to-br from-purple-900/80 via-violet-800/70 to-purple-900/80"
      style={{
        opacity: isVisible ? (isTopCard || isBottomCard ? 1 : 0.95) : 0.3,
        boxShadow: isTopCard || isBottomCard
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 1px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Top card - front face pattern */}
      {isTopCard && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.06]" />
          
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: [
                'inset 0 0 20px rgba(168, 85, 247, 0.3)',
                'inset 0 0 30px rgba(168, 85, 247, 0.5)',
                'inset 0 0 20px rgba(168, 85, 247, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-10">
            <svg className="h-full w-full" viewBox="0 0 100 140">
              {/* Outer hexagon */}
              <polygon
                points="50,20 75,35 75,65 50,80 25,65 25,35"
                fill="none"
                stroke="white"
                strokeWidth="0.8"
                opacity="0.4"
              />
              
              {/* Inner hexagon */}
              <polygon
                points="50,30 68,42 68,58 50,70 32,58 32,42"
                fill="none"
                stroke="white"
                strokeWidth="0.6"
                opacity="0.35"
              />
              
              {/* Center star */}
              <circle cx="50" cy="50" r="5" fill="white" opacity="0.5" />
              <circle cx="50" cy="50" r="2.5" fill="white" opacity="0.7" />
              
              {/* Corner decorations */}
              <circle cx="50" cy="15" r="2" fill="white" opacity="0.3" />
              <circle cx="50" cy="85" r="2" fill="white" opacity="0.3" />
              
              {/* Connecting lines */}
              <line x1="50" y1="50" x2="50" y2="20" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="75" y2="35" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="75" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="50" y2="80" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="25" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="25" y2="35" stroke="white" strokeWidth="0.5" opacity="0.3" />
              
              {/* Text */}
              <text x="50" y="105" fontSize="10" fill="white" opacity="0.3" textAnchor="middle" fontFamily="serif">✦ ARCANA ✦</text>
              <text x="50" y="120" fontSize="7" fill="white" opacity="0.2" textAnchor="middle" fontFamily="serif">MAJOR</text>
            </svg>
          </div>
        </>
      )}
      
      {/* Bottom card - back face pattern */}
      {isBottomCard && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.06]" />
          
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: [
                'inset 0 0 20px rgba(168, 85, 247, 0.3)',
                'inset 0 0 30px rgba(168, 85, 247, 0.5)',
                'inset 0 0 20px rgba(168, 85, 247, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <svg className="h-full w-full" viewBox="0 0 100 140">
              {/* Outer decorative border */}
              <rect x="8" y="8" width="84" height="124" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" rx="4" />
              <rect x="12" y="12" width="76" height="116" fill="none" stroke="white" strokeWidth="0.4" opacity="0.25" rx="3" />
              
              {/* Center mandala */}
              <circle cx="50" cy="70" r="25" fill="none" stroke="white" strokeWidth="0.6" opacity="0.35" />
              <circle cx="50" cy="70" r="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="70" r="15" fill="none" stroke="white" strokeWidth="0.4" opacity="0.25" />
              
              {/* 8-pointed star */}
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
              
              {/* Center dot */}
              <circle cx="50" cy="70" r="3" fill="white" opacity="0.5" />
              <circle cx="50" cy="70" r="1.5" fill="white" opacity="0.7" />
              
              {/* Top decorative elements */}
              <circle cx="50" cy="25" r="8" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="25" r="5" fill="none" stroke="white" strokeWidth="0.4" opacity="0.25" />
              <circle cx="50" cy="25" r="2" fill="white" opacity="0.4" />
              
              {/* Corner stars */}
              <text x="20" y="22" fontSize="8" fill="white" opacity="0.25">✦</text>
              <text x="77" y="22" fontSize="8" fill="white" opacity="0.25">✦</text>
              <text x="20" y="126" fontSize="8" fill="white" opacity="0.25">✦</text>
              <text x="77" y="126" fontSize="8" fill="white" opacity="0.25">✦</text>
              
              {/* Bottom text */}
              <text x="50" y="112" fontSize="7" fill="white" opacity="0.25" textAnchor="middle" fontFamily="serif">TAROT</text>
              <text x="50" y="122" fontSize="6" fill="white" opacity="0.2" textAnchor="middle" fontFamily="serif">MYSTIC ORACLE</text>
            </svg>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A12]">
      {/* Mystic purple gradient background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-900/30 to-violet-950/50" />
        
        {/* Star dust particles */}
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
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
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/consultation')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </button>
          <div>
            <h1 className="text-xl font-medium text-white">카드 섞기</h1>
            <p className="text-xs text-white/50">{selectedDeck.name} 덱으로 운명의 순서를 만들어보세요</p>
          </div>
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
            // Unified deck - horizontal drag for rotation
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDrag={handleRotationDrag}
              onDragEnd={handleRotationDragEnd}
              onClick={handleDeckClick}
              className="cursor-grab active:cursor-grabbing"
              style={{
                transformStyle: 'preserve-3d',
                rotateY: rotation,
                willChange: 'transform',
              }}
              transition={{
                rotateY: {
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                },
              }}
            >
              {/* Card deck lying horizontally */}
              <div
                className="relative"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${ROTATION_ANGLE}deg)`,
                }}
              >
                {/* All 78 card layers */}
                {deckOrder.map((cardIndex, i) => {
                  const zOffset = i * CARD_THICKNESS;
                  const isVisible = i % 2 === 0 || i < 5 || i > TOTAL_CARDS - 6;
                  
                  // Card appearance follows the current shuffled stack position.
                  const isTopCard = i === 0;
                  const isBottomCard = i === TOTAL_CARDS - 1;
                  
                  return (
                    <motion.div
                      key={cardIndex}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: '220px',
                        height: '340px',
                      }}
                      animate={{
                        z: zOffset,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      {renderCard(cardIndex, isVisible, isTopCard, isBottomCard)}
                      
                      {/* Bottom Edge Hotspot - only show for cards that are NOT the logical bottom card (index 77) */}
                      {!isBottomCard && (
                        <motion.div
                          onClick={handleCardHotspotClick(i)}
                          className="absolute bottom-0 left-0 right-0 cursor-pointer"
                          style={{
                            height: '10px',
                            zIndex: 1000,
                          }}
                          whileHover={{
                            backgroundColor: 'rgba(212, 175, 55, 0.3)',
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                        >
                          {/* Visual indicator on hover */}
                          <motion.div
                            className="h-full w-full border-b-2 border-[#D4AF37]/0"
                            whileHover={{
                              borderBottomColor: 'rgba(212, 175, 55, 0.8)',
                            }}
                            transition={{
                              duration: 0.2,
                            }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            // Split decks - vertical drag for swapping
            <div
              className="relative"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${ROTATION_ANGLE}deg)`,
              }}
            >
              {/* Calculate deck positions based on split point */}
              {(() => {
                const upperDeckCards = deckOrder.slice(0, splitIndex);
                const lowerDeckCards = deckOrder.slice(splitIndex);

                // Split point is at the bottom of the last card of upper deck
                const splitPointZ = (splitIndex - 1) * CARD_THICKNESS;
                
                // Calculate visual distance compensation based on split position
                // Cards further back (higher splitIndex) need more physical distance to look the same
                const depthFactor = splitIndex / TOTAL_CARDS; // 0 to 1
                const compensatedDistance = SPLIT_DISTANCE * (1 + depthFactor * 1.5); // Increase distance for back cards
                
                // Move upper deck up by half gap, lower deck down by half gap
                // This ensures the visible gap at the split point is always consistent
                const upperDeckZ = splitPointZ - compensatedDistance / 2;
                const lowerDeckZ = splitPointZ + compensatedDistance / 2;
                
                // When swapped, reverse the Z positions
                const upperDeckFinalZ = swappedOrder ? lowerDeckZ : upperDeckZ;
                const lowerDeckFinalZ = swappedOrder ? upperDeckZ : lowerDeckZ;
                
                return (
                  <>
                    {/* Upper Deck (cards 0 to splitIndex-1) */}
                    <motion.div
                      onClick={handleUpperDeckClick}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                      animate={{
                        z: isShuffling ? [upperDeckFinalZ, upperDeckFinalZ, lowerDeckFinalZ] : upperDeckFinalZ,
                        y: isShuffling ? [0, 300, 0] : 0, // Large vertical movement to show physical swap
                      }}
                      transition={{
                        z: {
                          duration: 1.2,
                          ease: [0.4, 0, 0.2, 1],
                        },
                        y: {
                          duration: 1.2,
                          ease: [0.4, 0, 0.2, 1],
                        },
                      }}
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
                              width: '220px',
                              height: '340px',
                            }}
                            animate={{
                              z: zOffset,
                            }}
                            transition={{
                              z: {
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                              },
                            }}
                          >
                            {renderCard(cardIndex, isVisible, isTopCard, isBottomCard)}
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {/* Lower Deck (cards splitIndex to TOTAL_CARDS-1) */}
                    <motion.div
                      onClick={handleLowerDeckClick}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                      animate={{
                        z: isShuffling ? [lowerDeckFinalZ, lowerDeckFinalZ, upperDeckFinalZ] : lowerDeckFinalZ,
                        y: isShuffling ? [0, -300, 0] : 0, // Large vertical movement opposite direction
                      }}
                      transition={{
                        z: {
                          duration: 1.2,
                          ease: [0.4, 0, 0.2, 1],
                        },
                        y: {
                          duration: 1.2,
                          ease: [0.4, 0, 0.2, 1],
                        },
                      }}
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
                              width: '220px',
                              height: '340px',
                            }}
                            animate={{
                              z: zOffset,
                            }}
                            transition={{
                              z: {
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                              },
                            }}
                          >
                            {renderCard(cardIndex, isVisible, isTopCard, isBottomCard)}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Confirm button - show only after shuffling */}
        {hasShuffled && !isSplit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-8"
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
        )}
      </div>
    </div>
  );
}
