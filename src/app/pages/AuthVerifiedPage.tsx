import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { openAuthVerifiedDeepLinkOnce } from '@/lib/nativeDeepLink';
import { SignupStageLayout } from '../components/SignupStageLayout';

export function AuthVerifiedPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';

  useEffect(() => {
    openAuthVerifiedDeepLinkOnce(searchParams.toString());
  }, [searchParams]);

  return (
    <SignupStageLayout
      title="이메일 인증 완료"
      description="인증이 정상적으로 완료되었습니다."
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
            앱이 열리지 않았다면 Voda 앱에서 회원가입을 계속 진행해주세요.
          </p>
          {email ? (
            <p className="break-all text-xs leading-5 fi-text-subtle">{email}</p>
          ) : null}
        </div>

        <Link
          to="/signup/profile"
          className="fi-cta block w-full rounded-xl px-5 py-4 text-sm font-medium transition-all hover:opacity-90"
        >
          웹에서 계속하기
        </Link>
      </div>
    </SignupStageLayout>
  );
}
