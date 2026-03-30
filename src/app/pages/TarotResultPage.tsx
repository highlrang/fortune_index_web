import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import tarotCardImage from '../../assets/95ecdc96df1369e34bce1bef5997c6a6e85495db.png';
import { consult, getTarotDeckCards, resolveApiAssetUrl, type TarotDeckCardResponse } from '@/lib/api';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';
import { getCurrentUser, saveLastConsultResult } from '@/lib/session';

type CardRevealState = 'back' | 'expanding' | 'revealing' | 'shrinking' | 'front';
type ConsultationType = 'market' | 'saju' | 'tarot' | 'comprehensive' | null;
type TarotResultLocationState = {
  selectedCards?: number[];
  selectedType?: ConsultationType;
  selectedScenario?: string;
  question?: string;
  tarotDeckVersionId?: string;
};

interface CardData {
  id: number;
  selectedIndex: number;
  label: string;
  meaning: string;
  revealState: CardRevealState;
  imageSrc: string;
  videoSrc?: string;
}

const CARD_WIDTH = 100;
const CARD_HEIGHT = 150;
const DEFAULT_STOCK_CODE = '000000';
const DEFAULT_STOCK_NAME = '시장 전체';
const modeByType = {
  market: 'ONLY_STOCK',
  saju: 'STOCK_SAJU',
  tarot: 'STOCK_TAROT',
  comprehensive: 'STOCK_ALL',
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

function CardMedia({
  card,
  alt,
  className,
}: {
  card: CardData;
  alt: string;
  className: string;
}) {
  if (card.videoSrc) {
    return (
      <video
        key={card.videoSrc}
        src={card.videoSrc}
        className={className}
        autoPlay
        muted
        playsInline
        loop
      />
    );
  }

  return <img src={card.imageSrc || tarotCardImage} alt={alt} className={className} />;
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
  const question = flowState?.question;
  
  const [cards, setCards] = useState<CardData[]>(() =>
    selectedCards.map((selectedIndex, slotIndex) => ({
      id: slotIndex,
      selectedIndex,
      label: `${selectedIndex + 1}번 카드`,
      meaning: '',
      revealState: 'back',
      imageSrc: tarotCardImage,
    })),
  );
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setCards(
      selectedCards.map((selectedIndex, slotIndex) => ({
        id: slotIndex,
        selectedIndex,
        label: `${selectedIndex + 1}번 카드`,
        meaning: '',
        revealState: 'back',
        imageSrc: tarotCardImage,
      })),
    );
  }, [selectedCards]);

  useEffect(() => {
    let active = true;

    getTarotDeckCards(tarotDeckVersionId, selectedCards)
      .then((response) => {
        if (!active || response.length === 0) return;

        const cardMap = new Map<number, TarotDeckCardResponse>();
        response.forEach((card) => {
          cardMap.set(card.selectedIndex, card);
        });

        setCards((prev) =>
          prev.map((card) => {
            const metadata = cardMap.get(card.selectedIndex);
            if (!metadata) return card;

            return {
              ...card,
              label: metadata.koreanName ?? metadata.name,
              meaning: metadata.meaning,
              imageSrc: resolveApiAssetUrl(metadata.imageUrl) || tarotCardImage,
              videoSrc: resolveApiAssetUrl(metadata.videoUrl) || undefined,
            };
          }),
        );
      })
      .catch(() => {
        // Keep the placeholder card presentation if the deck metadata API is unavailable.
      });

    return () => {
      active = false;
    };
  }, [selectedCards, tarotDeckVersionId]);

  const handleCardClick = (cardId: number) => {
    if (isAnimating) return;
    
    const card = cards[cardId];
    
    // If card is already revealed (front state), do nothing
    if (card.revealState === 'front') return;
    
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
      }, 600);

      // Step 3: After reveal animation, transition to front (skip shrinking)
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          c.id === cardId ? { ...c, revealState: 'front' as CardRevealState } : c
        ));
        setExpandedCardId(null);
        setIsAnimating(false);
      }, 3500);
    }
  };

  const handleConfirm = async () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!selectedType || !selectedScenario || !(selectedType in modeByType)) {
      navigate('/consultation', {
        state: {
          selectedCards,
          tarotDeckVersionId,
        },
      });
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await consult({
        userId: currentUser.id,
        mode: modeByType[selectedType],
        scenario: selectedScenario as 'TIMING_ENTRY' | 'TIMING_EXIT' | 'SAJU_MATCH' | 'RESCUE_PLAN' | 'MENTAL_GUIDE',
        stockCode: DEFAULT_STOCK_CODE,
        stockName: DEFAULT_STOCK_NAME,
        question: question?.trim() || undefined,
        tarotIndices: selectedCards,
        tarotDeckVersionId,
        tarotInterpretationMode: 'MAIN_TRADITIONAL',
        referenceDateTime: new Date().toISOString(),
      });

      saveLastConsultResult(response);
      navigate('/investment-result', { state: { consultResult: response } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '상담 요청에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCardsRevealed = cards.every(c => c.revealState === 'front');

  return (
    <div className="fixed inset-0 overflow-hidden" style={pageGradientStyle}>
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: 'var(--tarot-text-main)',
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--tarot-ambient-blob-a)' }} />
        <div className="absolute left-1/2 top-2/3 h-96 w-96 -translate-x-1/2 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--tarot-ambient-blob-b)' }} />
      </div>

      <AnimatePresence>
        {expandedCardId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 backdrop-blur-md"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-main) 78%, transparent)' }}
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
                    whileHover={!isAnimating && isBack ? { scale: 1.05, y: -5 } : {}}
                    whileTap={!isAnimating && isBack ? { scale: 0.95 } : {}}
                  >
                    {/* Card Back */}
                    {isBack && (
                      <div className="h-full w-full">
                        <div
                          className="h-full w-full overflow-hidden rounded-2xl border-2"
                          style={{
                            ...cardBackStyle,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.32), inset 0 0 24px rgba(255,255,255,0.1)',
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)' }} />
                          
                          <div className="absolute inset-0 flex items-center justify-center p-8">
                            <TarotCardBackPattern />
                          </div>

                          <div className="pointer-events-none absolute inset-3 rounded-xl border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 36%, transparent)' }} />
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
                          />

                          {card.videoSrc ? <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.18)' }} /> : null}

                          <div className="absolute left-3 top-3 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.22em]" style={{ ...frontCaptionStyle, color: 'var(--app-accent-text-soft)' }}>
                            ARCANA
                          </div>

                          <div className="absolute inset-x-3 bottom-3 rounded-xl px-3 py-2" style={frontCaptionStyle}>
                            <div className="text-sm font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{card.label}</div>
                            {card.meaning ? <div className="mt-1 text-[11px] leading-4" style={{ color: 'var(--app-text-muted)' }}>{card.meaning}</div> : null}
                          </div>

                          <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--tarot-card-cover-glow) 60%, transparent) 0%, transparent 30%, color-mix(in srgb, var(--tarot-card-cover-glow) 45%, transparent) 100%)' }} />

                          <div className="pointer-events-none absolute inset-3 rounded-xl border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 72%, transparent)' }} />
                          
                          {/* Subtle shimmer effect */}
                          <motion.div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{
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
                    className="fixed left-1/2 top-1/2 z-[100] cursor-pointer"
                    style={{
                      width: '80vw',
                      height: '120vw',
                      maxWidth: '320px',
                      maxHeight: '480px',
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
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.32), inset 0 0 24px rgba(255,255,255,0.1)',
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 46%, var(--tarot-card-cover-glow) 100%)' }} />
                          
                          <div className="absolute inset-0 flex items-center justify-center p-8">
                            <TarotCardBackPattern />
                          </div>

                          <div className="pointer-events-none absolute inset-3 rounded-xl border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 36%, transparent)' }} />
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
                          />

                          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.18)' }} />

                          {/* Mystical magic circle overlay animation */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {/* Outer rotating circle */}
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

                            {/* Middle rotating ring */}
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

                            {/* Inner counter-rotating circle */}
                            <motion.svg
                              className="absolute h-full w-full"
                              viewBox="0 0 320 480"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                            >
                              <circle cx="160" cy="240" r="50" fill="none" stroke="var(--tarot-point-color)" strokeWidth="0.8" opacity="0.5" />
                              <circle cx="160" cy="240" r="40" fill="none" stroke="var(--tarot-point-color)" strokeWidth="0.5" opacity="0.4" />
                            </motion.svg>

                            {/* Center pulsing light */}
                            <motion.div
                              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
                              style={{ backgroundColor: 'var(--tarot-point-color)', filter: 'blur(40px)' }}
                              animate={{
                                scale: [1, 1.8, 1],
                                opacity: [0.4, 0.7, 0.4],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                            />

                            {/* Light rays */}
                            {Array.from({ length: 8 }).map((_, i) => {
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
                            {Array.from({ length: 30 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute h-1 w-1 rounded-full"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.92)',
                                  left: `${20 + Math.random() * 60}%`,
                                  top: `${20 + Math.random() * 60}%`,
                                }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 2, 0],
                                  y: [0, -30, -60],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </div>

                          {/* Revealing glow pulse */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl"
                            animate={{
                              boxShadow: [
                                'inset 0 0 30px rgba(212, 175, 55, 0.5)',
                                'inset 0 0 60px rgba(212, 175, 55, 0.8)',
                                'inset 0 0 30px rgba(212, 175, 55, 0.5)',
                              ],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                            }}
                          />

                          <div className="absolute inset-x-6 bottom-6 rounded-2xl border px-4 py-3" style={frontCaptionStyle}>
                            <div className="text-base font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{card.label}</div>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-32 left-0 right-0 z-10 text-center">
          <p className="text-sm" style={{ color: 'var(--app-text-subtle)' }}>카드를 터치하여 운세를 확인하세요</p>
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

          {/* Summary button - appears after all cards revealed */}
          <AnimatePresence>
            {allCardsRevealed && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="group relative overflow-hidden rounded-full border px-6 py-3.5 transition-all"
                style={accentButtonStyle}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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

                <div className="relative flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: 'var(--tarot-text-main)' }} />
                  <span className="font-bold" style={{ color: 'var(--tarot-text-main)' }}>
                    {isSubmitting ? '리딩 중...' : '운세 결과 보러 가기'}
                  </span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
