import { ChevronLeft, Database, Lock, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 pb-10">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-xl transition-colors hover:bg-white/10"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-white">개인정보처리방침</h1>
            <p className="text-sm text-white/50">회원 정보의 수집, 이용, 보관에 대한 안내</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-amber-300">
              <Database className="h-5 w-5" />
              <h2 className="text-base font-semibold text-white">수집하는 개인정보</h2>
            </div>
            <div className="space-y-3 text-sm leading-7 text-white/75">
              <p>회사는 회원가입, 본인 확인, 서비스 제공을 위해 이름, 이메일, 비밀번호, 생년월일, 출생시간, 성별, 투자 성향, 관심 섹터 정보를 수집할 수 있습니다.</p>
              <p>서비스 이용 과정에서 접속 로그, 기기 정보, 이용 기록, 알림 설정 여부 등 서비스 운영에 필요한 정보가 자동으로 생성되어 수집될 수 있습니다.</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-amber-300">
              <UserCheck className="h-5 w-5" />
              <h2 className="text-base font-semibold text-white">이용 목적</h2>
            </div>
            <div className="space-y-3 text-sm leading-7 text-white/75">
              <p>수집한 개인정보는 회원 식별, 계정 관리, 맞춤형 투자 성향 분석, 상담 이력 제공, 공지 및 안내, 고객 문의 대응을 위해 이용됩니다.</p>
              <p>회사는 서비스 품질 개선, 오류 분석, 부정 이용 방지, 보안 강화를 위해 필요한 범위에서 개인정보를 활용할 수 있습니다.</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-amber-300">
              <Lock className="h-5 w-5" />
              <h2 className="text-base font-semibold text-white">보관 및 보호</h2>
            </div>
            <div className="space-y-3 text-sm leading-7 text-white/75">
              <p>회사는 개인정보를 수집 목적이 달성될 때까지 또는 관련 법령에서 정한 기간 동안 보관하며, 보관 사유가 종료되면 지체 없이 파기합니다.</p>
              <p>개인정보 보호를 위해 접근 권한 통제, 인증 정보 관리, 보안 점검 등 합리적인 보호 조치를 시행합니다. 다만, 네트워크 환경상 완전한 보안을 절대적으로 보장할 수는 없습니다.</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-violet-500/10 p-5 backdrop-blur-xl">
            <h2 className="mb-3 text-base font-semibold text-white">이용자 권리</h2>
            <div className="space-y-3 text-sm leading-7 text-white/85">
              <p>이용자는 언제든지 자신의 개인정보 조회, 수정, 삭제, 처리 정지를 요청할 수 있으며, 회사는 관련 법령에 따라 지체 없이 필요한 조치를 검토합니다.</p>
              <p>회원 탈퇴 시 법령상 보존 의무가 있는 경우를 제외하고 개인정보는 복구 불가능한 방식으로 삭제 또는 분리 보관됩니다.</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
