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
            borderColor: 'rgba(16, 185, 129, 0.32)',
            background: 'rgba(16, 185, 129, 0.12)',
            backdropFilter: 'var(--card-blur)',
            WebkitBackdropFilter: 'var(--card-blur)',
          }}
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-300" />
        </div>

        <div className="space-y-2">
          <p className="text-lg fi-text-main">메일 인증이 확인되었습니다.</p>
          <p className="break-all text-sm leading-6 fi-text-muted">{email || '인증된 이메일'}</p>
        </div>

        <div
          className="rounded-xl border px-4 py-4 text-sm leading-6"
          style={{
            borderWidth: 'var(--app-hairline-border)',
            borderStyle: 'solid',
            borderColor: 'rgba(16, 185, 129, 0.24)',
            background: 'rgba(16, 185, 129, 0.08)',
            color: 'rgb(209, 250, 229)',
            backdropFilter: 'var(--card-blur)',
            WebkitBackdropFilter: 'var(--card-blur)',
          }}
        >
          앱 WebView 환경에서는 인증 완료 메시지를 함께 전달하도록 준비되어 있습니다.
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
