import { Link } from 'react-router';
import {
  getSignupEmailVerificationToken,
  getSignupVerificationEmail,
} from '@/lib/signupVerification';
import { PremiumSignupForm } from '../components/PremiumSignupForm';
import { SignupStageLayout } from '../components/SignupStageLayout';

export function SignupProfilePage() {
  const emailVerificationToken = getSignupEmailVerificationToken();
  const verifiedEmail = getSignupVerificationEmail();

  if (!emailVerificationToken) {
    return (
      <SignupStageLayout
        title="회원가입"
        description="회원가입을 진행하려면 이메일 인증을 먼저 완료해주세요."
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            인증된 이메일 정보가 없습니다. 이메일 인증 단계부터 다시 시작해주세요.
          </div>
          <Link
            to="/signup"
            className="block rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-center text-sm text-amber-200 transition-colors hover:bg-amber-500/20"
          >
            이메일 인증 시작하기
          </Link>
        </div>
      </SignupStageLayout>
    );
  }

  return (
    <SignupStageLayout
      title="회원가입"
      description="인증된 이메일을 바탕으로 회원정보를 입력해주세요."
    >
      <PremiumSignupForm
        emailVerificationToken={emailVerificationToken}
        verifiedEmail={verifiedEmail}
      />
    </SignupStageLayout>
  );
}
