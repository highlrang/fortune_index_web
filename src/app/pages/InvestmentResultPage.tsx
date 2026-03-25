import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Eye,
  Share2,
  Heart,
  Clock,
  Trash2,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import type { ConsultResponse } from '@/lib/api';
import { getLastConsultResult } from '@/lib/session';

const iconByKey = {
  market_analysis: TrendingUp,
  saju_analysis: Sparkles,
  tarot_analysis: Eye,
} as const;

const titleByMode = {
  ONLY_STOCK: '투자 운세 결과',
  STOCK_SAJU: '투자 사주 결과',
  STOCK_TAROT: '투자 타로 결과',
  STOCK_ALL: '투자 종합 결과',
} as const;

export function InvestmentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const consultResult =
    ((location.state as { consultResult?: ConsultResponse } | null)?.consultResult as ConsultResponse | undefined) ??
    getLastConsultResult<ConsultResponse>();

  const sections = useMemo(() => {
    if (!consultResult) return [];

    return Object.entries(consultResult.ai.analysisResults)
      .filter(([, value]) => value?.content)
      .map(([key, value]) => ({
        key,
        title: value.title,
        content: value.content,
        icon: iconByKey[key as keyof typeof iconByKey] ?? Sparkles,
      }));
  }, [consultResult]);

  const confidenceScore = useMemo(() => {
    if (!consultResult) return 78;
    return Math.max(0, 100 - consultResult.ai.riskScore);
  }, [consultResult]);
  const [isLiked, setIsLiked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!consultResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 text-lg text-white">표시할 상담 결과가 없습니다.</p>
          <button
            onClick={() => navigate('/consultation')}
            className="rounded-full border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-sm text-amber-200"
          >
            상담하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-auto bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-50 bg-gradient-to-b from-indigo-950/95 via-indigo-900/90 to-transparent px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/home')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 text-white/60" />
            </button>

            <div className="text-center">
              <h1 className="text-lg font-semibold text-white">{titleByMode[consultResult.mode]}</h1>
              <p className="text-xs text-[#D4AF37]/70">{consultResult.stock.name}</p>
            </div>

            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10">
              <Share2 className="h-4 w-4 text-white/60" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-purple-900/40 via-violet-800/30 to-purple-900/40 p-8 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.05]" />

              <div className="relative">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                  <h2 className="text-center text-sm font-medium uppercase tracking-wider text-[#D4AF37]">
                    투자 확신 점수
                  </h2>
                </div>

                <div className="mb-3 flex items-center justify-center">
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-amber-600/15 to-[#D4AF37]/20">
                    <div className="text-center">
                      <span className="text-6xl font-bold text-white">{confidenceScore}</span>
                      <span className="ml-2 text-2xl text-white/60">점</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-base font-medium text-white/80">
                  {confidenceScore >= 80 ? '매우 긍정적인 흐름' : confidenceScore >= 60 ? '긍정적인 흐름' : '신중한 접근 필요'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-6"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

              <div className="relative space-y-4">
                <h3 className="text-center text-base font-semibold text-white">오늘의 핵심 요약</h3>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20">
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-white/80">{consultResult.ai.finalAdvice}</p>
                </div>

              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-6 backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-amber-600/20">
                        <section.icon className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                        <p className="text-xs text-white/50">{section.key}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-sm leading-7 text-white/70 whitespace-pre-wrap">{section.content}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {consultResult.tarot?.cards?.length ? (
            <div className="mt-8 rounded-2xl border border-purple-400/20 bg-purple-500/5 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold text-white">선택된 타로 카드</h3>
              <div className="flex flex-wrap gap-2">
                {consultResult.tarot.cards.map((card) => (
                  <span
                    key={`${card.code}-${card.selectedIndex}`}
                    className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs text-purple-200"
                  >
                    {card.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setIsLiked((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'text-[#D4AF37]' : 'text-white/60'}`} />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4 text-white/60" />
              </button>

              <button
                onClick={() => navigate('/consultation-history')}
                className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-3 text-sm text-[#D4AF37]"
              >
                상담 내역 보기
              </button>
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-6 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />

                <div className="relative">
                  <h3 className="mb-5 text-center text-base font-semibold text-white">삭제 확인</h3>
                  <p className="text-center text-sm text-white/80">이 투자 운세 결과를 닫고 홈으로 이동할까요?</p>

                  <div className="mt-6 flex items-center justify-center space-x-4">
                    <button
                      className="flex h-8 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/20 via-amber-600/15 to-[#D4AF37]/20 text-sm font-medium text-white"
                      onClick={() => navigate('/home')}
                    >
                      확인
                    </button>

                    <button
                      className="flex h-8 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/20 via-amber-600/15 to-[#D4AF37]/20 text-sm font-medium text-white"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
