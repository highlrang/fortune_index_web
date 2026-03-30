import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { SignupStageLayout } from '../components/SignupStageLayout';

export function SignupEmailSuccessPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';
  const encodedEmail = encodeURIComponent(email);

  useEffect(() => {
    (
      window as Window & {
        ReactNativeWebView?: { postMessage: (message: string) => void };
      }
    ).ReactNativeWebView?.postMessage('EMAIL_VERIFIED');
  }, []);

  return (
    <SignupStageLayout
      title="이메일 인증 완료"
      description="인증이 정상적으로 완료되었습니다. 다음 단계로 진행해주세요."
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
          <p className="break-all text-sm leading-6 fi-text-muted">{email || '인증된 이메일'}</p>
        </div>

        <Link
          to={email ? `/signup/profile?email=${encodedEmail}` : '/signup'}
          className="fi-cta block rounded-xl px-5 py-4 text-sm font-medium transition-all hover:opacity-90"
        >
          회원정보 입력하기
        </Link>
      </div>
    </SignupStageLayout>
  );
}
