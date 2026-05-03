import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import {
  captureSignupVerificationParams,
  getSignupVerificationEmail,
} from '@/lib/signupVerification';
import {
  buildAuthVerifiedQuery,
  getAuthVerifiedWebUrl,
  openAuthVerifiedDeepLink,
} from '@/lib/nativeDeepLink';
import { SignupStageLayout } from '../components/SignupStageLayout';

export function SignupEmailVerifiedPage() {
  const [searchParams] = useSearchParams();
  const {
    email,
    emailVerificationToken,
    status,
    isSuccess,
  } = captureSignupVerificationParams(searchParams);
  const verifiedEmail = email || getSignupVerificationEmail();

  useEffect(() => {
    if (!emailVerificationToken || !isSuccess) return;
    (
      window as Window & {
        ReactNativeWebView?: { postMessage: (message: string) => void };
      }
    ).ReactNativeWebView?.postMessage('EMAIL_VERIFIED');

    const query = buildAuthVerifiedQuery({
      email: verifiedEmail,
      emailVerificationToken,
      status,
    });
    const openedDeepLink = openAuthVerifiedDeepLink(query);

    if (!openedDeepLink) {
      window.location.replace(getAuthVerifiedWebUrl(query));
    }
  }, [emailVerificationToken, isSuccess, status, verifiedEmail]);

  if (!emailVerificationToken || !isSuccess) {
    return (
      <SignupStageLayout
        title="이메일 인증"
        description="회원가입을 진행하려면 이메일 인증 정보가 필요합니다."
      >
        <div className="space-y-6">
          <div className="fi-danger rounded-xl px-4 py-3 text-sm">
            이메일 인증 완료 정보를 확인하지 못했습니다. 인증 메일을 다시 요청해주세요.
          </div>
          <Link
            to="/signup"
            className="fi-cta block rounded-xl px-5 py-4 text-center text-sm transition-colors hover:opacity-90"
          >
            이메일 인증 시작하기
          </Link>
        </div>
      </SignupStageLayout>
    );
  }

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
          <p className="break-all text-sm leading-6 fi-text-muted">
            {verifiedEmail || '인증 토큰이 저장되었습니다.'}
          </p>
        </div>
      </div>
    </SignupStageLayout>
  );
}
