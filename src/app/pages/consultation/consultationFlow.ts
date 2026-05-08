import { Layers, MoonStar, Sparkles, Star } from 'lucide-react';
import type { ScenarioOptionResponse } from '@/lib/api';

export type ConsultationType = 'saju' | 'tarot' | 'zodiac' | 'comprehensive' | null;

export type ConsultationFlowState = {
  selectedType?: ConsultationType;
  selectedScenario?: string;
  selectedScenarioTitle?: string;
  question?: string;
  selectedCards?: number[];
  tarotDeckVersionId?: string;
};

export const consultationTypes = [
  { id: 'saju', label: '사주', icon: Star, color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 'tarot', label: '타로', icon: Sparkles, color: 'from-purple-500/20 to-violet-500/20' },
  { id: 'zodiac', label: '별자리', icon: MoonStar, color: 'from-sky-500/20 to-blue-500/20' },
  { id: 'comprehensive', label: '종합', icon: Layers, color: 'from-rose-500/20 to-pink-500/20' },
];

export const fallbackScenarios: ScenarioOptionResponse[] = [
  { code: 'MENTAL_GUIDE', title: '흐름', description: '지금 내 운세와 상태가 어떤지 가볍게 확인하고 싶을 때' },
  { code: 'SAJU_MATCH', title: '선택', description: '지금 마음이 끌리는 방향이 나와 잘 맞는지 궁금할 때' },
  { code: 'TIMING_ENTRY', title: '시작', description: '새로운 선택을 해도 되는 때인지 알고 싶을 때' },
  { code: 'TIMING_EXIT', title: '정리', description: '계속 가야 할지, 한발 물러서야 할지 고민될 때' },
  { code: 'RESCUE_PLAN', title: '회복', description: '마음이 급하거나 상황이 꼬여서 다시 균형을 찾고 싶을 때' },
];

export const modeByType = {
  saju: 'INVESTMENT_SAJU',
  tarot: 'INVESTMENT_TAROT',
  zodiac: 'INVESTMENT_ZODIAC',
  comprehensive: 'INVESTMENT_ALL',
} as const;
