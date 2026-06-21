import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, KeyRound, LoaderCircle, Mail } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { confirmPasswordReset, requestPasswordResetEmail } from '@/lib/api';
import { clearSession } from '@/lib/session';
import {
  PASSWORD_RESET_TOKEN_KEY,
  clearPasswordResetToken,
  getPasswordResetToken,
  savePasswordResetToken,
} from '@/lib/passwordReset';
import { SignupStageLayout } from '../components/SignupStageLayout';

export function PasswordResetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken =
    searchParams.get('resetToken')?.trim() ||
    getPasswordResetToken();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const canRequestEmail = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const isPasswordMismatch = newPasswordConfirm.length > 0 && newPassword !== newPasswordConfirm;

  useEffect(() => {
    const queryResetToken = searchParams.get('resetToken')?.trim();
    if (queryResetToken) {
      savePasswordResetToken(queryResetToken);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === PASSWORD_RESET_TOKEN_KEY && event.newValue) {
        navigate(`/password-reset?resetToken=${encodeURIComponent(event.newValue)}`, { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleRequestEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canRequestEmail) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setError('');
    setStatusMessage('');
    setIsSubmitting(true);

    try {
      clearPasswordResetToken();
      await requestPasswordResetEmail(email);
      setStatusMessage('비밀번호 변경 인증 메일을 보냈습니다. 메일의 인증 링크를 열어주세요.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 메일 발송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resetToken) {
      setError('비밀번호 변경 인증 정보가 없습니다. 인증 메일을 다시 요청해주세요.');
      return;
    }

    if (newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상 입력해주세요.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await confirmPasswordReset({ resetToken, newPassword });
      clearPasswordResetToken();
      clearSession();
      setIsCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <SignupStageLayout
        title="비밀번호 변경 완료"
        description="새 비밀번호로 다시 로그인해주세요."
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
            <p className="text-lg fi-text-main">비밀번호가 변경되었습니다.</p>
            <p className="text-sm leading-6 fi-text-muted">기존 로그인 정보는 만료되었습니다.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="fi-cta block w-full rounded-xl px-5 py-4 text-sm font-medium transition-all hover:opacity-90"
          >
            로그인으로 이동
          </button>
        </div>
      </SignupStageLayout>
    );
  }

  if (resetToken) {
    return (
      <SignupStageLayout
        title="새 비밀번호 설정"
        description="이메일 인증이 확인되었습니다. 새 비밀번호를 입력해주세요."
      >
        <form onSubmit={handleConfirmPassword} noValidate className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="newPassword" className="block text-sm fi-text-accent">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="8자 이상 입력해주세요"
                required
                minLength={8}
                className="fi-input w-full rounded-xl px-5 py-4 transition-all"
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }} />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="newPasswordConfirm" className="block text-sm fi-text-accent">
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                id="newPasswordConfirm"
                type="password"
                value={newPasswordConfirm}
                onChange={(event) => setNewPasswordConfirm(event.target.value)}
                placeholder="새 비밀번호를 한 번 더 입력해주세요"
                required
                minLength={8}
                className="fi-input w-full rounded-xl px-5 py-4 transition-all"
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }} />
            </div>
            {isPasswordMismatch ? <p className="text-xs" style={{ color: 'var(--app-danger-text)' }}>비밀번호가 일치하지 않습니다.</p> : null}
          </div>

          {error ? (
            <div className="fi-danger rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isPasswordMismatch}
            className="fi-cta flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
            {isSubmitting ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </SignupStageLayout>
    );
  }

  return (
    <SignupStageLayout
      title="비밀번호 변경"
      description="가입한 이메일로 비밀번호 변경 인증 링크를 보내드립니다."
    >
      <form onSubmit={handleRequestEmail} noValidate className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="passwordResetEmail" className="block text-sm fi-text-accent">
            이메일
          </label>
          <div className="relative">
            <input
              id="passwordResetEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@email.com"
              required
              className="fi-input w-full rounded-xl px-5 py-4 transition-all"
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }} />
          </div>
        </div>

        <div className="fi-glass rounded-xl px-4 py-4 text-sm leading-6 fi-text-muted">
          메일의 인증 링크를 열면 새 비밀번호 설정 화면으로 이동합니다. 별도 인증코드 입력은 필요하지 않습니다.
        </div>

        {statusMessage ? (
          <div className="rounded-xl px-4 py-3 text-sm leading-6" style={{ border: '1px solid var(--app-success-border)', background: 'var(--app-success-bg)', color: 'var(--app-success-text)' }}>
            {statusMessage}
          </div>
        ) : null}

        {error ? (
          <div className="fi-danger rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !canRequestEmail}
          className="fi-cta flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
          {isSubmitting ? '메일 발송 중...' : '인증 메일 발송'}
        </button>

        <div className="text-center">
          <Link to="/login" className="text-sm fi-text-subtle transition-colors hover:opacity-80">
            로그인으로 돌아가기
          </Link>
        </div>
      </form>
    </SignupStageLayout>
  );
}
