import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { openAuthVerifiedDeepLinkOnce } from '@/lib/nativeDeepLink';
import {
  getSignupEmailVerificationToken,
  saveSignupEmailVerificationToken,
} from '@/lib/signupVerification';
import { SignupStageLayout } from '../components/SignupStageLayout';

export function AuthVerifiedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';
  const emailVerificationToken =
    searchParams.get('emailVerificationToken')?.trim() ||
    searchParams.get('token')?.trim() ||
    '';

  useEffect(() => {
    if (emailVerificationToken) {
      saveSignupEmailVerificationToken(emailVerificationToken);
    }

    openAuthVerifiedDeepLinkOnce(searchParams.toString());

    const savedToken = emailVerificationToken || getSignupEmailVerificationToken();
    if (savedToken) {
      navigate('/signup/profile', { replace: true });
    }
  }, [emailVerificationToken, navigate, searchParams]);

  return (
    <SignupStageLayout
      title="이메일 인증 완료"
      description="인증이 정상적으로 완료되었습니다. 회원정보 입력 화면으로 이동합니다."
    >
      <div className="space-y-6 text-center">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border"
          style={{
            borderWidth: 'var(--app-hairline-border)',
            borderStyle: 'solid',
            borderColor: 'var(--app-success-border)',
            background: 'var(--app-success-bg)',
            backdropFilter: 'var(--card-blur)',
            WebkitBackdropFilter: 'var(--card-blur)',
          }}
        >
          <CheckCircle2 className="fi-status-icon-success h-10 w-10" />
        </div>

        <div className="space-y-2">
          <p className="text-lg fi-text-main">메일 인증이 확인되었습니다.</p>
          <p className="text-sm leading-6 fi-text-muted">
            회원정보 입력 단계로 자동 이동합니다.
          </p>
          {email ? (
            <p className="break-all text-xs leading-5 fi-text-subtle">{email}</p>
          ) : null}
        </div>
      </div>
    </SignupStageLayout>
  );
}
