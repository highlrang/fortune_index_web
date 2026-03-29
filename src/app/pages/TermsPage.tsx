import { ChevronLeft, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="fi-page min-h-screen pb-10">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="relative mx-auto max-w-md px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="fi-icon-button flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-90"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold fi-text-main">이용약관</h1>
            <p className="text-sm fi-text-muted">Stock Oracle 서비스 이용에 대한 기본 안내</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <section className="fi-glass overflow-hidden rounded-3xl p-5">
            <div className="mb-3 flex items-center gap-2 fi-text-accent">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-base font-semibold fi-text-main">서비스 목적</h2>
            </div>
            <p className="text-sm leading-7 fi-text-muted">
              Stock Oracle은 타로, 사주, AI 해석을 결합해 투자 인사이트와 엔터테인먼트성 콘텐츠를 제공하는 서비스입니다.
              본 서비스의 모든 정보는 참고용이며, 특정 금융상품의 매수, 매도 또는 보유를 권유하는 투자 자문으로 간주되지 않습니다.
            </p>
          </section>

          <section className="fi-glass overflow-hidden rounded-3xl p-5">
            <h2 className="mb-3 text-base font-semibold fi-text-main">이용자 유의사항</h2>
            <div className="space-y-3 text-sm leading-7 fi-text-muted">
              <p>이용자는 서비스 내 분석, 운세, 예측 결과를 자신의 판단을 보조하는 참고 자료로만 활용해야 합니다.</p>
              <p>시장 상황, 기업 공시, 환율, 금리, 유동성 등 실제 투자 결과에 영향을 주는 요인은 매우 다양하며 서비스가 이를 모두 반영하지 못할 수 있습니다.</p>
              <p>회원은 본인 계정 정보와 인증 수단을 스스로 관리해야 하며, 관리 소홀로 발생한 불이익에 대해서는 본인이 책임집니다.</p>
            </div>
          </section>

          <section className="fi-accent-card overflow-hidden rounded-3xl p-5">
            <div className="mb-3 flex items-center gap-2 fi-text-accent">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-base font-semibold fi-text-main">투자 책임 고지</h2>
            </div>
            <p className="text-sm leading-7 fi-text-soft">
              주식, ETF, 코인, 파생상품을 포함한 모든 투자 판단과 그 결과에 따른 수익 및 손실은 전적으로 이용자 본인의 책임입니다.
              Stock Oracle은 서비스에서 제공한 정보, 해석, 예측 또는 알림을 근거로 이루어진 투자 의사결정에 대해 책임지지 않습니다.
            </p>
          </section>

          <section className="fi-glass overflow-hidden rounded-3xl p-5">
            <h2 className="mb-3 text-base font-semibold fi-text-main">책임의 제한</h2>
            <div className="space-y-3 text-sm leading-7 fi-text-muted">
              <p>서비스는 안정적인 운영을 위해 노력하지만, 시스템 점검, 통신 장애, 외부 API 오류 등으로 일시 중단 또는 지연이 발생할 수 있습니다.</p>
              <p>회사는 천재지변, 불가항력적 사유, 이용자 귀책사유로 인한 손해에 대해서는 책임을 제한할 수 있습니다.</p>
              <p>이용자는 관련 법령과 거래소, 증권사, 금융기관의 규정을 별도로 확인해야 하며, 최종 투자 실행 전 필요한 검토를 직접 수행해야 합니다.</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
