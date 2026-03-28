import { useMemo, useState } from 'react';
import { LoaderCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { sendEmailVerificationMail } from '@/lib/api';
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
      await sendEmailVerificationMail(email);
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
          <label htmlFor="email" className="block text-sm text-amber-200/80">
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
              className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-5 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/65">
          인증 메일 발송 후 메일 확인 화면으로 이동합니다. 인증 링크를 누르면 자동으로 다음 단계가 열립니다.
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-600/80 to-yellow-600/80 px-5 py-4 text-base font-medium text-white transition-all hover:border-amber-500/70 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
          {isSubmitting ? '메일 발송 중...' : '인증 메일 발송'}
        </button>
      </form>
    </SignupStageLayout>
  );
}
