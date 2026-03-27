import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { requestSignupEmailCode, signup, toSessionState } from '@/lib/api';
import { saveSession } from '@/lib/session';

type Gender = 'male' | 'female' | null;
type RiskProfile = 'STABLE' | 'AGGRESSIVE';

const sectorOptions = [
  { label: '기술', value: 'TECHNOLOGY' },
  { label: '금융', value: 'FINANCE' },
  { label: '헬스케어', value: 'HEALTHCARE' },
  { label: '에너지', value: 'ENERGY' },
  { label: '소비재', value: 'CONSUMER' },
  { label: '산업재', value: 'INDUSTRIAL' },
  { label: '소재', value: 'MATERIALS' },
  { label: '통신', value: 'TELECOMMUNICATION' },
  { label: '부동산', value: 'REAL_ESTATE' },
  { label: 'ETF', value: 'ETF' },
];

export function PremiumSignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(null);
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthHour, setBirthHour] = useState('');
  const [birthMinute, setBirthMinute] = useState('');
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [investmentRiskProfile, setInvestmentRiskProfile] = useState<RiskProfile>('STABLE');
  const [preferredSectors, setPreferredSectors] = useState<string[]>(['TECHNOLOGY']);
  const [codeRequestMessage, setCodeRequestMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);

  const canRequestCode = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const isPasswordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const birthDate = buildBirthDate(birthYear, birthMonth, birthDay);
  const birthTime = buildBirthTime(birthHour, birthMinute);

  const toggleSector = (sector: string) => {
    setPreferredSectors((prev) =>
      prev.includes(sector) ? prev.filter((item) => item !== sector) : [...prev, sector],
    );
  };

  const handleRequestCode = async () => {
    if (!canRequestCode) {
      setError('인증 코드를 받으려면 올바른 이메일을 입력해주세요.');
      return;
    }

    setError('');
    setCodeRequestMessage('');
    setIsRequestingCode(true);

    try {
      const response = await requestSignupEmailCode(email);
      setCodeRequestMessage(`인증 코드를 보냈습니다. 만료 시각: ${new Date(response.expiresAt).toLocaleString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 요청에 실패했습니다.');
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!birthDate) {
      setError('생년월일을 올바르게 입력해주세요.');
      return;
    }

    if (!birthTimeUnknown && !birthTime) {
      setError('태어난 시간을 올바르게 입력해주세요.');
      return;
    }

    if (preferredSectors.length === 0) {
      setError('관심 섹터를 하나 이상 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signup({
        name,
        email,
        password,
        verificationCode,
        birthDate,
        birthTime: birthTimeUnknown || !birthTime ? undefined : birthTime,
        investmentRiskProfile,
        preferredSectors,
      });

      saveSession(toSessionState(response));
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
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
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-5 py-4 pr-32 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            type="button"
            onClick={handleRequestCode}
            disabled={!canRequestCode || isRequestingCode}
            className="absolute right-2 top-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRequestingCode ? '전송 중' : '인증코드 받기'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="verificationCode" className="block text-sm text-amber-200/80">
          이메일 인증 코드
        </label>
        <div className="relative">
          <input
            id="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="메일로 받은 코드를 입력해주세요"
            required
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-5 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent" />
        </div>
        {codeRequestMessage ? <p className="text-xs text-emerald-300">{codeRequestMessage}</p> : null}
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
            placeholder="8자 이상 입력해주세요"
            required
            minLength={8}
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-5 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent" />
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="passwordConfirm" className="block text-sm text-amber-200/80">
          비밀번호 확인
        </label>
        <div className="relative">
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호를 한 번 더 입력해주세요"
            required
            minLength={8}
            aria-invalid={isPasswordMismatch}
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-5 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent" />
        </div>
        {isPasswordMismatch ? (
          <p className="text-xs text-rose-300">비밀번호가 일치하지 않습니다.</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <label htmlFor="name" className="block text-sm text-amber-200/80">
          이름
        </label>
        <div className="relative">
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요"
            required
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-5 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-amber-200/80">성별</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '남성', value: 'male' as const },
            { label: '여성', value: 'female' as const },
          ].map((option) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => setGender(option.value)}
              className={`relative overflow-hidden rounded-xl border px-6 py-5 backdrop-blur-xl transition-all ${
                gender === option.value
                  ? 'border-amber-500/60 bg-white/15'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`relative text-base ${gender === option.value ? 'text-amber-200' : 'text-white/60'}`}>
                {option.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-amber-200/80">
          생년월일
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input
            id="birthYear"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="생년"
            required
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-4 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <input
            id="birthMonth"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="월"
            required
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-4 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <input
            id="birthDay"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="일"
            required
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-4 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        {birthYear.length === 4 && birthMonth.length > 0 && birthDay.length > 0 && !birthDate ? (
          <p className="text-xs text-rose-300">유효한 생년월일을 입력해주세요.</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <label htmlFor="birthTime" className="block text-sm text-amber-200/80">
          태어난 시간
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            id="birthHour"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={birthHour}
            onChange={(e) => setBirthHour(e.target.value.replace(/\D/g, '').slice(0, 2))}
            disabled={birthTimeUnknown}
            placeholder="시(00-23)"
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-4 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          />
          <input
            id="birthMinute"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={birthMinute}
            onChange={(e) => setBirthMinute(e.target.value.replace(/\D/g, '').slice(0, 2))}
            disabled={birthTimeUnknown}
            placeholder="분(00-59)"
            className="w-full rounded-xl border border-amber-500/20 bg-white/5 px-4 py-4 text-white placeholder-white/30 backdrop-blur-xl transition-all focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>
        {!birthTimeUnknown && (birthHour.length > 0 || birthMinute.length > 0) && !birthTime ? (
          <p className="text-xs text-rose-300">시간은 00-23, 분은 00-59 형식으로 입력해주세요.</p>
        ) : null}

        <label className="group flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={birthTimeUnknown}
              onChange={(e) => {
                setBirthTimeUnknown(e.target.checked);
                if (e.target.checked) {
                  setBirthHour('');
                  setBirthMinute('');
                }
              }}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-white/20 bg-white/5 transition-all checked:border-amber-500/60 checked:bg-amber-500/30"
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-amber-400 opacity-0 transition-opacity peer-checked:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-white/60 transition-colors group-hover:text-white/80">
            태어난 시간을 모름
          </span>
        </label>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-amber-200/80">투자 성향</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '안정형', value: 'STABLE' as const },
            { label: '공격형', value: 'AGGRESSIVE' as const },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setInvestmentRiskProfile(option.value)}
              className={`rounded-xl border px-4 py-4 text-sm transition-all ${
                investmentRiskProfile === option.value
                  ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-amber-200/80">선호 섹터</label>
        <div className="flex flex-wrap gap-2">
          {sectorOptions.map((sector) => {
            const selected = preferredSectors.includes(sector.value);
            return (
              <button
                key={sector.value}
                type="button"
                onClick={() => toggleSector(sector.value)}
                className={`rounded-full border px-4 py-2 text-xs transition-all ${
                  selected
                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-200'
                    : 'border-white/15 bg-white/5 text-white/60 hover:border-white/25'
                }`}
              >
                {sector.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

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
          {isSubmitting ? '가입 중...' : '운명의 문을 열다'}
          <Sparkles className="h-5 w-5" />
        </span>
      </motion.button>

      <p className="text-center text-xs text-white/30">
        가입 시{' '}
        <Link
          to="/terms"
          className="text-amber-500/60 underline underline-offset-2 transition-colors hover:text-amber-400"
        >
          서비스 이용약관
        </Link>{' '}
        및{' '}
        <Link
          to="/privacy"
          className="text-amber-500/60 underline underline-offset-2 transition-colors hover:text-amber-400"
        >
          개인정보 처리방침
        </Link>
        에 동의하게 됩니다
      </p>

      <div className="text-center">
        <p className="text-sm text-white/50">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-amber-400 transition-colors hover:text-amber-300">
            로그인 하러가기
          </Link>
        </p>
      </div>
    </form>
  );
}

function buildBirthDate(year: string, month: string, day: string) {
  if (year.length !== 4 || month.length === 0 || day.length === 0) {
    return '';
  }

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);

  if (
    !Number.isInteger(numericYear) ||
    !Number.isInteger(numericMonth) ||
    !Number.isInteger(numericDay) ||
    numericMonth < 1 ||
    numericMonth > 12 ||
    numericDay < 1 ||
    numericDay > 31
  ) {
    return '';
  }

  const date = new Date(Date.UTC(numericYear, numericMonth - 1, numericDay));
  const isValidDate =
    date.getUTCFullYear() === numericYear &&
    date.getUTCMonth() === numericMonth - 1 &&
    date.getUTCDate() === numericDay;

  if (!isValidDate) {
    return '';
  }

  return `${year}-${String(numericMonth).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`;
}

function buildBirthTime(hour: string, minute: string) {
  if (hour.length === 0 && minute.length === 0) {
    return '';
  }

  if (hour.length === 0 || minute.length === 0) {
    return '';
  }

  const numericHour = Number(hour);
  const numericMinute = Number(minute);

  if (
    !Number.isInteger(numericHour) ||
    !Number.isInteger(numericMinute) ||
    numericHour < 0 ||
    numericHour > 23 ||
    numericMinute < 0 ||
    numericMinute > 59
  ) {
    return '';
  }

  return `${String(numericHour).padStart(2, '0')}:${String(numericMinute).padStart(2, '0')}`;
}
