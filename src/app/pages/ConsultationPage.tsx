import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Sparkles, Layers, MoonStar } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import { consult, getScenarios, type ScenarioOptionResponse } from '@/lib/api';
import { pickConsultationQuestion } from '@/lib/consultPrompts';
import { getCurrentUser, saveLastConsultResult } from '@/lib/session';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';

type ConsultationType = 'saju' | 'tarot' | 'zodiac' | 'comprehensive' | null;
type ConsultationFlowState = {
  selectedType?: ConsultationType;
  selectedScenario?: string;
  question?: string;
  selectedCards?: number[];
  tarotDeckVersionId?: string;
};

const consultationTypes = [
  { id: 'saju', label: '사주', icon: Star, color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 'tarot', label: '타로', icon: Sparkles, color: 'from-purple-500/20 to-violet-500/20' },
  { id: 'zodiac', label: '별자리', icon: MoonStar, color: 'from-sky-500/20 to-blue-500/20' },
  { id: 'comprehensive', label: '종합', icon: Layers, color: 'from-rose-500/20 to-pink-500/20' },
];

const fallbackScenarios: ScenarioOptionResponse[] = [
  { code: 'TIMING_ENTRY', title: '시작', description: '지금 시작해도 괜찮은지 살펴봐요.' },
  { code: 'TIMING_EXIT', title: '정리', description: '지금 멈추거나 정리해도 괜찮은지 봐요.' },
  { code: 'SAJU_MATCH', title: '궁합', description: '내 사주와 잘 맞는 흐름인지 확인해요.' },
  { code: 'RESCUE_PLAN', title: '회복', description: '답답한 상황을 어떻게 풀면 좋을지 정리해요.' },
  { code: 'MENTAL_GUIDE', title: '마음', description: '불안한 마음을 가라앉히고 방향을 정리해요.' },
];

const scenarioLabelByCode: Record<string, string> = {
  TIMING_ENTRY: '시작',
  TIMING_EXIT: '정리',
  SAJU_MATCH: '궁합',
  RESCUE_PLAN: '회복',
  MENTAL_GUIDE: '마음',
};

const modeByType = {
  saju: 'INVESTMENT_SAJU',
  tarot: 'INVESTMENT_TAROT',
  zodiac: 'INVESTMENT_ZODIAC',
  comprehensive: 'INVESTMENT_ALL',
} as const;

export function ConsultationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flowState = (location.state as ConsultationFlowState | null) ?? null;
  const selectedCards = (flowState?.selectedCards ?? []) as number[];
  const tarotDeckVersionId =
    (flowState?.tarotDeckVersionId ?? getSelectedTarotDeckId()) as string;
  const selectedTarotDeck = getTarotDeckById(tarotDeckVersionId);
  const currentUser = getCurrentUser();

  const [selectedType, setSelectedType] = useState<ConsultationType>(flowState?.selectedType ?? null);
  const [scenarios, setScenarios] = useState<ScenarioOptionResponse[]>(fallbackScenarios);
  const [selectedScenario, setSelectedScenario] = useState<string>(flowState?.selectedScenario ?? '');
  const [question, setQuestion] = useState(flowState?.question ?? '');
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const questionPlaceholder = useMemo(() => {
    if (!selectedScenario) {
      return `편하게 질문해주세요\n예: ${pickConsultationQuestion('MENTAL_GUIDE', selectedType)}`;
    }

    return `편하게 질문해주세요\n예: ${pickConsultationQuestion(
      selectedScenario as 'TIMING_ENTRY' | 'TIMING_EXIT' | 'SAJU_MATCH' | 'RESCUE_PLAN' | 'MENTAL_GUIDE',
      selectedType,
    )}`;
  }, [selectedScenario, selectedType]);
  const visibleScenarios = scenarios.filter((scenario, index, list) => {
    const label = scenarioLabelByCode[scenario.code] ?? scenario.title;
    return list.findIndex((item) => (scenarioLabelByCode[item.code] ?? item.title) === label) === index;
  });

  useEffect(() => {
    let active = true;

    getScenarios()
      .then((response) => {
        if (!active || response.length === 0) return;
        setScenarios(response);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : '시나리오를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!active) return;
        setLoadingScenarios(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    const trimmedQuestion = question.trim();

    if (!currentUser) {
      setError('먼저 로그인해주세요.');
      navigate('/login');
      return;
    }

    if (!selectedType) {
      setError('상담 유형을 선택해주세요.');
      return;
    }

    if (!trimmedQuestion) {
      setError('질문을 입력해주세요.');
      return;
    }

    if (selectedType === 'tarot' || selectedType === 'comprehensive') {
      setError('');
      navigate('/tarot-picker', {
        state: {
          selectedType,
          selectedScenario,
          question: trimmedQuestion,
          tarotDeckVersionId,
        } satisfies ConsultationFlowState,
      });
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await consult({
        userId: currentUser.id,
        mode: modeByType[selectedType],
        scenario: selectedScenario
          ? (selectedScenario as 'TIMING_ENTRY' | 'TIMING_EXIT' | 'SAJU_MATCH' | 'RESCUE_PLAN' | 'MENTAL_GUIDE')
          : undefined,
        focusLabel: selectedScenario ? scenarioLabelByCode[selectedScenario] ?? selectedScenario : undefined,
        question: trimmedQuestion,
        tarotIndices: selectedCards.length > 0 ? selectedCards : undefined,
        tarotDeckVersionId: selectedCards.length > 0 ? tarotDeckVersionId : undefined,
        tarotInterpretationMode: selectedCards.length > 0 ? 'MAIN_TRADITIONAL' : undefined,
        referenceDateTime: new Date().toISOString(),
      });

      saveLastConsultResult(response);
      navigate('/investment-result', { state: { consultResult: response } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '상담 요청에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fi-page min-h-screen pb-32">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="relative mx-auto max-w-md px-5 pt-6">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="fi-icon-button flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-medium fi-text-main">해석</h1>
            <p className="text-xs fi-text-muted">지금 마음에 걸리는 걸 편하게 물어보세요</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium fi-text-muted">어떤 방식으로 볼까요?</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {consultationTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <motion.button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as ConsultationType)}
                  className="relative overflow-hidden rounded-2xl border px-3 py-4 transition-all"
                  style={
                    isSelected
                      ? {
                          background: 'linear-gradient(135deg, var(--app-accent-surface) 0%, transparent 100%)',
                          borderColor: 'var(--app-accent-border-strong)',
                          backdropFilter: 'var(--card-blur)',
                          WebkitBackdropFilter: 'var(--card-blur)',
                        }
                      : {
                          background: 'var(--card-surface)',
                          borderColor: 'var(--card-border)',
                          backdropFilter: 'var(--card-blur)',
                          WebkitBackdropFilter: 'var(--card-blur)',
                        }
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />

                  <div className="relative flex flex-col items-center gap-2">
                    <div className={`rounded-xl bg-gradient-to-br p-2.5 ${type.color}`}>
                      <Icon className="h-5 w-5" style={{ color: isSelected ? 'var(--app-accent-text-soft)' : 'var(--app-icon-muted)' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: isSelected ? 'var(--app-accent-text-soft)' : 'var(--app-text-soft)' }}>
                      {type.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-4 text-sm font-medium fi-text-muted">무엇이 가장 궁금한가요?</h2>
          <div className="flex flex-wrap gap-2.5">
            {visibleScenarios.map((scenario) => {
              const isSelected = selectedScenario === scenario.code;

              return (
                <button
                  key={scenario.code}
                  onClick={() => setSelectedScenario((current) => (current === scenario.code ? '' : scenario.code))}
                  className="rounded-full border px-4 py-2 text-sm transition-all"
                  style={
                    isSelected
                      ? {
                          background: 'linear-gradient(90deg, var(--app-accent-surface) 0%, transparent 100%)',
                          borderColor: 'var(--app-accent-border-strong)',
                          color: 'var(--app-accent-text-soft)',
                          backdropFilter: 'var(--card-blur)',
                          WebkitBackdropFilter: 'var(--card-blur)',
                        }
                      : {
                          background: 'var(--card-surface)',
                          borderColor: 'var(--card-border)',
                          color: 'var(--app-text-soft)',
                          backdropFilter: 'var(--card-blur)',
                          WebkitBackdropFilter: 'var(--card-blur)',
                        }
                  }
                >
                  <span className="font-medium">{scenarioLabelByCode[scenario.code] ?? scenario.title}</span>
                </button>
              );
            })}
          </div>
          {loadingScenarios ? <p className="mt-3 text-xs fi-text-subtle">시나리오 불러오는 중...</p> : null}
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <h2 className="mb-4 text-sm font-medium fi-text-muted">무엇이 궁금한가요? <span className="fi-text-subtle">*</span></h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={questionPlaceholder}
              className="fi-input w-full rounded-2xl px-4 py-4 text-sm transition-colors"
              rows={4}
            />
          </div>
        </div>

        {(selectedType === 'tarot' || selectedType === 'comprehensive') && selectedCards.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="fi-glass relative overflow-hidden rounded-2xl px-6 py-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />

              <div className="relative flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-16 w-12 rounded-lg border-2 ${
                        selectedCards[index] !== undefined
                          ? ''
                          : ''
                      }`}
                      style={
                        selectedCards[index] !== undefined
                          ? {
                              borderColor: 'var(--app-accent-border-strong)',
                              background: 'linear-gradient(135deg, var(--app-accent-surface) 0%, transparent 100%)',
                            }
                          : {
                              borderColor: 'rgba(124, 77, 255, 0.35)',
                              background: 'linear-gradient(135deg, rgba(124, 77, 255, 0.18) 0%, transparent 100%)',
                            }
                      }
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="mb-1 text-base font-semibold fi-text-main">선택한 카드가 준비됐습니다</p>
                  <p className="text-xs fi-text-muted">
                    {selectedTarotDeck.name} · 선택된 카드 번호: {selectedCards.map((card) => card + 1).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error ? (
          <div className="fi-danger mb-6 rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="fi-cta group relative w-full overflow-hidden rounded-2xl px-6 py-5 shadow-2xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-white/[0.05]" />

          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              boxShadow: '0 0 20px rgba(241, 180, 92, 0.4), inset 0 0 20px rgba(241, 180, 92, 0.1)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px var(--app-accent-glow), inset 0 0 20px var(--app-accent-soft)',
                '0 0 30px var(--app-accent-glow), inset 0 0 30px var(--app-accent-soft)',
                '0 0 20px var(--app-accent-glow), inset 0 0 20px var(--app-accent-soft)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <div className="relative flex items-center justify-center gap-2">
            <Sparkles
              className="h-5 w-5 fi-text-main"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
              }}
            />
            <span
              className="text-base font-semibold fi-text-main"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
              }}
            >
              {isSubmitting
                ? '해석 중...'
                : selectedType === 'tarot' || selectedType === 'comprehensive'
                  ? '질문 들고 카드 뽑기'
                  : '해석 보기'}
            </span>
          </div>

          <div className="absolute inset-0 rounded-2xl border opacity-60" style={{ borderColor: 'var(--app-accent-border-strong)' }} />
        </motion.button>
      </div>

      <BottomNavigation />
    </div>
  );
}
