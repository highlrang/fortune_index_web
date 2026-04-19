import { useEffect, useState } from 'react';
import { Crown, Infinity, Shield, Sparkles, Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router';
import { BenefitCard } from '../components/subscription/BenefitCard';
import { ComparisonTable } from '../components/subscription/ComparisonTable';
import { VodaLogoHybrid } from '../components/logos/VodaLogo';

const PAYMENT_PAGE_URL = import.meta.env.VITE_PAYMENT_PAGE_URL ?? 'https://payment.example.com/checkout';

function buildPaymentUrl() {
  const paymentUrl = new URL(PAYMENT_PAGE_URL);
  paymentUrl.searchParams.set('plan', 'premium_monthly');
  paymentUrl.searchParams.set('returnUrl', `${window.location.origin}/home`);
  paymentUrl.searchParams.set('source', 'web_subscription');
  return paymentUrl.toString();
}

export function SubscriptionLandingPage() {
  const [isSticky, setIsSticky] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartPayment = () => {
    window.location.href = buildPaymentUrl();
  };

  const benefits = [
    {
      icon: Crown,
      title: '다양한 타로 덱 제공',
      description: '다양한 프리미엄 타로 덱과 보조 오라클 카드로 더욱 깊이 있는 리딩을 경험하세요',
      gradient: 'from-amber-500/20 to-yellow-600/10',
    },
    {
      icon: Sparkles,
      title: '상담기록 무제한 저장',
      description: '지난 상담과 운세 흐름을 기간 제한 없이 보관하고 언제든 다시 확인하세요',
      gradient: 'from-purple-500/20 to-violet-600/10',
    },
    {
      icon: Infinity,
      title: '무제한 상담 이용',
      description: '하루 3회 제한 없이, 궁금할 때마다 언제든 타로와 사주 상담을 받아보세요',
      gradient: 'from-blue-500/20 to-cyan-600/10',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative">
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative mx-auto min-h-screen max-w-7xl px-6 pt-20 md:px-12 lg:px-16"
        >
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
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-amber-200">프리미엄 멤버십</span>
                </motion.div>

                <h1 className="text-5xl font-medium leading-tight text-white md:text-6xl lg:text-7xl">
                  더 깊은 운세를
                  <br />
                  <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 bg-clip-text text-transparent">
                    확인해보세요
                  </span>
                </h1>

                <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                  구독으로 더 많은 해석과 카드를 경험하세요.
                  <br />
                  당신만을 위한 운명의 해답이 기다립니다.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl"
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl" />
                <div className="relative space-y-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-5xl font-light text-white">월 5,000원</span>
                    <span className="text-white/50">/ 매월</span>
                  </div>
                  <p className="text-sm text-amber-300">첫 결제 후 바로 이용 가능</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="group relative w-full overflow-hidden rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/30 to-yellow-500/20 px-8 py-4 font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500/40 hover:shadow-amber-500/30 md:w-auto"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    지금 구독 시작하기
                    <Sparkles className="h-5 w-5" />
                  </span>
                </button>
                <p className="text-sm text-white/50">언제든 해지 가능 • 환불 보장</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto aspect-[3/4] max-w-md">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 via-amber-500/20 to-transparent blur-3xl" />
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
                  <div className="flex h-full flex-col items-center justify-center space-y-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-violet-500/20">
                      <Star className="h-12 w-12 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-3xl font-medium text-amber-300">The Star</h3>
                      <p className="text-sm text-white/60">희망과 영감의 카드</p>
                    </div>
                    <div className="w-full border-t border-white/20 pt-6">
                      <p className="text-center text-sm leading-relaxed text-white/70">
                        새로운 시작을 알리는 별의 인도. 당신의 미래가 밝게 빛납니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 top-1/4 h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                <div className="absolute -left-4 top-2/3 h-1 w-1 animate-pulse rounded-full bg-violet-400 delay-500" />
              </div>
            </motion.div>
          </div>
        </motion.section>

        <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-medium text-white md:text-5xl">프리미엄 멤버가 되면</h2>
            <p className="text-lg text-white/60">더욱 특별한 경험을 만나보세요</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <BenefitCard key={benefit.title} {...benefit} index={index} />
            ))}
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
            <h2 className="mb-4 text-4xl font-medium text-white md:text-5xl">무료 vs 프리미엄</h2>
            <p className="text-lg text-white/60">더 많은 혜택을 비교해보세요</p>
          </motion.div>

          <ComparisonTable />
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
                <Shield className="h-8 w-8 text-amber-300" />
              </div>
              <h2 className="text-3xl font-medium text-white md:text-4xl">지금 바로 더 깊은 운세 확인</h2>
              <p className="text-lg text-white/70">언제든 해지 가능 • 첫 달 환불 보장</p>
              <button
                type="button"
                onClick={handleStartPayment}
                className="group relative mx-auto overflow-hidden rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/30 to-yellow-500/20 px-10 py-5 text-lg font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500/40 hover:shadow-amber-500/30"
              >
                <span className="relative">구독 시작하기</span>
              </button>
            </div>
          </motion.div>
        </section>

        <footer className="relative border-t border-white/10 bg-black/20 px-6 py-12 pb-28 backdrop-blur-sm md:px-12 lg:pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 grid gap-8 md:grid-cols-3">
              <div>
                <div className="mb-4">
                  <VodaLogoHybrid size={118} theme="dark" />
                </div>
                <p className="text-sm text-white/60">당신의 운명을 밝히는 프리미엄 타로 플랫폼</p>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-medium text-white">서비스</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>
                    <Link to="/terms" className="hover:text-white/80">서비스 약관</Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="hover:text-white/80">개인정보 처리 약관</Link>
                  </li>
                  <li>
                    <Link to="/refund-policy" className="hover:text-white/80">환불 정책</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-medium text-white">환불 안내</h4>
                <p className="text-sm text-white/60">첫 결제 후 7일 이내 전액 환불 가능합니다. 서비스 이용 전 환불 요청 시 처리됩니다.</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-sm text-white/40">© 2026 Voda. All rights reserved.</div>
          </div>
        </footer>
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: isSticky ? 0 : 100 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-indigo-950/95 p-4 backdrop-blur-xl lg:hidden"
      >
        <button
          type="button"
          onClick={handleStartPayment}
          className="w-full rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/30 to-yellow-500/20 py-4 font-medium text-white shadow-lg shadow-amber-500/20"
        >
          구독 시작하기 - 월 5,000원
        </button>
      </motion.div>
    </div>
  );
}
