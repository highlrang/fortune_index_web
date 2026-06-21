import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import {
  getEmailVerificationStatus,
  requestSignupEmailVerification,
  type EmailVerificationStatusResponse,
} from '@/lib/api';
import {
  SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY,
  clearSignupEmailVerification,
  getSignupEmailVerificationToken,
  saveSignupVerificationEmail,
} from '@/lib/signupVerification';
import { SignupStageLayout } from '../components/SignupStageLayout';

const POLLING_INTERVAL_MS = 3000;
const POLLING_TIMEOUT_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_SECONDS = 30;

export function SignupEmailPendingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';

  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('메일 인증 상태를 자동으로 확인하고 있습니다.');
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const startedAtRef = useRef(Date.now());
  const timeoutIdRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const cooldownTimer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(cooldownTimer);
  }, [resendCooldown]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY && event.newValue) {
        navigate('/signup/profile', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  useEffect(() => {
    if (!email) return undefined;

    let isCancelled = false;
    startedAtRef.current = Date.now();

    const scheduleNextPoll = () => {
      if (isCancelled || hasTimedOut) return;
      timeoutIdRef.current = window.setTimeout(() => {
        void checkVerificationStatus(false);
      }, POLLING_INTERVAL_MS);
    };

    const handleStatus = (response: EmailVerificationStatusResponse) => {
      if (response.status === 'VERIFIED') {
        const emailVerificationToken = getSignupEmailVerificationToken();
        if (emailVerificationToken) {
          navigate('/signup/profile', { replace: true });
          return true;
        }

        setError('');
        setStatusMessage('이메일 인증은 확인되었습니다. 메일의 인증 링크를 클릭한 같은 브라우저/앱으로 돌아와 회원가입을 계속 진행해주세요.');
        return true;
      }

      if (response.status === 'EXPIRED') {
        setError('인증 메일이 만료되었습니다. 재전송 후 다시 진행해주세요.');
        setStatusMessage('메일 인증 시간이 만료되었습니다.');
        return false;
      }

      setError('');
      setStatusMessage('메일함에서 인증을 완료하면 자동으로 다음 단계로 이동합니다.');
      return false;
    };

    const checkVerificationStatus = async (isManual: boolean) => {
      if (isPollingRef.current) return;
      if (Date.now() - startedAtRef.current >= POLLING_TIMEOUT_MS) {
        setHasTimedOut(true);
        setError('5분 동안 인증이 확인되지 않았습니다. 메일을 다시 보내고 시도해주세요.');
        setStatusMessage('자동 확인이 중지되었습니다.');
        return;
      }

      isPollingRef.current = true;
      setIsChecking(isManual);

      try {
        const response = await getEmailVerificationStatus(email);
        const completed = handleStatus(response);
        if (!completed && !isManual) {
          scheduleNextPoll();
        }
        if (!completed && isManual) {
          setStatusMessage('아직 인증이 확인되지 않았습니다. 메일의 인증 링크를 먼저 눌러주세요.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '네트워크 오류로 인증 상태를 확인하지 못했습니다.');
        if (!isManual) {
          scheduleNextPoll();
        }
      } finally {
        isPollingRef.current = false;
        setIsChecking(false);
      }
    };

    void checkVerificationStatus(false);

    return () => {
      isCancelled = true;
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, [email, hasTimedOut, navigate]);

  const handleResend = async () => {
    setError('');
    setStatusMessage('');
    setIsSending(true);

    try {
      clearSignupEmailVerification();
      await requestSignupEmailVerification(email);
      saveSignupVerificationEmail(email);
      startedAtRef.current = Date.now();
      setHasTimedOut(false);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStatusMessage('인증 메일을 다시 보냈습니다. 메일함을 확인해주세요.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 메일 재전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleManualCheck = async () => {
    if (!email) return;
    if (isPollingRef.current) {
      setStatusMessage('인증 상태를 확인 중입니다. 잠시 후 다시 눌러주세요.');
      return;
    }

    setError('');
    setStatusMessage('인증 상태를 즉시 확인하고 있습니다.');
    setIsChecking(true);

    try {
      const response = await getEmailVerificationStatus(email);
      if (response.status === 'VERIFIED') {
        const emailVerificationToken = getSignupEmailVerificationToken();
        if (emailVerificationToken) {
          navigate('/signup/profile', { replace: true });
          return;
        }

        setStatusMessage('이메일 인증은 확인되었습니다. 메일의 인증 링크를 클릭한 같은 브라우저/앱으로 돌아와 회원가입을 계속 진행해주세요.');
        return;
      }

      if (response.status === 'EXPIRED') {
        setError('인증 메일이 만료되었습니다. 재전송 후 다시 시도해주세요.');
      } else {
        setStatusMessage('아직 인증이 완료되지 않았습니다. 메일의 인증 링크를 눌러주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 상태를 확인하지 못했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  if (!email) {
    return (
      <SignupStageLayout
        title="이메일 인증"
        description="회원가입을 시작하려면 먼저 인증할 이메일이 필요합니다."
      >
      <div className="space-y-6">
          <div className="fi-danger rounded-xl px-4 py-3 text-sm">
            인증할 이메일 정보가 없습니다. 처음 단계부터 다시 진행해주세요.
          </div>
          <Link
            to="/signup"
            className="fi-cta block rounded-xl px-5 py-4 text-center text-sm transition-colors hover:opacity-90"
          >
            이메일 입력 화면으로 돌아가기
          </Link>
        </div>
      </SignupStageLayout>
    );
  }

  return (
    <SignupStageLayout
      title="메일을 확인해주세요"
      description="인증 링크를 누르면 자동으로 다음 단계로 이동합니다."
    >
      <div className="space-y-6">
        <div className="fi-accent-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.24em] fi-text-accent">인증 메일</p>
          <p className="mt-2 break-all text-base fi-text-main">{email}</p>
        </div>

        {hasTimedOut ? (
          <div className="fi-glass rounded-xl px-4 py-4 text-sm leading-6 fi-text-muted">
            <p className="fi-text-accent">자동 확인이 종료되었습니다. 재전송 후 다시 시도해주세요.</p>
          </div>
        ) : null}

        {error ? (
          <div className="fi-danger rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isSending || resendCooldown > 0}
            className="fi-glass flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm fi-text-soft transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {resendCooldown > 0 ? `재전송 (${resendCooldown}초)` : '재전송'}
          </button>

          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="rounded-xl border px-5 py-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderWidth: 'var(--app-hairline-border)',
              borderStyle: 'solid',
              borderColor: 'var(--app-success-border)',
              background: 'var(--app-success-bg)',
              color: 'var(--app-success-text)',
              backdropFilter: 'var(--card-blur)',
              WebkitBackdropFilter: 'var(--card-blur)',
            }}
          >
            {isChecking ? '확인 중...' : '인증 완료했어요'}
          </button>
        </div>

        <p className="text-center text-xs fi-text-subtle">
          메일이 보이지 않으면 스팸함도 확인해주세요.
        </p>
      </div>
    </SignupStageLayout>
  );
}
