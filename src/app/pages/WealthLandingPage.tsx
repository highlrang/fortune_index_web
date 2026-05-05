import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Lock, Sparkles, Star, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { ValueCard } from '../components/wealth/ValueCard';
import { VodaLogoHybrid } from '../components/logos/VodaLogo';

export function WealthLandingPage() {
  const navigate = useNavigate();

  const coreValues = [
    {
      icon: TrendingUp,
      title: '돈의 흐름 분석',
      description: '들어오는 돈과 나가는 돈의 흐름을 파악하고 금전 운세를 확인하세요',
      gradient: 'from-amber-500/20 to-yellow-600/10',
    },
    {
      icon: Star,
      title: '기회 타이밍 예측',
      description: '투자, 소비, 중요한 금전 결정을 위한 최적의 타이밍을 제안합니다',
      gradient: 'from-violet-500/20 to-purple-600/10',
    },
    {
      icon: AlertCircle,
      title: '리스크 신호 감지',
      description: '손실 가능성이 높은 시점과 주의가 필요한 순간을 미리 알려드립니다',
      gradient: 'from-rose-500/20 to-red-600/10',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-3xl" />
      </div>

      <div className="relative">
        <section className="relative mx-auto min-h-screen max-w-7xl px-6 pt-20 md:px-12 lg:px-16">
          <div className="grid min-h-[90vh] items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 backdrop-blur-sm"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-200">재물 운세 분석</span>
                </motion.div>

                <h1 className="text-5xl font-medium leading-tight text-white md:text-6xl lg:text-7xl">
                  당신의 자산이
                  <br />
                  <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 bg-clip-text text-transparent">
                    깨어나는
                  </span>
                  <br />
                  운명의 가이드
                </h1>

                <p className="text-lg leading-relaxed text-white/70 md:text-xl">
                  타로와 사주로 재물운과 기회 타이밍을 분석합니다.
                  <br />
                  당신의 금전 흐름을 미리 확인하세요.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="group relative overflow-hidden rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/30 to-yellow-500/20 px-8 py-4 font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500/40 hover:shadow-amber-500/30"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    무료로 재물 운세 확인하기
                    <Sparkles className="h-5 w-5" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/web/subscription')}
                  className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-medium text-white backdrop-blur-xl transition-all hover:bg-white/15"
                >
                  프리미엄 보기
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto aspect-square max-w-md">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/30 via-violet-500/20 to-transparent blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-amber-400/30 bg-gradient-to-br from-amber-500/20 via-violet-500/10 to-transparent backdrop-blur-xl">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border border-amber-400/50 bg-gradient-to-br from-amber-500/30 to-violet-500/20">
                      <Sparkles className="h-16 w-16 text-amber-400" />
                    </div>
                  </div>
                </div>
                <div className="absolute left-[20%] top-[15%] h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                <div className="absolute right-[15%] top-[25%] h-1 w-1 animate-pulse rounded-full bg-amber-300 delay-300" />
                <div className="absolute bottom-[20%] left-[10%] h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 delay-700" />
                <div className="absolute bottom-[30%] right-[20%] h-1 w-1 animate-pulse rounded-full bg-violet-400 delay-500" />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-medium text-white md:text-5xl">재물 운세로 얻을 수 있는 것</h2>
            <p className="text-lg text-white/60">돈과 관련된 명확한 인사이트를 제공합니다</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, index) => (
              <ValueCard key={value.title} {...value} index={index} />
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-4xl px-6 py-24 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-12 text-center backdrop-blur-xl md:p-16"
          >
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30">
                <Lock className="h-8 w-8 text-amber-300" />
              </div>
              <h2 className="text-3xl font-medium text-white md:text-4xl">더 정확한 재물 흐름을 알고 싶다면</h2>
              <p className="text-lg text-white/70">프리미엄으로 더 깊은 분석과 예측을 경험하세요</p>

              <div className="mx-auto max-w-2xl space-y-3 pt-4">
                {['다양한 타로 덱 + 보조 오라클 카드', '월별 / 연별 재물 운세 상세 분석', '상담기록 무제한 저장'].map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center justify-center gap-3 text-white/80"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20">
                      <ArrowRight className="h-3 w-3 text-amber-400" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate('/web/subscription')}
                className="group relative mx-auto mt-6 overflow-hidden rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/30 to-yellow-500/20 px-10 py-5 text-lg font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500/40 hover:shadow-amber-500/30"
              >
                <span className="relative">프리미엄 자세히 보기</span>
              </button>
            </div>
          </motion.div>
        </section>

        <section className="relative mx-auto max-w-4xl px-6 py-24 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-center"
          >
            <h2 className="text-3xl font-medium text-white md:text-4xl">지금 재물 운세 확인하기</h2>
            <p className="text-lg text-white/70">무료로 시작 가능합니다</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="group relative mx-auto overflow-hidden rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/30 to-yellow-500/20 px-10 py-5 text-lg font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500/40 hover:shadow-amber-500/30"
            >
              <span className="relative flex items-center justify-center gap-2">
                무료 체험 시작하기
                <ArrowRight className="h-5 w-5" />
              </span>
            </button>
          </motion.div>
        </section>

        <footer className="relative border-t border-white/10 bg-black/20 px-6 py-12 pb-28 backdrop-blur-sm md:px-12 lg:pb-12">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-4 flex justify-center">
              <VodaLogoHybrid size={138} theme="dark" />
            </div>
            <p className="mb-6 text-base text-white/60">타로와 사주로 재물운을 분석하는 프리미엄 플랫폼</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
              <Link to="/terms" className="hover:text-white/80">서비스 약관</Link>
              <Link to="/privacy" className="hover:text-white/80">개인정보 처리 약관</Link>
              <Link to="/refund-policy" className="hover:text-white/80">환불 정책</Link>
            </div>
            <div className="mt-8 border-t border-white/10 pt-8 text-sm text-white/40">© 2026 Voda. All rights reserved.</div>
          </div>
        </footer>
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-indigo-950/95 p-4 backdrop-blur-xl lg:hidden"
      >
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/30 to-yellow-500/20 py-4 font-medium text-white shadow-lg shadow-amber-500/20"
        >
          무료로 재물 운세 확인하기
        </button>
      </motion.div>
    </div>
  );
}
