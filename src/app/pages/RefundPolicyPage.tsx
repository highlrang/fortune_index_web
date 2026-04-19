import { ChevronLeft, CreditCard, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export function RefundPolicyPage() {
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
            type="button"
            onClick={() => navigate(-1)}
            className="fi-icon-button flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-90"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold fi-text-main">환불 정책</h1>
            <p className="text-sm fi-text-muted">결제 취소와 환불 처리 기준 안내</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <section className="fi-glass overflow-hidden rounded-3xl p-5">
            <div className="mb-3 flex items-center gap-2 fi-text-accent">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-base font-semibold fi-text-main">환불 가능 기준</h2>
            </div>
            <div className="space-y-3 text-sm leading-7 fi-text-muted">
              <p>첫 결제 후 7일 이내에는 고객센터를 통해 환불을 요청할 수 있습니다.</p>
              <p>유료 기능을 실질적으로 이용하지 않은 경우 전액 환불을 원칙으로 검토합니다.</p>
            </div>
          </section>

          <section className="fi-glass overflow-hidden rounded-3xl p-5">
            <div className="mb-3 flex items-center gap-2 fi-text-accent">
              <RotateCcw className="h-5 w-5" />
              <h2 className="text-base font-semibold fi-text-main">환불 제한 기준</h2>
            </div>
            <div className="space-y-3 text-sm leading-7 fi-text-muted">
              <p>결제 후 7일이 지났거나 프리미엄 콘텐츠, 상담, 저장 기능을 이미 이용한 경우 환불이 제한될 수 있습니다.</p>
              <p>반복 결제의 경우 다음 결제 예정일 전 해지하면 이후 결제는 발생하지 않습니다.</p>
            </div>
          </section>

          <section className="fi-accent-card overflow-hidden rounded-3xl p-5">
            <div className="mb-3 flex items-center gap-2 fi-text-accent">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-base font-semibold fi-text-main">처리 방식</h2>
            </div>
            <div className="space-y-3 text-sm leading-7 fi-text-soft">
              <p>환불은 결제에 사용한 수단으로 처리되며, 카드사 또는 결제사의 처리 일정에 따라 실제 입금까지 시간이 걸릴 수 있습니다.</p>
              <p>법령 또는 결제사 정책에 따라 추가 확인이 필요한 경우 별도 안내 후 처리됩니다.</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
