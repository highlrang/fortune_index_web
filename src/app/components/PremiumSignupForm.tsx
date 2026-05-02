import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { signup, toSessionState } from '@/lib/api';
import { saveSession } from '@/lib/session';
import { clearSignupEmailVerification } from '@/lib/signupVerification';

type Gender = 'male' | 'female' | null;
type RiskProfile = 'STABLE' | 'AGGRESSIVE';
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1929 }, (_, index) => String(currentYear - index));
const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
const dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'));
const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

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

interface PremiumSignupFormProps {
  emailVerificationToken: string;
  verifiedEmail?: string;
}

export function PremiumSignupForm({
  emailVerificationToken,
  verifiedEmail,
}: PremiumSignupFormProps) {
  const navigate = useNavigate();
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
  const [investmentRiskProfile, setInvestmentRiskProfile] = useState<RiskProfile>('STABLE');
  const [preferredSectors, setPreferredSectors] = useState<string[]>(['TECHNOLOGY']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const birthDate = buildBirthDate(birthYear, birthMonth, birthDay);
  const birthTime = buildBirthTime(birthHour, birthMinute);

  const toggleSector = (sector: string) => {
    setPreferredSectors((prev) =>
      prev.includes(sector) ? prev.filter((item) => item !== sector) : [...prev, sector],
    );
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
        emailVerificationToken,
        password,
        birthDate,
        birthTime: birthTimeUnknown || !birthTime ? undefined : birthTime,
        investmentRiskProfile,
        preferredSectors,
      });

      clearSignupEmailVerification();
      saveSession(toSessionState(response));
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2.5">
        <label htmlFor="email" className="block text-sm fi-text-accent">
          인증된 이메일
        </label>
        <div className="relative">
          <input
            id="email"
            type="text"
            value={verifiedEmail || '이메일 인증 완료'}
            readOnly
            className="fi-input fi-input-readonly w-full rounded-xl px-4 py-3.5 outline-none"
            style={{ background: 'rgba(16, 185, 129, 0.12)' }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)' }} />
        </div>
        <p className="text-xs fi-text-subtle">
          이메일을 변경하려면{' '}
          <Link to="/signup" className="fi-text-accent transition-colors hover:opacity-80">
            인증 단계로 돌아가기
          </Link>
          .
        </p>
      </div>

      <div className="space-y-2.5">
        <label htmlFor="password" className="block text-sm fi-text-accent">
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
            className="fi-input w-full rounded-xl px-4 py-3.5 transition-all"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }} />
        </div>
      </div>

      <div className="space-y-2.5">
        <label htmlFor="passwordConfirm" className="block text-sm fi-text-accent">
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
            className="fi-input w-full rounded-xl px-4 py-3.5 transition-all"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }} />
        </div>
        {isPasswordMismatch ? <p className="text-xs" style={{ color: 'var(--app-danger-text)' }}>비밀번호가 일치하지 않습니다.</p> : null}
      </div>

      <div className="space-y-2.5">
        <label htmlFor="name" className="block text-sm fi-text-accent">
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
            className="fi-input w-full rounded-xl px-4 py-3.5 transition-all"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--app-accent-soft) 0%, transparent 100%)' }} />
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="block text-sm fi-text-accent">성별</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '남성', value: 'male' as const },
            { label: '여성', value: 'female' as const },
          ].map((option) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => setGender(option.value)}
              className="relative overflow-hidden rounded-xl border px-5 py-4 transition-all"
              style={
                gender === option.value
                  ? {
                      background: 'var(--app-accent-surface)',
                      borderColor: 'var(--app-accent-border-strong)',
                      backdropFilter: 'var(--card-blur)',
                      WebkitBackdropFilter: 'var(--card-blur)',
                    }
                  : {
                      background: 'var(--card-surface)',
                      borderColor: 'var(--card-border)',
                      backdropFilter: 'var(--card-blur)',
                      WebkitBackdropFilter: 'var(--card-blur)',
                    }
              }
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative text-sm" style={{ color: gender === option.value ? 'var(--app-accent-text-soft)' : 'var(--app-text-muted)' }}>
                {option.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="block text-sm fi-text-accent">
          생년월일
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <select
            id="birthYear"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            required
            className="fi-input w-full rounded-xl px-3 py-3.5 text-sm transition-all"
          >
            <option value="">생년</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
          <select
            id="birthMonth"
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
            required
            className="fi-input w-full rounded-xl px-3 py-3.5 text-sm transition-all"
          >
            <option value="">월</option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </select>
          <select
            id="birthDay"
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            required
            className="fi-input w-full rounded-xl px-3 py-3.5 text-sm transition-all"
          >
            <option value="">일</option>
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                {day}일
              </option>
            ))}
          </select>
        </div>
        {birthYear.length === 4 && birthMonth.length > 0 && birthDay.length > 0 && !birthDate ? <p className="text-xs" style={{ color: 'var(--app-danger-text)' }}>유효한 생년월일을 입력해주세요.</p> : null}
      </div>

      <div className="space-y-2.5">
        <label htmlFor="birthTime" className="block text-sm fi-text-accent">
          태어난 시간
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <select
            id="birthHour"
            value={birthHour}
            onChange={(e) => setBirthHour(e.target.value)}
            disabled={birthTimeUnknown}
            className="fi-input w-full rounded-xl px-3 py-3.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            <option value="">시</option>
            {hourOptions.map((hour) => (
              <option key={hour} value={hour}>
                {hour}시
              </option>
            ))}
          </select>
          <select
            id="birthMinute"
            value={birthMinute}
            onChange={(e) => setBirthMinute(e.target.value)}
            disabled={birthTimeUnknown}
            className="fi-input w-full rounded-xl px-3 py-3.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            <option value="">분</option>
            {minuteOptions.map((minute) => (
              <option key={minute} value={minute}>
                {minute}분
              </option>
            ))}
          </select>
        </div>
        {!birthTimeUnknown && (birthHour.length > 0 || birthMinute.length > 0) && !birthTime ? <p className="text-xs" style={{ color: 'var(--app-danger-text)' }}>시간은 00-23, 분은 00-59 형식으로 입력해주세요.</p> : null}

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
              className="peer h-5 w-5 cursor-pointer appearance-none rounded transition-all"
              style={{
                borderWidth: 'var(--app-hairline-border)',
                borderStyle: 'solid',
                borderColor: birthTimeUnknown ? 'var(--app-accent-border-strong)' : 'var(--card-border)',
                background: birthTimeUnknown ? 'var(--app-accent-surface)' : 'var(--card-surface)',
                backdropFilter: 'var(--card-blur)',
                WebkitBackdropFilter: 'var(--card-blur)',
              }}
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100"
              style={{ color: 'var(--point-gold)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm fi-text-muted transition-colors group-hover:opacity-80">
            태어난 시간을 모름
          </span>
        </label>
      </div>

      <div className="space-y-3">
        <label className="block text-sm fi-text-accent">투자 성향</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '안정형', value: 'STABLE' as const },
            { label: '공격형', value: 'AGGRESSIVE' as const },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setInvestmentRiskProfile(option.value)}
              className="rounded-xl border px-4 py-4 text-sm transition-all"
              style={
                investmentRiskProfile === option.value
                  ? {
                      background: 'var(--app-accent-surface)',
                      borderColor: 'var(--app-accent-border-strong)',
                      color: 'var(--app-accent-text-soft)',
                      backdropFilter: 'var(--card-blur)',
                      WebkitBackdropFilter: 'var(--card-blur)',
                    }
                  : {
                      background: 'var(--card-surface)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--app-text-muted)',
                      backdropFilter: 'var(--card-blur)',
                      WebkitBackdropFilter: 'var(--card-blur)',
                    }
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm fi-text-accent">선호 섹터</label>
        <div className="flex flex-wrap gap-2">
          {sectorOptions.map((sector) => {
            const selected = preferredSectors.includes(sector.value);
            return (
              <button
                key={sector.value}
                type="button"
                onClick={() => toggleSector(sector.value)}
                className="rounded-full border px-4 py-2 text-xs transition-all"
                style={
                  selected
                    ? {
                        background: 'var(--app-accent-surface)',
                        borderColor: 'var(--app-accent-border-strong)',
                        color: 'var(--app-accent-text-soft)',
                        backdropFilter: 'var(--card-blur)',
                        WebkitBackdropFilter: 'var(--card-blur)',
                      }
                    : {
                        background: 'var(--card-surface)',
                        borderColor: 'var(--card-border)',
                        color: 'var(--app-text-muted)',
                        backdropFilter: 'var(--card-blur)',
                        WebkitBackdropFilter: 'var(--card-blur)',
                      }
                }
              >
                {sector.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="fi-danger rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="fi-cta group relative w-full overflow-hidden rounded-xl px-8 py-5 transition-all disabled:cursor-not-allowed disabled:opacity-60"
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
          {isSubmitting ? '가입 중...' : '운명의 문을 열다'}
          <Sparkles className="h-5 w-5" />
        </span>
      </motion.button>

      <p className="text-center text-xs fi-text-subtle">
        가입 시{' '}
        <Link
          to="/terms"
          className="fi-text-accent underline underline-offset-2 transition-colors hover:opacity-80"
        >
          서비스 이용약관
        </Link>{' '}
        및{' '}
        <Link
          to="/privacy"
          className="fi-text-accent underline underline-offset-2 transition-colors hover:opacity-80"
        >
          개인정보 처리방침
        </Link>
        에 동의하게 됩니다
      </p>

      <div className="text-center">
        <p className="text-sm fi-text-muted">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="fi-text-accent transition-colors hover:opacity-80">
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
