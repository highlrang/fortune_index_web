import type { ConsultScenario } from './api';

export type ConsultationPromptType = 'saju' | 'tarot' | 'zodiac' | 'comprehensive';

export const scenarioQuestionPrompts: Record<ConsultScenario, string[]> = {
  TIMING_ENTRY: [
    '관심 종목, 지금 일부 매수해도 될까?',
    '많이 오른 종목, 지금 들어가기엔 늦었을까?',
    '현금 비중이 높은데 주식 비중을 조금 늘려도 될까?',
    '하락한 종목, 지금 분할 매수해도 될까?',
    '이번 주 새 종목을 담아도 괜찮을까?',
  ],
  TIMING_EXIT: [
    '수익 난 종목, 지금 일부 정리해도 될까?',
    '손실 중인 종목, 계속 보유해도 될까?',
    '많이 오른 종목, 더 가져갈까 줄일까?',
    '불안한 종목, 비중을 줄이는 게 나을까?',
    '지금 포트폴리오 그대로 둬도 괜찮을까?',
  ],
  SAJU_MATCH: [
    '단기 매매보다 장기 보유가 내 성향에 맞을까?',
    '주식 비중 늘리는 선택, 내 성향에 무리 없을까?',
    '예금 위주에서 주식 비중을 늘려도 괜찮을까?',
    '변동 큰 성장주, 내가 감당할 수 있을까?',
    '나한테 편한 투자 방식은 뭐야?',
  ],
  RESCUE_PLAN: [
    '계좌 볼 때마다 불안한데 뭐부터 확인할까?',
    '손실 보고 흔들릴 때 어떻게 정리할까?',
    '뉴스 보고 마음이 바뀌는데 지금 판단해도 될까?',
    '물린 종목 때문에 불안할 때 오늘 할 정리는?',
  ],
  MENTAL_GUIDE: [
    '계좌 열기 무서울 때 마음 정리해줘.',
    '장 흔들릴 때 불안을 줄이는 방법은?',
    '오늘 매매 안 해도 괜찮다는 한마디 줘.',
  ],
};

const typeScenarioQuestionPrompts: Record<
  ConsultationPromptType,
  Partial<Record<ConsultScenario, string[]>>
> = {
  saju: {
    TIMING_ENTRY: [
      '사주로 보면 관심 종목 일부 매수해도 될까?',
      '내 기운상 관망하던 주식 들어가도 될까?',
      '하락한 종목 분할 매수하기 괜찮은 흐름이야?',
    ],
    TIMING_EXIT: [
      '사주로 보면 손실 종목 계속 보유해도 될까?',
      '수익 난 종목은 지금 일부 정리해도 될까?',
      '비중 큰 종목, 이어갈까 줄일까?',
    ],
    SAJU_MATCH: [
      '장기 보유 방식이 내 사주랑 맞을까?',
      '주식 비중 늘리는 선택, 내 성향에 무리 없을까?',
      '변동 큰 성장주, 내가 감당할 수 있을까?',
      '현금 줄이고 주식 늘리는 흐름 괜찮을까?',
    ],
    RESCUE_PLAN: [
      '손실 볼 때 나오는 내 기본 패턴은?',
      '계좌 보고 불안할 때 내 성향에 맞는 회복법은?',
      '뉴스에 흔들릴 때 균형 잡는 법 알려줘.',
    ],
    MENTAL_GUIDE: [
      '장 흔들리는 날, 내 사주에 맞는 멘탈 케어는?',
      '계좌 볼 때 보완할 마음 기운은?',
      '오늘 매수 버튼 앞에서 덜 흔들릴 태도는?',
    ],
  },
  tarot: {
    TIMING_ENTRY: [
      '카드로 보면 관심 종목 일부 매수해도 될까?',
      '하락한 종목 분할 매수 흐름을 봐줘.',
      '새 종목을 담아도 괜찮은 분위기야?',
    ],
    TIMING_EXIT: [
      '카드로 보면 손실 종목 계속 보유해도 될까?',
      '수익 난 종목 정리할까, 조금만 더 볼까?',
      '지금 포트폴리오는 유지가 나을까, 조정이 나을까?',
    ],
    SAJU_MATCH: [
      '카드로 보면 단기 매매보다 장기 보유가 맞아?',
      '지금 주식 비중, 내 성향과 맞을까?',
      '성장주 변동성, 내가 받아도 되는 흐름이야?',
    ],
    RESCUE_PLAN: [
      '계좌 보고 불안한 이유를 카드로 살짝 봐줘.',
      '손실 난 날 카드가 말하는 회복법은?',
      '지금 내 마음, 공포랑 욕심 중 어디로 치우쳤어?',
    ],
    MENTAL_GUIDE: [
      '매수 버튼 앞 내 마음을 카드로 봐줘.',
      '오늘 계좌 볼 때 덜 불안한 메시지는?',
      '장 흔들리는 날 타로 한마디로 진정시켜줘.',
    ],
  },
  zodiac: {
    TIMING_ENTRY: [
      '별자리로 보면 관심 종목 일부 매수해도 될까?',
      '오늘 새 종목을 담아도 괜찮은 흐름이야?',
      '하락한 종목 분할 매수해도 될까?',
    ],
    TIMING_EXIT: [
      '별자리로 보면 손실 종목 계속 보유해도 될까?',
      '수익 난 종목 유지할까, 일부 정리할까?',
      '비중 줄이면 지금 안정될까?',
    ],
    SAJU_MATCH: [
      '장기 보유 방식, 내 별자리랑 맞아?',
      '주식 비중 늘리는 게 내 기질에 무리 없을까?',
      '성장주 변동성 편하게 감당 가능할까?',
    ],
    RESCUE_PLAN: [
      '계좌 보고 흔들리는 이유가 뭘까?',
      '장 하락 날 감정 균형 어떻게 다시 잡아?',
      '불안할 때 차트보다 먼저 볼 신호는?',
    ],
    MENTAL_GUIDE: [
      '장 흔들릴 때 내 별자리 멘탈 팁은?',
      '오늘 계좌보다 마음 중심 어디에 둘까?',
      '매매 쉬는 날 안정감 키우는 방향은?',
    ],
  },
  comprehensive: {
    TIMING_ENTRY: [
      '관심 종목 지금 일부 매수해도 될지 봐줘.',
      '관망을 유지할까, 주식 비중을 조금 늘릴까?',
      '하락한 종목 분할 매수 흐름 같이 봐줘.',
    ],
    TIMING_EXIT: [
      '손실 종목 계속 보유해도 괜찮을지 봐줘.',
      '수익 난 종목 더 가져갈까, 일부 정리할까?',
      '비중 큰 종목 더 볼까, 줄일까?',
    ],
    SAJU_MATCH: [
      '장기 보유 방식, 내 성향이랑 맞는지 봐줘.',
      '주식이랑 현금 비중, 사주랑 카드로 봐줘.',
      '성장주 변동성 내가 무리 없이 감당할 수 있을까?',
    ],
    RESCUE_PLAN: [
      '계좌 보고 불안한 이유 같이 풀어줘.',
      '손실 난 종목 앞에서 마음 어떻게 다시 잡을까?',
      '오늘 매매 전에 볼 균형점 하나만 알려줘.',
    ],
    MENTAL_GUIDE: [
      '장 흔들리는 지금 내 마음 정리 좀 해줘.',
      '계좌 안 보는 날 마음 케어법은?',
      '매수 버튼 참는 나에게 중심 잡는 한마디 줘.',
    ],
  },
};

export function pickScenarioQuestion(scenario: ConsultScenario) {
  const prompts = scenarioQuestionPrompts[scenario];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

export function pickConsultationQuestion(
  scenario: ConsultScenario,
  type?: ConsultationPromptType | null,
) {
  const prompts =
    (type ? typeScenarioQuestionPrompts[type][scenario] : undefined) ??
    scenarioQuestionPrompts[scenario];

  return prompts[Math.floor(Math.random() * prompts.length)];
}
