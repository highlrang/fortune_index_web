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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15">
          <CheckCircle2 className="h-10 w-10 text-emerald-300" />
        </div>

        <div className="space-y-2">
          <p className="text-lg text-white">메일 인증이 확인되었습니다.</p>
          <p className="break-all text-sm leading-6 text-white/60">{email || '인증된 이메일'}</p>
        </div>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-100">
          앱 WebView 환경에서는 인증 완료 메시지를 함께 전달하도록 준비되어 있습니다.
        </div>

        <Link
          to={email ? `/signup/profile?email=${encodedEmail}` : '/signup'}
          className="block rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-600/80 to-yellow-600/80 px-5 py-4 text-sm font-medium text-white transition-all hover:border-amber-500/70"
        >
          회원정보 입력하기
        </Link>
      </div>
    </SignupStageLayout>
  );
}
