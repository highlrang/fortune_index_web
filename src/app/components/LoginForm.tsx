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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <label htmlFor="email" className="block text-sm text-amber-200/80">
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
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-5 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent" />
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="password" className="block text-sm text-amber-200/80">
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
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-5 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent" />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="text-right">
        <button type="button" className="text-sm text-white/40 transition-colors hover:text-amber-400">
          비밀번호를 잊으셨나요?
        </button>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full overflow-hidden rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-600/80 to-yellow-600/80 px-8 py-5 backdrop-blur-xl transition-all hover:border-amber-500/70 disabled:cursor-not-allowed disabled:opacity-60"
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-400/40 to-yellow-500/40"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <span className="relative flex items-center justify-center gap-2 text-base font-medium text-white">
          {isSubmitting ? '로그인 중...' : '운명의 문을 열다'}
          <Sparkles className="h-5 w-5" />
        </span>
      </motion.button>

      <div className="text-center">
        <p className="text-sm text-white/50">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-amber-400 transition-colors hover:text-amber-300">
            회원가입 하러가기
          </Link>
        </p>
      </div>
    </form>
  );
}
