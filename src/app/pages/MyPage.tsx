import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Cake,
  Sparkles,
  Star,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  MessageSquare,
  TrendingUp,
  Shield,
  LogOut,
  Info,
  X,
  Pencil,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import {
  createInquiry,
  getMe,
  getMyProfileDetails,
  logout,
  resolveApiAssetUrl,
  updateMyProfile,
  type SajuDescriptionResponse,
  type UserProfileDetailsResponse,
} from '@/lib/api';
import { clearSession, getCurrentUser, getSession, updateSessionUser, type SessionUser } from '@/lib/session';
import {
  applyThemePreference,
  hasStoredThemePreference,
  persistThemePreference,
  resolveInitialThemePreference,
  type ThemePreference,
} from '@/lib/theme';

const pageGradientStyle = {
  background:
    'linear-gradient(135deg, var(--tarot-ambient-start) 0%, var(--tarot-ambient-mid) 52%, var(--tarot-ambient-end) 100%)',
};

const glassLayerStyle = {
  borderStyle: 'solid' as const,
  borderWidth: 'var(--app-hairline-border)',
  backdropFilter: 'var(--app-card-blur)',
  WebkitBackdropFilter: 'var(--app-card-blur)',
};

const glassCardStyle = {
  ...glassLayerStyle,
  backgroundColor: 'var(--app-surface-bg)',
  borderColor: 'var(--app-surface-border)',
};

const glassCardStrongStyle = {
  ...glassLayerStyle,
  backgroundColor: 'var(--app-surface-bg-strong)',
  borderColor: 'var(--app-surface-border)',
};

const glassButtonStyle = {
  ...glassLayerStyle,
  backgroundColor: 'var(--app-surface-bg)',
  borderColor: 'var(--app-surface-border)',
  color: 'var(--app-text-soft)',
};

const accentCardStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--app-accent-border)',
  background:
    'linear-gradient(to bottom right, rgba(212, 175, 55, 0.2), rgba(217, 119, 6, 0.1), transparent)',
};

const accentIconStyle = {
  ...glassLayerStyle,
  borderWidth: '1px',
  borderColor: 'var(--app-accent-border)',
  background:
    'linear-gradient(135deg, color-mix(in srgb, var(--app-accent-surface) 66%, white 34%) 0%, color-mix(in srgb, var(--point-gold) 14%, transparent) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  color: 'var(--app-accent-text-soft)',
  boxShadow: 'inset 0 1px 0 var(--app-surface-highlight), 0 8px 18px -24px var(--app-accent-glow)',
};

const accentButtonStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--app-accent-border-strong)',
  background:
    'linear-gradient(135deg, var(--app-accent-gradient-start) 0%, var(--app-accent-gradient-end) 100%)',
  color: 'var(--tarot-text-main)',
  boxShadow: '0 18px 40px -24px var(--app-accent-glow)',
};

const inputStyle = {
  ...glassLayerStyle,
  backgroundColor: 'var(--app-input-bg)',
  borderColor: 'var(--app-surface-border)',
  color: 'var(--tarot-text-main)',
};

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

const sectorLabelMap = new Map(sectorOptions.map((sector) => [sector.value, sector.label]));
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1929 }, (_, index) => String(currentYear - index));
const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
const dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'));
const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

type ProfileEditDraft = {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  birthTimeUnknown: boolean;
  gender: '' | 'M' | 'F';
  investmentRiskProfile: 'STABLE' | 'AGGRESSIVE';
  preferredSectors: string[];
};

type InquiryCategory = 'SERVICE' | 'BILLING' | 'TECHNICAL' | 'OTHER';

type FiveElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

const fiveElementLabelMap: Record<FiveElementKey, string> = {
  wood: '木 (목)',
  fire: '火 (화)',
  earth: '土 (토)',
  metal: '金 (금)',
  water: '水 (수)',
};

const fiveElementColorMap: Record<FiveElementKey, string> = {
  wood: '#5FAE7B',
  fire: '#E07A5F',
  earth: '#D4AF37',
  metal: '#A0AEC0',
  water: '#111827',
};

const inquiryTypeOptions: Array<{ label: string; value: InquiryCategory }> = [
  { label: '서비스 이용 문의', value: 'SERVICE' },
  { label: '결제 및 환불', value: 'BILLING' },
  { label: '기술적 문제', value: 'TECHNICAL' },
  { label: '기타', value: 'OTHER' },
];

export function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(() => getCurrentUser());
  const [profileDetails, setProfileDetails] = useState<UserProfileDetailsResponse | null>(null);
  const [session] = useState(() => getSession());
  const [showBirthTarot, setShowBirthTarot] = useState(false);
  const [showSaju, setShowSaju] = useState(false);
  const [showZodiac, setShowZodiac] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => resolveInitialThemePreference() === 'dark');
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryCategory, setInquiryCategory] = useState<InquiryCategory>('SERVICE');
  const [inquiryContent, setInquiryContent] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccessMessage, setInquirySuccessMessage] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileEditError, setProfileEditError] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveError, setSettingsSaveError] = useState('');
  const [profileEditDraft, setProfileEditDraft] = useState<ProfileEditDraft>({
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '',
    birthMinute: '',
    birthTimeUnknown: false,
    gender: '',
    investmentRiskProfile: 'STABLE',
    preferredSectors: [] as string[],
  });

  useEffect(() => {
    let active = true;

    if (!session) return;

    getMe()
      .then((response) => {
        if (!active) return;
        updateSessionUser(response);
        setUser(response);
      })
      .catch(() => {
        // Keep the locally cached session user when profile sync fails.
      });

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    let active = true;

    if (!session) return;

    getMyProfileDetails()
      .then((response) => {
        if (!active) return;
        setProfileDetails(response);
      })
      .catch(() => {
        // Keep the current UI fallbacks when profile details are unavailable.
      });

    return () => {
      active = false;
    };
  }, [session]);

  const investmentStyle = useMemo<'stable' | 'aggressive'>(() => {
    if (!user) return 'stable';
    return user.investmentRiskProfile === 'AGGRESSIVE' ? 'aggressive' : 'stable';
  }, [user]);

  const userData = useMemo(() => {
    if (!user) return null;

    const normalizedBirthTarot = normalizeBirthTarot(profileDetails);
    const normalizedSaju = normalizeSaju(profileDetails);
    const normalizedZodiac = normalizeZodiac(profileDetails, user.birthDate);
    const birthDate = formatBirthDate(user.birthDate);
    const birthTime = formatBirthTime(user.birthTime);
    const gender = formatGender(user.gender);
    const age = calculateAge(user.birthDate);

    return {
      name: user.name,
      email: user.email,
      birthDate,
      birthTime,
      gender,
      age,
      preferredSectors: user.preferredSectors,
      preferredSectorLabels: user.preferredSectors.map((sector) => sectorLabelMap.get(sector) ?? sector),
      birthTarot: normalizedBirthTarot,
      saju: normalizedSaju,
      zodiac: normalizedZodiac,
    };
  }, [profileDetails, user]);

  const fiveElementEntries = useMemo(() => {
    if (!userData) return [];
    return getFiveElementEntries(userData.saju.ohang);
  }, [userData]);

  useEffect(() => {
    if (typeof user?.darkModeEnabled === 'boolean' && !hasStoredThemePreference()) {
      setIsDarkMode(user.darkModeEnabled);
    }
  }, [user]);

  useEffect(() => {
    const nextTheme = isDarkMode ? 'dark' : 'light';
    applyThemePreference(nextTheme);
    persistThemePreference(nextTheme);
  }, [isDarkMode]);

  useEffect(() => {
    if (!user) return;

    const { year, month, day } = splitDateParts(user.birthDate);
    const { hour, minute } = splitTimeParts(user.birthTime);

    setProfileEditDraft({
      name: user.name ?? '',
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthHour: hour,
      birthMinute: minute,
      birthTimeUnknown: !hour && !minute,
      gender: normalizeGenderInputValue(user.gender),
      investmentRiskProfile: user.investmentRiskProfile === 'AGGRESSIVE' ? 'AGGRESSIVE' : 'STABLE',
      preferredSectors: user.preferredSectors ?? [],
    });
  }, [user]);

  const isAnyModalOpen = showBirthTarot || showSaju || showInquiry || showProfileEdit;
  const profileEditBirthDate = buildBirthDate(
    profileEditDraft.birthYear,
    profileEditDraft.birthMonth,
    profileEditDraft.birthDay,
  );
  const profileEditBirthTime = buildBirthTime(
    profileEditDraft.birthHour,
    profileEditDraft.birthMinute,
  );

  useEffect(() => {
    if (!isAnyModalOpen) return;

    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const originalBodyStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overscrollBehavior: body.style.overscrollBehavior,
    };
    const originalHtmlStyles = {
      overflow: documentElement.style.overflow,
      overscrollBehavior: documentElement.style.overscrollBehavior,
    };

    documentElement.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overscrollBehavior = 'none';

    return () => {
      documentElement.style.overflow = originalHtmlStyles.overflow;
      documentElement.style.overscrollBehavior = originalHtmlStyles.overscrollBehavior;
      body.style.overflow = originalBodyStyles.overflow;
      body.style.position = originalBodyStyles.position;
      body.style.top = originalBodyStyles.top;
      body.style.width = originalBodyStyles.width;
      body.style.overscrollBehavior = originalBodyStyles.overscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, [isAnyModalOpen]);

  const handleLogout = async () => {
    try {
      if (session?.tokens.refreshToken) {
        await logout(session.tokens.refreshToken);
      }
    } catch {
      // Ignore logout API failure and clear the local session anyway.
    } finally {
      clearSession();
      navigate('/login');
    }
  };

  const handleProfileSave = async () => {
    const trimmedName = profileEditDraft.name.trim();

    if (!trimmedName) {
      setProfileEditError('이름을 입력해주세요.');
      return;
    }

    if (!profileEditBirthDate) {
      setProfileEditError('생년월일을 올바르게 입력해주세요.');
      return;
    }

    if (!profileEditDraft.birthTimeUnknown && !profileEditBirthTime) {
      setProfileEditError('태어난 시간을 올바르게 입력해주세요.');
      return;
    }

    if (profileEditDraft.preferredSectors.length === 0) {
      setProfileEditError('선호 섹터를 하나 이상 선택해주세요.');
      return;
    }

    setProfileEditError('');
    setIsSavingProfile(true);

    try {
      const updatedUser = await updateMyProfile({
        name: trimmedName,
        birthDate: profileEditBirthDate,
        birthTime: profileEditDraft.birthTimeUnknown ? null : profileEditBirthTime,
        gender: profileEditDraft.gender || null,
        investmentRiskProfile: profileEditDraft.investmentRiskProfile,
        preferredSectors: profileEditDraft.preferredSectors,
      });

      updateSessionUser(updatedUser);
      setUser(updatedUser);
      setShowProfileEdit(false);
    } catch (error) {
      setProfileEditError(
        error instanceof Error ? error.message : '내 정보 저장 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const togglePreferredSector = (sector: string) => {
    setProfileEditDraft((prev) => ({
      ...prev,
      preferredSectors: prev.preferredSectors.includes(sector)
        ? prev.preferredSectors.filter((item) => item !== sector)
        : [...prev.preferredSectors, sector],
    }));
  };

  const handleThemeChange = async (theme: ThemePreference) => {
    if (!user || isSavingSettings) return;

    const nextValue = theme === 'dark';
    if (isDarkMode === nextValue) return;

    const previousUser = user;
    const optimisticUser = { ...user, darkModeEnabled: nextValue };

    setSettingsSaveError('');
    setIsDarkMode(nextValue);
    setUser(optimisticUser);
    updateSessionUser(optimisticUser);
    setIsSavingSettings(true);

    try {
      const updatedUser = await updateMyProfile({ darkModeEnabled: nextValue });
      updateSessionUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      setIsDarkMode(previousUser.darkModeEnabled ?? true);
      setUser(previousUser);
      updateSessionUser(previousUser);
      setSettingsSaveError(
        error instanceof Error ? error.message : '화면 모드 저장 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  const closeInquiryModal = () => {
    if (isSubmittingInquiry) return;
    setShowInquiry(false);
    setInquiryError('');
    setInquirySuccessMessage('');
    setInquiryCategory('SERVICE');
    setInquiryContent('');
  };

  const openInquiryModal = () => {
    setInquiryError('');
    setInquirySuccessMessage('');
    setInquiryCategory('SERVICE');
    setInquiryContent('');
    setShowInquiry(true);
  };

  const handleInquirySubmit = async () => {
    if (!user) return;

    const normalizedContent = inquiryContent.trim();
    if (!normalizedContent) {
      setInquiryError('문의 내용을 입력해주세요.');
      return;
    }

    setInquiryError('');
    setInquirySuccessMessage('');
    setIsSubmittingInquiry(true);

    try {
      const response = await createInquiry({
        category: inquiryCategory,
        content: normalizedContent,
      });

      setInquirySuccessMessage(
        response.message || '문의가 접수되었습니다. 답변은 가입한 이메일로 보내드립니다.',
      );
      setInquiryContent('');
      setInquiryCategory('SERVICE');
      window.setTimeout(() => {
        setShowInquiry(false);
        setInquirySuccessMessage('');
      }, 900);
    } catch (error) {
      setInquiryError(
        error instanceof Error ? error.message : '문의 접수 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen" style={pageGradientStyle}>
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 text-lg" style={{ color: 'var(--tarot-text-main)' }}>로그인 정보가 없습니다.</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-full border px-5 py-3 text-sm"
            style={accentButtonStyle}
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={pageGradientStyle}>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--tarot-ambient-blob-b)' }} />
      </div>

      <AnimatePresence>
        {showProfileEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center pt-8 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-backdrop)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-t-2 backdrop-blur-xl"
              style={{
                ...accentButtonStyle,
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--app-accent-gradient-start) 82%, var(--app-surface-bg-strong) 18%) 0%, color-mix(in srgb, var(--app-accent-gradient-end) 72%, var(--app-surface-bg-strong) 28%) 100%)',
              }}
            >
              <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--app-surface-border)' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>내 정보 수정</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>변경한 정보는 즉시 프로필에 반영됩니다.</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileEdit(false);
                    setProfileEditError('');
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ backgroundColor: 'var(--app-surface-bg)' }}
                >
                  <X className="h-4 w-4" style={{ color: 'var(--app-icon-muted)' }} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <ProfileField label="이름">
                  <input
                    value={profileEditDraft.name}
                    onChange={(event) =>
                      setProfileEditDraft((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full rounded-xl border px-4 py-3 placeholder:text-[var(--app-input-placeholder)] focus:outline-none"
                    style={inputStyle}
                    placeholder="이름"
                  />
                </ProfileField>

                <ProfileField label="이메일">
                  <input
                    value={userData.email}
                    readOnly
                    className="w-full rounded-xl border px-4 py-3 focus:outline-none"
                    style={{ ...inputStyle, color: 'var(--app-text-muted)' }}
                  />
                </ProfileField>

                <ProfileField label="생년월일">
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={profileEditDraft.birthYear}
                      onChange={(event) =>
                        setProfileEditDraft((prev) => ({
                          ...prev,
                          birthYear: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border px-4 py-3 focus:outline-none"
                      style={inputStyle}
                    >
                      <option value="">생년</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}년
                        </option>
                      ))}
                    </select>
                    <select
                      value={profileEditDraft.birthMonth}
                      onChange={(event) =>
                        setProfileEditDraft((prev) => ({
                          ...prev,
                          birthMonth: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border px-4 py-3 focus:outline-none"
                      style={inputStyle}
                    >
                      <option value="">월</option>
                      {monthOptions.map((month) => (
                        <option key={month} value={month}>
                          {month}월
                        </option>
                      ))}
                    </select>
                    <select
                      value={profileEditDraft.birthDay}
                      onChange={(event) =>
                        setProfileEditDraft((prev) => ({
                          ...prev,
                          birthDay: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border px-4 py-3 focus:outline-none"
                      style={inputStyle}
                    >
                      <option value="">일</option>
                      {dayOptions.map((day) => (
                        <option key={day} value={day}>
                          {day}일
                        </option>
                      ))}
                    </select>
                  </div>
                  {profileEditDraft.birthYear.length === 4 &&
                  profileEditDraft.birthMonth.length > 0 &&
                  profileEditDraft.birthDay.length > 0 &&
                  !profileEditBirthDate ? (
                    <p className="mt-2 text-xs" style={{ color: 'var(--app-danger-text)' }}>
                      유효한 생년월일을 입력해주세요.
                    </p>
                  ) : null}
                </ProfileField>

                <ProfileField label="태어난 시간">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={profileEditDraft.birthHour}
                      onChange={(event) =>
                        setProfileEditDraft((prev) => ({
                          ...prev,
                          birthHour: event.target.value,
                        }))
                      }
                      disabled={profileEditDraft.birthTimeUnknown}
                      className="w-full rounded-xl border px-4 py-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                      style={inputStyle}
                    >
                      <option value="">시</option>
                      {hourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}시
                        </option>
                      ))}
                    </select>
                    <select
                      value={profileEditDraft.birthMinute}
                      onChange={(event) =>
                        setProfileEditDraft((prev) => ({
                          ...prev,
                          birthMinute: event.target.value,
                        }))
                      }
                      disabled={profileEditDraft.birthTimeUnknown}
                      className="w-full rounded-xl border px-4 py-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                      style={inputStyle}
                    >
                      <option value="">분</option>
                      {minuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}분
                        </option>
                      ))}
                    </select>
                  </div>
                  {!profileEditDraft.birthTimeUnknown &&
                  (profileEditDraft.birthHour.length > 0 || profileEditDraft.birthMinute.length > 0) &&
                  !profileEditBirthTime ? (
                    <p className="mt-2 text-xs" style={{ color: 'var(--app-danger-text)' }}>
                      시간은 00-23, 분은 00-59 형식으로 입력해주세요.
                    </p>
                  ) : null}
                  <label className="mt-3 flex cursor-pointer items-center gap-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={profileEditDraft.birthTimeUnknown}
                        onChange={(event) =>
                          setProfileEditDraft((prev) => ({
                            ...prev,
                            birthTimeUnknown: event.target.checked,
                            birthHour: event.target.checked ? '' : prev.birthHour,
                            birthMinute: event.target.checked ? '' : prev.birthMinute,
                          }))
                        }
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded transition-all"
                        style={{
                          borderWidth: 'var(--app-hairline-border)',
                          borderStyle: 'solid',
                          borderColor: profileEditDraft.birthTimeUnknown ? 'var(--app-accent-border-strong)' : 'var(--card-border)',
                          background: profileEditDraft.birthTimeUnknown ? 'var(--app-accent-surface)' : 'var(--card-surface)',
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
                    <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>
                      태어난 시간을 모름
                    </span>
                  </label>
                </ProfileField>

                <ProfileField label="성별">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '남성', value: 'M' as const },
                      { label: '여성', value: 'F' as const },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setProfileEditDraft((prev) => ({ ...prev, gender: option.value }))
                        }
                        className="rounded-xl border px-4 py-4 text-sm transition-all"
                        style={
                          profileEditDraft.gender === option.value
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
                </ProfileField>

                <ProfileField label="투자 성향">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '안정형', value: 'STABLE' as const },
                      { label: '공격형', value: 'AGGRESSIVE' as const },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setProfileEditDraft((prev) => ({
                            ...prev,
                            investmentRiskProfile: option.value,
                          }))
                        }
                        className="rounded-xl border px-4 py-4 text-sm transition-all"
                        style={
                          profileEditDraft.investmentRiskProfile === option.value
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
                </ProfileField>

                <ProfileField label="선호 섹터">
                  <div className="flex flex-wrap gap-2">
                    {sectorOptions.map((sector) => {
                      const selected = profileEditDraft.preferredSectors.includes(sector.value);
                      return (
                        <button
                          key={sector.value}
                          type="button"
                          onClick={() => togglePreferredSector(sector.value)}
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
                </ProfileField>

                {profileEditError ? (
                  <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--app-danger-border)', backgroundColor: 'var(--app-danger-bg)', color: 'var(--app-danger-text)' }}>
                    {profileEditError}
                  </div>
                ) : null}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowProfileEdit(false);
                      setProfileEditError('');
                    }}
                    className="flex-1 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-white/10"
                    style={glassButtonStyle}
                  >
                    닫기
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={isSavingProfile}
                    className="flex-1 rounded-xl border py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    style={accentButtonStyle}
                  >
                    {isSavingProfile ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBirthTarot && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 overflow-y-auto"
            style={pageGradientStyle}
          >
            <div className="mx-auto min-h-full w-full max-w-md px-5 pb-[max(3.5rem,calc(env(safe-area-inset-bottom)+2.5rem))] pt-[max(1.25rem,env(safe-area-inset-top))]">
              <div
                className="sticky top-0 z-10 -mx-5 mb-6 border-b px-5 pb-4 backdrop-blur-xl"
                style={{
                  borderColor: 'var(--app-surface-border)',
                  backgroundColor: 'color-mix(in srgb, var(--bg-main) 88%, transparent)',
                }}
              >
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setShowBirthTarot(false)}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
                    style={glassButtonStyle}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    뒤로가기
                  </button>
                  <button
                    onClick={() => setShowBirthTarot(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:opacity-90"
                    style={glassButtonStyle}
                    aria-label="생일 타로 카드 닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div
                className="relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl"
                style={{
                  ...glassCardStrongStyle,
                  borderColor: 'var(--app-accent-border-strong)',
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--tarot-card-bg-strong) 90%, transparent) 0%, color-mix(in srgb, var(--glow-purple) 42%, var(--tarot-card-bg) 58%) 55%, color-mix(in srgb, var(--tarot-card-bg-strong) 92%, transparent) 100%)',
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-[2rem]"
                  animate={{
                    boxShadow: [
                      '0 0 40px var(--app-accent-glow), inset 0 0 28px var(--tarot-accent-glow-soft)',
                      '0 0 60px var(--app-accent-glow), inset 0 0 40px var(--tarot-accent-glow)',
                      '0 0 40px var(--app-accent-glow), inset 0 0 28px var(--tarot-accent-glow-soft)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />

                <div className="relative mb-6 text-center">
                  <div className="text-sm" style={{ color: 'var(--app-accent-text-soft)' }}>생일 타로 카드</div>
                  <h2 className="mt-2 text-3xl font-bold" style={{ color: 'var(--tarot-text-main)' }}>{userData.birthTarot.koreanName}</h2>
                  <p className="mt-1 text-lg" style={{ color: 'var(--app-text-muted)' }}>{userData.birthTarot.name}</p>
                </div>

                <div className="relative mb-6 aspect-[2/3] overflow-hidden rounded-[1.75rem] border-2" style={{ borderColor: 'var(--app-accent-border)' }}>
                  <img
                    src={userData.birthTarot.imageUrl}
                    alt={userData.birthTarot.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                </div>

                <div className="relative space-y-4">
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
                    style={{ ...accentIconStyle, backgroundColor: 'var(--app-accent-soft)' }}
                  >
                    <Sparkles className="h-4 w-4" />
                    {userData.birthTarot.number}번 카드
                  </div>
                  <section className="rounded-2xl border px-4 py-4" style={glassCardStyle}>
                    <div className="mb-2 text-xs font-medium tracking-[0.18em]" style={{ color: 'var(--app-accent-text-soft)' }}>MEANING</div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text-soft)' }}>{userData.birthTarot.meaning}</p>
                  </section>
                  {userData.birthTarot.description ? (
                    <section className="rounded-2xl border px-4 py-4" style={glassCardStyle}>
                      <div className="mb-2 text-xs font-medium tracking-[0.18em]" style={{ color: 'var(--app-accent-text-soft)' }}>
                        DESCRIPTION
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
                        {userData.birthTarot.description}
                      </p>
                    </section>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaju && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center pt-8 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-backdrop)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-t-2 backdrop-blur-xl"
              style={accentButtonStyle}
            >
              <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--app-surface-border)' }}>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>내 사주 정보</h3>
                <button
                  onClick={() => setShowSaju(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ backgroundColor: 'var(--app-surface-bg)' }}
                >
                  <X className="h-4 w-4" style={{ color: 'var(--app-icon-muted)' }} />
                </button>
              </div>

              <div className="max-h-[82vh] space-y-6 overflow-y-auto px-6 py-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--tarot-point-color)' }}>
                    <Sparkles className="h-4 w-4" />
                    사주팔자
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {userData.saju.palza.map((char, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border p-3 text-center backdrop-blur-xl"
                        style={glassCardStyle}
                      >
                        <div className="text-2xl font-bold" style={{ color: 'var(--tarot-text-main)' }}>{char}</div>
                        <div className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>{['년주', '월주', '일주', '시주'][idx]}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium" style={{ color: 'var(--tarot-point-color)' }}>오행 분포</h4>
                  <div className="rounded-2xl border p-4" style={glassCardStyle}>
                    <div className="space-y-3">
                      {fiveElementEntries.map(({ key, label, value, color }) => (
                        <div key={key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs font-medium" style={{ color: 'var(--app-text-muted)' }}>
                              {label}
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--app-surface-bg-strong)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              transition={{ duration: 0.9, delay: 0.15 }}
                              className="h-full rounded-full"
                              style={{
                                background: `linear-gradient(90deg, ${color} 0%, color-mix(in srgb, ${color} 65%, white 35%) 100%)`,
                              }}
                            />
                          </div>
                          <span className="min-w-[2.5rem] text-right text-xs font-semibold" style={{ color }}>
                            {formatPercentage(value)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {userData.saju.sections.map((section) => (
                  <div
                    key={section.key}
                    className="rounded-2xl border p-4 backdrop-blur-xl"
                    style={glassCardStyle}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h4 className={`text-sm font-medium ${section.titleClassName}`}>{section.label}</h4>
                      <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{section.title}</span>
                    </div>
                    <p className="text-sm leading-6" style={{ color: 'var(--app-text-soft)' }}>{section.summary}</p>
                  </div>
                ))}

                <p className="rounded-xl border px-4 py-3 text-xs leading-5" style={{ ...glassCardStyle, color: 'var(--app-text-muted)' }}>
                  사주 해석 문구는 데이터 기준으로 수시로 달라질 수 있습니다.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showZodiac && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center pt-8 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-backdrop)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-t-2 backdrop-blur-xl"
              style={accentButtonStyle}
            >
              <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--app-surface-border)' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>내 별자리</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>생년월일 기준으로 보여주는 별자리 정보</p>
                </div>
                <button
                  onClick={() => setShowZodiac(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ backgroundColor: 'var(--app-surface-bg)' }}
                  aria-label="별자리 닫기"
                >
                  <X className="h-4 w-4" style={{ color: 'var(--app-icon-muted)' }} />
                </button>
              </div>

              <div className="max-h-[82vh] space-y-5 overflow-y-auto px-6 py-6">
                <div
                  className="relative overflow-hidden rounded-[2rem] border p-5"
                  style={{
                    ...glassCardStrongStyle,
                    borderColor: 'var(--app-accent-border-strong)',
                    background:
                      'linear-gradient(135deg, color-mix(in srgb, var(--tarot-card-bg-strong) 88%, transparent) 0%, color-mix(in srgb, var(--app-accent-gradient-end) 28%, var(--tarot-card-bg) 72%) 100%)',
                  }}
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs tracking-[0.18em]" style={{ color: 'var(--app-accent-text-soft)' }}>ZODIAC SIGN</div>
                      <h2 className="mt-2 text-3xl font-bold" style={{ color: 'var(--tarot-text-main)' }}>{userData.zodiac.sign}</h2>
                      <p className="mt-1 text-sm" style={{ color: 'var(--app-text-muted)' }}>{userData.zodiac.dateRange}</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border" style={accentIconStyle}>
                      <Star className="h-7 w-7" strokeWidth={2.2} />
                    </div>
                  </div>

                  <div className="relative mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border px-4 py-3" style={glassCardStyle}>
                      <div className="text-xs" style={{ color: 'var(--app-text-muted)' }}>원소</div>
                      <div className="mt-1 text-sm font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{userData.zodiac.element}</div>
                    </div>
                    <div className="rounded-2xl border px-4 py-3" style={glassCardStyle}>
                      <div className="text-xs" style={{ color: 'var(--app-text-muted)' }}>키워드</div>
                      <div className="mt-1 text-sm font-semibold" style={{ color: 'var(--tarot-text-main)' }}>{userData.zodiac.keyword}</div>
                    </div>
                  </div>
                </div>

                <section className="rounded-2xl border px-4 py-4" style={glassCardStyle}>
                  <div className="mb-2 text-xs font-medium tracking-[0.18em]" style={{ color: 'var(--app-accent-text-soft)' }}>SUMMARY</div>
                  <p className="text-sm leading-6" style={{ color: 'var(--app-text-soft)' }}>{userData.zodiac.summary}</p>
                </section>

                <div className="grid grid-cols-3 gap-3">
                  {userData.zodiac.traits.map((trait) => (
                    <div key={trait} className="rounded-2xl border px-3 py-4 text-center" style={glassCardStyle}>
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border" style={accentIconStyle}>
                        <Star className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <p className="mt-3 text-xs font-medium" style={{ color: 'var(--tarot-text-main)' }}>{trait}</p>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-backdrop)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border backdrop-blur-xl"
              style={glassCardStrongStyle}
            >
              <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--app-surface-border)' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>문의하기</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>
                    문의를 남기시면 확인 후 가입하신 이메일로 답변드립니다.
                  </p>
                </div>
                <button
                  onClick={closeInquiryModal}
                  disabled={isSubmittingInquiry}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ backgroundColor: 'var(--app-surface-bg)' }}
                >
                  <X className="h-4 w-4" style={{ color: 'var(--app-icon-muted)' }} />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text-muted)' }}>문의 유형</label>
                  <select
                    value={inquiryCategory}
                    onChange={(event) => setInquiryCategory(event.target.value as InquiryCategory)}
                    disabled={isSubmittingInquiry}
                    className="w-full rounded-xl border px-4 py-3 backdrop-blur-xl transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    style={inputStyle}
                  >
                    {inquiryTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text-muted)' }}>문의 내용</label>
                  <textarea
                    rows={5}
                    value={inquiryContent}
                    onChange={(event) => setInquiryContent(event.target.value)}
                    placeholder="문의하실 내용을 입력해주세요"
                    disabled={isSubmittingInquiry}
                    maxLength={1000}
                    className="w-full resize-none rounded-xl border px-4 py-3 placeholder:text-[var(--app-input-placeholder)] backdrop-blur-xl transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    style={inputStyle}
                  />
                  <div className="mt-2 text-right text-xs" style={{ color: 'var(--app-text-subtle)' }}>
                    {inquiryContent.length} / 1000
                  </div>
                </div>

                {inquiryError ? (
                  <div
                    className="rounded-xl border px-3 py-2 text-xs"
                    style={{
                      borderColor: 'var(--app-danger-border)',
                      backgroundColor: 'var(--app-danger-bg)',
                      color: 'var(--app-danger-text)',
                    }}
                  >
                    {inquiryError}
                  </div>
                ) : null}

                {inquirySuccessMessage ? (
                  <div
                    className="rounded-xl border px-3 py-2 text-xs"
                    style={{
                      borderColor: 'var(--app-accent-border)',
                      backgroundColor: 'var(--app-accent-surface)',
                      color: 'var(--tarot-text-main)',
                    }}
                  >
                    {inquirySuccessMessage}
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <button
                    onClick={closeInquiryModal}
                    disabled={isSubmittingInquiry}
                    className="flex-1 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    style={glassButtonStyle}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleInquirySubmit}
                    disabled={isSubmittingInquiry || inquiryContent.trim().length === 0}
                    className="flex-1 rounded-xl border py-3 text-sm font-semibold backdrop-blur-xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    style={accentButtonStyle}
                  >
                    {isSubmittingInquiry ? '전송 중...' : '전송'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-md px-5 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--tarot-text-main)' }}>마이</h1>
          <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>내 정보 및 설정</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-3xl border backdrop-blur-xl"
          style={glassCardStyle}
        >
          <div className="relative overflow-hidden p-6" style={accentCardStyle}>
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
            <div className="relative flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 backdrop-blur-xl" style={accentIconStyle}>
                <User className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="mb-1 text-xl font-bold" style={{ color: 'var(--tarot-text-main)' }}>{userData.name}</h2>
                <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>{userData.email}</p>
              </div>
              <button
                onClick={() => setShowProfileEdit(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                style={glassButtonStyle}
                aria-label="내 정보 수정"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-white/5 p-4">
            <div className="flex items-center gap-3 py-3">
              <Mail className="h-5 w-5" style={{ color: 'var(--app-icon-soft)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--app-text-muted)' }}>이메일</span>
              <span className="text-sm font-medium" style={{ color: 'var(--tarot-text-main)' }}>{userData.email}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Calendar className="h-5 w-5" style={{ color: 'var(--app-icon-soft)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--app-text-muted)' }}>생년월일</span>
              <span className="text-sm font-medium" style={{ color: 'var(--tarot-text-main)' }}>{userData.birthDate}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Clock className="h-5 w-5" style={{ color: 'var(--app-icon-soft)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--app-text-muted)' }}>태어난 시간</span>
              <span className="text-sm font-medium" style={{ color: 'var(--tarot-text-main)' }}>{userData.birthTime}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Cake className="h-5 w-5" style={{ color: 'var(--app-icon-soft)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--app-text-muted)' }}>성별 / 나이</span>
              <span className="text-sm font-medium" style={{ color: 'var(--tarot-text-main)' }}>
                {userData.gender} {userData.age}
              </span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <TrendingUp className="h-5 w-5" style={{ color: 'var(--app-icon-soft)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--app-text-muted)' }}>투자 성향</span>
              <span className="text-sm font-medium" style={{ color: 'var(--tarot-text-main)' }}>
                {investmentStyle === 'aggressive' ? '공격형' : '안정형'}
              </span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Shield className="h-5 w-5" style={{ color: 'var(--app-icon-soft)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--app-text-muted)' }}>선호 섹터</span>
              <span className="max-w-[180px] text-right text-sm font-medium" style={{ color: 'var(--tarot-text-main)' }}>
                {userData.preferredSectorLabels.join(', ') || '-'}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => setShowBirthTarot(true)}
              className="group relative overflow-hidden rounded-2xl border p-4 text-center backdrop-blur-xl transition-all hover:shadow-lg"
              style={accentCardStyle}
            >
              <div className="absolute right-0 top-0 h-16 w-16 rounded-full blur-2xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
              <div className="relative flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={accentIconStyle}>
                  <Sparkles className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--tarot-text-main)' }}>타로</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>{userData.birthTarot.koreanName}</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowSaju(true)}
              className="group relative overflow-hidden rounded-2xl border p-4 text-center backdrop-blur-xl transition-all hover:shadow-lg"
              style={accentCardStyle}
            >
              <div className="absolute right-0 top-0 h-16 w-16 rounded-full blur-2xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
              <div className="relative flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={accentIconStyle}>
                  <Sun className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--tarot-text-main)' }}>사주</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>사주팔자</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => setShowZodiac(true)}
              className="group relative overflow-hidden rounded-2xl border p-4 text-center backdrop-blur-xl transition-all hover:shadow-lg"
              style={accentCardStyle}
            >
              <div className="absolute right-0 top-0 h-16 w-16 rounded-full blur-2xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
              <div className="relative flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={accentIconStyle}>
                  <Star className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--tarot-text-main)' }}>별자리</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--app-text-muted)' }}>{userData.zodiac.sign}</p>
                </div>
              </div>
            </motion.button>
          </div>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 overflow-hidden rounded-3xl border backdrop-blur-xl"
          style={glassCardStyle}
        >
          <div className="space-y-0 divide-y divide-white/5 p-4">
            <ThemeModeSetting
              currentTheme={isDarkMode ? 'dark' : 'light'}
              onChange={handleThemeChange}
              disabled={isSavingSettings}
            />

            {settingsSaveError ? (
              <div
                className="mx-4 rounded-xl border px-3 py-2 text-xs"
                style={{
                  borderColor: 'var(--app-danger-border)',
                  backgroundColor: 'var(--app-danger-bg)',
                  color: 'var(--app-danger-text)',
                }}
              >
                {settingsSaveError}
              </div>
            ) : null}

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 space-y-2"
        >
          <button
            onClick={openInquiryModal}
            className="group flex w-full items-center justify-between rounded-2xl border p-4 backdrop-blur-xl transition-all hover:bg-white/10"
            style={glassCardStyle}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5" style={{ color: 'var(--app-icon-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>문의하기</span>
            </div>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--app-icon-soft)' }} />
          </button>

          <button className="group flex w-full items-center justify-between rounded-2xl border p-4 backdrop-blur-xl transition-all hover:bg-white/10" style={glassCardStyle}>
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5" style={{ color: 'var(--app-icon-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>앱 정보</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--app-text-subtle)' }}>v1.0.0</span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--app-icon-soft)' }} />
            </div>
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleLogout}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border p-4 backdrop-blur-xl transition-all hover:bg-red-500/20"
          style={{ borderColor: 'var(--app-danger-border)', backgroundColor: 'var(--app-danger-bg)' }}
        >
          <LogOut className="h-5 w-5" style={{ color: 'var(--app-danger-text)' }} />
          <span className="font-medium" style={{ color: 'var(--app-danger-text)' }}>로그아웃</span>
        </motion.button>

        <div className="mb-4 space-y-2 text-center text-xs" style={{ color: 'var(--app-text-subtle)' }}>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/terms')} className="transition-colors hover:opacity-80">
              이용약관
            </button>
            <span>·</span>
            <button onClick={() => navigate('/privacy')} className="transition-colors hover:opacity-80">
              개인정보처리방침
            </button>
          </div>
          <p>© 2024 Voda. All rights reserved.</p>
        </div>
      </div>

      <BottomNavigation activeTab="my" />
    </div>
  );
}

function SettingToggle({
  icon: Icon,
  label,
  enabled,
  onToggle,
  disabled = false,
}: {
  icon: typeof User;
  label: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" style={{ color: 'var(--app-icon-muted)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>{label}</span>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className="fi-toggle-track relative h-7 w-12 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        data-enabled={enabled}
        style={{
          backgroundColor: enabled ? 'var(--tarot-point-color)' : undefined,
        }}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg"
        />
      </button>
    </div>
  );
}

function ThemeModeSetting({
  currentTheme,
  onChange,
  disabled = false,
}: {
  currentTheme: ThemePreference;
  onChange: (theme: ThemePreference) => void;
  disabled?: boolean;
}) {
  const CurrentThemeIcon = currentTheme === 'dark' ? Moon : Sun;
  const options: Array<{
    value: ThemePreference;
    label: string;
    icon: typeof Sun;
  }> = [
    { value: 'light', label: '라이트', icon: Sun },
    { value: 'dark', label: '다크', icon: Moon },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <CurrentThemeIcon className="h-5 w-5" style={{ color: 'var(--app-icon-muted)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>화면 모드</span>
      </div>
      <div
        className="grid grid-cols-2 gap-2 rounded-2xl border p-1.5"
        style={{
          ...glassCardStrongStyle,
          borderColor: 'var(--app-surface-divider)',
        }}
      >
        {options.map(({ value, label, icon: Icon }) => {
          const isSelected = value === currentTheme;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              disabled={disabled}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
              style={
                isSelected
                  ? {
                      background:
                        'linear-gradient(135deg, var(--app-accent-gradient-start) 0%, var(--app-accent-gradient-end) 100%)',
                      border: 'var(--app-hairline-border) solid var(--app-accent-border-strong)',
                      color: 'var(--tarot-text-main)',
                      boxShadow: '0 14px 28px -20px var(--app-accent-glow)',
                    }
                  : {
                      backgroundColor: 'transparent',
                      border: 'var(--app-hairline-border) solid transparent',
                      color: 'var(--app-text-muted)',
                    }
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProfileField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium" style={{ color: 'var(--app-text-muted)' }}>{label}</div>
      {children}
    </label>
  );
}

function formatBirthDate(value?: string | null) {
  if (!value) return '미등록';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatBirthTime(
  value?: { hour: number; minute: number; second?: number } | string | null,
) {
  if (!value) return '미등록';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '미등록';

    const match = trimmed.match(/^(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : trimmed;
  }

  const hour = String(value.hour).padStart(2, '0');
  const minute = String(value.minute).padStart(2, '0');
  return `${hour}:${minute}`;
}

function normalizeGenderInputValue(value?: string | null) {
  if (!value) return '';
  if (value === 'M' || value === 'MALE') return 'M';
  if (value === 'F' || value === 'FEMALE') return 'F';
  return '';
}

function splitDateParts(value?: string | null) {
  if (!value) return { year: '', month: '', day: '' };

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-');
    return { year, month, day };
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return { year: '', month: '', day: '' };

  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
  };
}

function splitTimeParts(
  value?: { hour?: number; minute?: number; second?: number } | string | null,
) {
  if (!value) return { hour: '', minute: '' };

  if (typeof value !== 'string') {
    const hour =
      typeof value.hour === 'number' ? String(value.hour).padStart(2, '0') : '';
    const minute =
      typeof value.minute === 'number' ? String(value.minute).padStart(2, '0') : '';
    return { hour, minute };
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{2}):(\d{2})/);
  if (!match) return { hour: '', minute: '' };

  return { hour: match[1], minute: match[2] };
}

function buildBirthDate(year: string, month: string, day: string) {
  if (year.length !== 4 || month.length === 0 || day.length === 0) return '';

  const normalizedMonth = month.padStart(2, '0');
  const normalizedDay = day.padStart(2, '0');
  const formatted = `${year}-${normalizedMonth}-${normalizedDay}`;
  const date = new Date(`${formatted}T00:00:00`);

  if (Number.isNaN(date.getTime())) return '';
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() + 1 !== Number(normalizedMonth) ||
    date.getDate() !== Number(normalizedDay)
  ) {
    return '';
  }

  return formatted;
}

function buildBirthTime(hour: string, minute: string) {
  if (hour.length === 0 && minute.length === 0) return '';
  if (hour.length === 0 || minute.length === 0) return '';

  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);

  if (
    Number.isNaN(hourNumber) ||
    Number.isNaN(minuteNumber) ||
    hourNumber < 0 ||
    hourNumber > 23 ||
    minuteNumber < 0 ||
    minuteNumber > 59
  ) {
    return '';
  }

  return `${String(hourNumber).padStart(2, '0')}:${String(minuteNumber).padStart(2, '0')}`;
}

function formatGender(gender?: string | null) {
  if (!gender) return '미등록';
  if (gender === 'M' || gender === 'MALE') return '남성';
  if (gender === 'F' || gender === 'FEMALE') return '여성';
  if (gender === 'OTHER') return '기타';
  if (gender === 'UNKNOWN') return '미등록';
  return gender;
}

function calculateAge(birthDate?: string | null) {
  if (!birthDate) return '-';

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return '-';

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? `${age}세` : '-';
}

function normalizeBirthTarot(profileDetails: UserProfileDetailsResponse | null) {
  const birthTarot = profileDetails?.birthTarot;

  return {
    name: birthTarot?.name ?? 'The Star',
    koreanName: birthTarot?.koreanName ?? '별',
    number: birthTarot?.number ?? 17,
    meaning: birthTarot?.cardMeaning ?? '희망, 영감, 밝은 미래',
    description: birthTarot?.cardDescription?.trim() || null,
    imageUrl:
      resolveApiAssetUrl(birthTarot?.imageUrl) ??
      'https://images.unsplash.com/photo-1683217956228-d3d24916df55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXJvdCUyMGNhcmQlMjBteXN0aWNhbHxlbnwxfHx8fDE3NzM3NDg5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  };
}

function normalizeZodiac(profileDetails: UserProfileDetailsResponse | null, birthDate?: string | null) {
  const fallback = {
    sign: '염소자리',
    englishName: 'Capricorn',
    dateRange: '12월 22일 - 1월 19일',
    element: '흙',
    keyword: '현실감각',
    summary: '차분하게 방향을 잡고 꾸준히 쌓아가는 성향이 강합니다. 투자나 선택에서도 속도보다 구조와 안정성을 중시하는 편입니다.',
    traits: ['신중함', '꾸준함', '집중력'],
  };

  const zodiac = profileDetails?.zodiac;
  if (zodiac?.sign) {
    return {
      sign: zodiac.sign,
      englishName: zodiac.englishName ?? fallback.englishName,
      dateRange: zodiac.dateRange ?? fallback.dateRange,
      element: zodiac.element ?? fallback.element,
      keyword: zodiac.keyword ?? fallback.keyword,
      summary: zodiac.summary ?? fallback.summary,
      traits: zodiac.traits?.length ? zodiac.traits : fallback.traits,
    };
  }

  if (!birthDate) return fallback;

  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return fallback;

  const month = parsed.getMonth() + 1;
  const day = parsed.getDate();
  const value = month * 100 + day;

  const zodiacSigns = [
    {
      start: 120,
      end: 218,
      sign: '물병자리',
      englishName: 'Aquarius',
      dateRange: '1월 20일 - 2월 18일',
      element: '바람',
      keyword: '독창성',
      summary: '새로운 시각과 독립적인 판단이 강점입니다. 익숙한 방식보다 가능성을 먼저 읽고 움직이는 성향이 있습니다.',
      traits: ['독립성', '직관', '실험정신'],
    },
    {
      start: 219,
      end: 320,
      sign: '물고기자리',
      englishName: 'Pisces',
      dateRange: '2월 19일 - 3월 20일',
      element: '물',
      keyword: '감수성',
      summary: '흐름을 민감하게 읽고 분위기를 포착하는 힘이 좋습니다. 숫자만이 아니라 감각적인 판단도 함께 작동합니다.',
      traits: ['공감력', '유연함', '상상력'],
    },
    {
      start: 321,
      end: 419,
      sign: '양자리',
      englishName: 'Aries',
      dateRange: '3월 21일 - 4월 19일',
      element: '불',
      keyword: '추진력',
      summary: '결단이 빠르고 먼저 움직이는 타입입니다. 기회를 포착했을 때 과감하게 밀어붙이는 에너지가 강합니다.',
      traits: ['도전성', '속도감', '리더십'],
    },
    {
      start: 420,
      end: 520,
      sign: '황소자리',
      englishName: 'Taurus',
      dateRange: '4월 20일 - 5월 20일',
      element: '흙',
      keyword: '안정성',
      summary: '현실적인 감각과 끈기가 강점입니다. 한 번 정한 기준을 쉽게 흔들지 않고 묵직하게 유지하는 편입니다.',
      traits: ['안정감', '인내심', '실리성'],
    },
    {
      start: 521,
      end: 620,
      sign: '쌍둥이자리',
      englishName: 'Gemini',
      dateRange: '5월 21일 - 6월 20일',
      element: '바람',
      keyword: '민첩성',
      summary: '정보를 빠르게 받아들이고 연결하는 재능이 있습니다. 변화가 많은 상황에서도 유연하게 대응합니다.',
      traits: ['적응력', '호기심', '소통력'],
    },
    {
      start: 621,
      end: 722,
      sign: '게자리',
      englishName: 'Cancer',
      dateRange: '6월 21일 - 7월 22일',
      element: '물',
      keyword: '보호본능',
      summary: '지키고 싶은 기준이 분명하고 안정적인 기반을 중요하게 생각합니다. 장기적 관점에서 선택하는 편입니다.',
      traits: ['안정지향', '배려', '지속성'],
    },
    {
      start: 723,
      end: 822,
      sign: '사자자리',
      englishName: 'Leo',
      dateRange: '7월 23일 - 8월 22일',
      element: '불',
      keyword: '자신감',
      summary: '확신이 생기면 강하게 밀고 나가는 성향입니다. 존재감과 추진력이 함께 드러나는 타입입니다.',
      traits: ['자신감', '표현력', '결단력'],
    },
    {
      start: 823,
      end: 922,
      sign: '처녀자리',
      englishName: 'Virgo',
      dateRange: '8월 23일 - 9월 22일',
      element: '흙',
      keyword: '정교함',
      summary: '작은 차이와 디테일을 잘 읽어내는 편입니다. 기준을 세우고 정리해 나가는 방식에서 강점이 보입니다.',
      traits: ['분석력', '정확성', '성실함'],
    },
    {
      start: 923,
      end: 1022,
      sign: '천칭자리',
      englishName: 'Libra',
      dateRange: '9월 23일 - 10월 22일',
      element: '바람',
      keyword: '균형감',
      summary: '여러 조건을 비교하며 균형점을 찾는 능력이 좋습니다. 감정과 논리를 조화롭게 맞추려는 경향이 있습니다.',
      traits: ['균형감', '조율력', '세련됨'],
    },
    {
      start: 1023,
      end: 1121,
      sign: '전갈자리',
      englishName: 'Scorpio',
      dateRange: '10월 23일 - 11월 21일',
      element: '물',
      keyword: '집중력',
      summary: '관심이 생긴 대상에 깊이 파고드는 성향입니다. 표면보다 본질을 읽으려는 힘이 강합니다.',
      traits: ['통찰력', '집중력', '몰입감'],
    },
    {
      start: 1122,
      end: 1221,
      sign: '사수자리',
      englishName: 'Sagittarius',
      dateRange: '11월 22일 - 12월 21일',
      element: '불',
      keyword: '확장성',
      summary: '크게 보고 넓게 움직이는 기질이 있습니다. 새로운 가능성과 방향을 탐색하는 데 거침이 적습니다.',
      traits: ['낙관성', '확장성', '자유로움'],
    },
  ];

  if (value >= 1222 || value <= 119) {
    return fallback;
  }

  return zodiacSigns.find((item) => value >= item.start && value <= item.end) ?? fallback;
}

function normalizeSaju(profileDetails: UserProfileDetailsResponse | null) {
  const saju = profileDetails?.saju;
  const palza = saju?.palza ?? ['乙未', '己卯', '壬午', '辛亥'];
  const descriptionSections = [
    {
      key: 'ilju',
      label: '일주',
      data: normalizeSajuDescription(saju?.ilju, '일주 정보', '일주 해석 정보가 없습니다.'),
      className: 'border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 to-teal-500/5',
      titleClassName: 'text-[#D4AF37]',
    },
    {
      key: 'wolji',
      label: '월지',
      data: normalizeSajuDescription(saju?.wolji, '월지 정보', '월지 해석 정보가 없습니다.'),
      className: 'border-sky-400/25 bg-gradient-to-br from-sky-500/10 to-cyan-500/5',
      titleClassName: 'text-[#D4AF37]',
    },
    {
      key: 'daeun',
      label: '현재 대운',
      data: normalizeSajuDescription(saju?.daeun, '대운 정보', '대운 정보가 없습니다.'),
      className: 'border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-amber-500/5',
      titleClassName: 'text-[#D4AF37]',
    },
    {
      key: 'sewun',
      label: '올해의 운세',
      data: normalizeSajuDescription(saju?.sewun, '세운 정보', '올해의 운세 정보가 없습니다.'),
      className: 'border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5',
      titleClassName: 'text-[#D4AF37]',
    },
  ];

  return {
    palza,
    ohang: normalizeFiveElementDistribution({
      wood: saju?.ohang?.wood ?? 40,
      fire: saju?.ohang?.fire ?? 25,
      earth: saju?.ohang?.earth ?? 15,
      metal: saju?.ohang?.metal ?? 10,
      water: saju?.ohang?.water ?? 10,
    }),
    sections: descriptionSections.map((section) => ({
      ...section,
      title: section.data.name,
      summary: section.data.summary,
    })),
  };
}

function normalizeSajuDescription(
  value: SajuDescriptionResponse | string | null | undefined,
  fallbackName: string,
  fallbackSummary: string,
) {
  if (typeof value === 'string') {
    return { name: fallbackName, summary: value };
  }

  return {
    name: value?.name?.trim() || fallbackName,
    summary: value?.summary?.trim() || fallbackSummary,
  };
}

function normalizeFiveElementDistribution(values: Record<FiveElementKey, number>) {
  const total = Object.values(values).reduce((sum, value) => sum + Math.max(value, 0), 0);

  if (total <= 0) {
    return {
      wood: 20,
      fire: 20,
      earth: 20,
      metal: 20,
      water: 20,
    };
  }

  return Object.fromEntries(
    Object.entries(values).map(([element, value]) => [
      element,
      (Math.max(value, 0) / total) * 100,
    ]),
  ) as Record<FiveElementKey, number>;
}

function getFiveElementEntries(values: Record<FiveElementKey, number>) {
  const order: FiveElementKey[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  return order.map((key) => ({
    key,
    label: fiveElementLabelMap[key],
    value: values[key],
    color: fiveElementColorMap[key],
  }));
}

function formatPercentage(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
