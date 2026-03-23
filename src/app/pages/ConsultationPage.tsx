import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Star, Sparkles, Layers, Tag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import { consult, getScenarios, type ScenarioOptionResponse } from '@/lib/api';
import { getCurrentUser, saveLastConsultResult } from '@/lib/session';
import { getSelectedTarotDeckId, getTarotDeckById } from '@/lib/tarot';

type ConsultationType = 'market' | 'saju' | 'tarot' | 'comprehensive' | null;

const consultationTypes = [
  { id: 'market', label: '시장 분석', icon: TrendingUp, color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 'saju', label: '사주 투자', icon: Star, color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 'tarot', label: '타로 상담', icon: Sparkles, color: 'from-purple-500/20 to-violet-500/20' },
  { id: 'comprehensive', label: '종합 상담', icon: Layers, color: 'from-rose-500/20 to-pink-500/20' },
];

const fallbackScenarios: ScenarioOptionResponse[] = [
  { code: 'TIMING_ENTRY', title: '매수 타이밍', description: '지금 진입해도 되는지 확인합니다.' },
  { code: 'TIMING_EXIT', title: '매도 타이밍', description: '익절 또는 손절 시점을 봅니다.' },
  { code: 'SAJU_MATCH', title: '종목 궁합', description: '내 사주와 종목의 궁합을 확인합니다.' },
  { code: 'RESCUE_PLAN', title: '구조 계획', description: '물린 종목의 대응 전략을 정리합니다.' },
  { code: 'MENTAL_GUIDE', title: '멘탈 가이드', description: '투자 심리를 정리합니다.' },
];

const scenarioLabelByCode: Record<string, string> = {
  TIMING_ENTRY: '매수',
  TIMING_EXIT: '매도',
  SAJU_MATCH: '궁합',
  RESCUE_PLAN: '구조',
  MENTAL_GUIDE: '멘탈',
};

const questionPlaceholderByScenario: Record<string, string> = {
  TIMING_ENTRY: '예: 삼성전자 지금 들어가도 될까요?',
  TIMING_EXIT: '예: 이 종목 지금 익절하는 게 좋을까요?',
  SAJU_MATCH: '예: 제 사주에 2차전지주는 잘 맞을까요?',
  RESCUE_PLAN: '예: -18% 손실 중인데 어떻게 대응하면 좋을까요?',
  MENTAL_GUIDE: '예: 요즘 조급한 매매가 반복되는데 흐름을 어떻게 잡아야 할까요?',
};

const modeByType = {
  market: 'ONLY_STOCK',
  saju: 'STOCK_SAJU',
  tarot: 'STOCK_TAROT',
  comprehensive: 'STOCK_ALL',
} as const;

const DEFAULT_STOCK_CODE = '000000';
const DEFAULT_STOCK_NAME = '시장 전체';

export function ConsultationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCards = ((location.state as { selectedCards?: number[] } | null)?.selectedCards ?? []) as number[];
  const tarotDeckVersionId =
    ((location.state as { tarotDeckVersionId?: string } | null)?.tarotDeckVersionId ?? getSelectedTarotDeckId()) as string;
  const selectedTarotDeck = getTarotDeckById(tarotDeckVersionId);
  const currentUser = getCurrentUser();

  const [selectedType, setSelectedType] = useState<ConsultationType>(null);
  const [scenarios, setScenarios] = useState<ScenarioOptionResponse[]>(fallbackScenarios);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const questionPlaceholder = selectedScenario
    ? `궁금한 점을 자유롭게 입력해주세요\n${questionPlaceholderByScenario[selectedScenario] ?? '예: 지금 제 투자 흐름은 어떤가요?'}`
    : '궁금한 점을 자유롭게 입력해주세요\n예: 삼성전자 지금 들어가도 될까요?';

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
    if (!currentUser) {
      setError('먼저 로그인해주세요.');
      navigate('/login');
      return;
    }

    if (!selectedType) {
      setError('상담 유형을 선택해주세요.');
      return;
    }

    if (!selectedScenario) {
      setError('질문 시나리오를 선택해주세요.');
      return;
    }

    if ((selectedType === 'tarot' || selectedType === 'comprehensive') && selectedCards.length === 0) {
      setError('타로 상담을 위해 카드 3장을 먼저 선택해주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await consult({
        userId: currentUser.id,
        mode: modeByType[selectedType],
        scenario: selectedScenario as 'TIMING_ENTRY' | 'TIMING_EXIT' | 'SAJU_MATCH' | 'RESCUE_PLAN' | 'MENTAL_GUIDE',
        stockCode: DEFAULT_STOCK_CODE,
        stockName: DEFAULT_STOCK_NAME,
        question: question.trim() || undefined,
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 pb-32">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md px-5 pt-6">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </button>
          <div>
            <h1 className="text-xl font-medium text-white">AI 투자 상담</h1>
            <p className="text-xs text-white/50">운명이 안내하는 투자 전략</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-white/70">상담 유형 선택</h2>
          <div className="grid grid-cols-2 gap-3">
            {consultationTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <motion.button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as ConsultationType)}
                  className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                    isSelected
                      ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-yellow-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />

                  <div className="relative flex flex-col items-center gap-3">
                    <div className={`rounded-xl bg-gradient-to-br p-3 ${type.color}`}>
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-amber-300' : 'text-white/70'}`} />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-amber-200' : 'text-white/80'}`}>
                      {type.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-white/70">질문 시나리오</h2>
          <div className="space-y-2">
            {scenarios.map((scenario) => {
              const isSelected = selectedScenario === scenario.code;

              return (
                <button
                  key={scenario.code}
                  onClick={() => setSelectedScenario(scenario.code)}
                  className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-yellow-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className={`h-4 w-4 ${isSelected ? 'text-amber-300' : 'text-white/50'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-amber-200' : 'text-white/80'}`}>
                      {scenarioLabelByCode[scenario.code] ?? scenario.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {loadingScenarios ? <p className="mt-3 text-xs text-white/40">시나리오 불러오는 중...</p> : null}
        </div>

        {(selectedType === 'tarot' || selectedType === 'comprehensive') && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => navigate('/tarot-picker', { state: { tarotDeckVersionId } })}
              className="group relative w-full overflow-hidden rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-600/30 via-violet-600/20 to-purple-600/30 px-6 py-8 backdrop-blur-xl transition-all hover:border-purple-400/60"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />

              <div className="relative flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-16 w-12 rounded-lg border-2 ${
                        selectedCards[index] !== undefined
                          ? 'border-[#D4AF37]/70 bg-gradient-to-br from-[#D4AF37]/30 to-amber-500/20'
                          : 'border-purple-300/50 bg-gradient-to-br from-purple-400/30 to-violet-500/20'
                      }`}
                      animate={{ rotateY: [0, 15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="mb-1 text-base font-semibold text-purple-200">
                    {selectedCards.length === 3 ? '카드 선택 완료' : '운명의 카드 3장 뽑기'}
                  </p>
                  <p className="text-xs text-purple-300/70">
                    {selectedCards.length === 3
                      ? `${selectedTarotDeck.name} · 선택된 카드 번호: ${selectedCards.map((card) => card + 1).join(', ')}`
                      : `${selectedTarotDeck.name} 덱으로 오늘의 투자 운을 확인하세요`}
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        <div className="mb-6 space-y-4">
          <div>
            <h2 className="mb-4 text-sm font-medium text-white/70">질문 입력</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={questionPlaceholder}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white placeholder-white/30 backdrop-blur-xl transition-colors focus:border-amber-400/50 focus:bg-white/10 focus:outline-none"
              rows={4}
            />
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="group relative w-full overflow-hidden rounded-2xl border border-[#F1B45C]/40 bg-gradient-to-br from-[#BF702A] via-[#D4933F] to-[#F1B45C] px-6 py-5 shadow-2xl backdrop-blur-xl transition-all hover:border-[#F1B45C]/60 disabled:cursor-not-allowed disabled:opacity-60"
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
                '0 0 20px rgba(241, 180, 92, 0.4), inset 0 0 20px rgba(241, 180, 92, 0.1)',
                '0 0 30px rgba(241, 180, 92, 0.6), inset 0 0 30px rgba(241, 180, 92, 0.2)',
                '0 0 20px rgba(241, 180, 92, 0.4), inset 0 0 20px rgba(241, 180, 92, 0.1)',
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
              className="h-5 w-5 text-white"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
              }}
            />
            <span
              className="text-base font-semibold text-white"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
              }}
            >
              {isSubmitting ? 'AI 오라클이 해석 중...' : 'AI 오라클에게 운세 보기'}
            </span>
          </div>

          <div className="absolute inset-0 rounded-2xl border border-[#F1B45C] opacity-60" />
        </motion.button>
      </div>

      <BottomNavigation />
    </div>
  );
}
