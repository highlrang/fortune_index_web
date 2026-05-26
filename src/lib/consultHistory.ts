import type {
  AnalysisResultsPayload,
  ConsultResponse,
  ConsultingHistoryAnalysisResponse,
  SharedConsultingHistoryResponse,
} from './api';

const analysisTitles = {
  saju: '사주 분석',
  tarot: '타로 분석',
  zodiac: '별자리 분석',
} as const;

export function buildAnalysisResults(
  analysis: ConsultingHistoryAnalysisResponse,
): AnalysisResultsPayload {
  const analysisResults: AnalysisResultsPayload = {};

  if (analysis.saju) {
    analysisResults.saju_analysis = { title: analysisTitles.saju, content: analysis.saju };
  }
  if (analysis.tarot) {
    analysisResults.tarot_analysis = { title: analysisTitles.tarot, content: analysis.tarot };
  }
  if (analysis.zodiac) {
    analysisResults.zodiac_analysis = { title: analysisTitles.zodiac, content: analysis.zodiac };
  }

  return analysisResults;
}

export function mapHistoryDetailToConsultResult(
  detail: SharedConsultingHistoryResponse,
): ConsultResponse {
  return {
    mode: detail.mode,
    focus: {
      label: detail.focus.label,
      currentValue: detail.focus.currentValue,
      changeRate: detail.focus.changeRate,
      interestArea: detail.focus.label,
      fallback: false,
    },
    saju: detail.saju
      ? {
          analysis: {
            natalChart: {},
            keyPalaces: {},
            characters: [],
            tenGods: [],
            fiveElementBalance: {
              wood: detail.saju.wood,
              fire: detail.saju.fire,
              earth: detail.saju.earth,
              metal: detail.saju.metal,
              water: detail.saju.water,
            },
            yinYangBalance: { yinCount: 0, yangCount: 0, totalCount: 0 },
            annualFortune: {},
            majorFortune: {},
          },
          dayMaster: { symbol: '-', fiveElement: '-', yinYang: '-' },
          dayBranch: { symbol: '-', fiveElement: '-', yinYang: '-' },
          monthBranch: { symbol: '-', fiveElement: '-', yinYang: '-' },
          currentFortune: {},
        }
      : undefined,
    tarot: detail.tarot
      ? {
          interpretationMode: detail.tarot.interpretationMode ?? 'MAIN_TRADITIONAL',
          cards: detail.tarot.cards.map((card) => ({
            selectedIndex: card.selectedIndex,
            code: card.code,
            deckType: card.deckType as 'TAROT' | 'ORACLE',
            deckRole: card.deckRole as 'MAIN' | 'ASSISTANT',
            deckVersionId: card.deckVersionId ?? '',
            cardSetId: card.cardSetId ?? '',
            name: card.name,
            koreanName: card.koreanName,
            sortOrder: card.sortOrder,
            arcanaType: card.arcanaType,
            suit: card.suit,
            meaning: card.meaning,
            description: card.description,
            imageUrl: card.imageUrl ?? '',
            videoUrl: card.videoUrl,
          })),
          assistantDecks:
            detail.tarot.assistantDecks?.map((deck) => ({
              deckVersionId: deck.deckVersionId ?? '',
              deckType: deck.deckType as 'TAROT' | 'ORACLE',
              deckRole: deck.deckRole as 'MAIN' | 'ASSISTANT',
              cardSetId: deck.cardSetId ?? '',
              cards: deck.cards.map((card) => ({
                selectedIndex: card.selectedIndex,
                code: card.code,
                deckType: card.deckType as 'TAROT' | 'ORACLE',
                deckRole: card.deckRole as 'MAIN' | 'ASSISTANT',
                deckVersionId: card.deckVersionId ?? '',
                cardSetId: card.cardSetId ?? '',
                name: card.name,
                koreanName: card.koreanName,
                sortOrder: card.sortOrder,
                arcanaType: card.arcanaType,
                suit: card.suit,
                meaning: card.meaning,
                description: card.description,
                imageUrl: card.imageUrl ?? '',
                videoUrl: card.videoUrl,
              })),
            })) ?? [],
        }
      : undefined,
    ai: {
      provider: 'GEMINI',
      model: '',
      mode: detail.mode,
      analysisResults: buildAnalysisResults(detail.analysis),
      finalAdvice: detail.overallSummary,
      riskScore: detail.riskScore ?? undefined,
      rawJson: detail.aiResponseJson,
      evidence: {
        grounded: false,
        citations: [],
      },
    },
    history: {
      ...detail,
    },
  };
}
