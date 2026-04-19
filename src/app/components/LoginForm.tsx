import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { login, toSessionState } from '@/lib/api';
import { saveSession } from '@/lib/session';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      saveSession(toSessionState(response));
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm fi-text-accent">
          이메일
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="fi-input w-full rounded-xl px-4 py-3 transition-all"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm fi-text-accent">
          비밀번호
        </label>
        <div className="relative">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요"
            required
            className="fi-input w-full rounded-xl px-4 py-3 transition-all"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }} />
        </div>
      </div>

      {error ? (
        <div className="fi-danger rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="text-right">
        <Link to="/password-reset" className="text-sm fi-text-subtle transition-colors hover:opacity-80">
          비밀번호를 잊으셨나요?
        </Link>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="fi-cta group relative w-full overflow-hidden rounded-xl px-6 py-4 transition-all disabled:cursor-not-allowed disabled:opacity-60"
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <span className="relative flex items-center justify-center gap-2 text-base font-medium fi-text-main">
          {isSubmitting ? '로그인 중...' : '운명의 문을 열다'}
          <Sparkles className="h-5 w-5" />
        </span>
      </motion.button>

      <div className="text-center">
        <p className="text-sm fi-text-muted">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="fi-text-accent transition-colors hover:opacity-80">
            회원가입 하러가기
          </Link>
        </p>
      </div>
    </form>
  );
}
