import { useMemo, useState } from 'react';
import { LoaderCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { requestSignupEmailVerification } from '@/lib/api';
import {
  clearSignupEmailVerification,
  saveSignupVerificationEmail,
} from '@/lib/signupVerification';
import { SignupStageLayout } from '../components/SignupStageLayout';

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      clearSignupEmailVerification();
      await requestSignupEmailVerification(email);
      saveSignupVerificationEmail(email);
      navigate(`/signup/email-check?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 메일 발송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SignupStageLayout
      title="이메일 인증"
      description="회원가입 전, 인증 메일을 받을 이메일 주소를 먼저 입력해주세요."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm fi-text-accent">
            이메일
          </label>
          <div className="relative">
            <input
              id="email"
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

        {error ? (
          <div className="fi-danger rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="fi-cta flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
          {isSubmitting ? '메일 발송 중...' : '인증 메일 발송'}
        </button>
      </form>
    </SignupStageLayout>
  );
}
