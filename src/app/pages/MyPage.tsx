import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Cake,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  MessageSquare,
  TrendingUp,
  Shield,
  LogOut,
  Info,
  Bell,
  X,
  Heart,
  Pencil,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import {
  getMe,
  getMyProfileDetails,
  getTarotDeckVersions,
  logout,
  resolveApiAssetUrl,
  updateMyProfile,
  type SajuDescriptionResponse,
  type UserProfileDetailsResponse,
} from '@/lib/api';
import { clearSession, getCurrentUser, getSession, updateSessionUser, type SessionUser } from '@/lib/session';
import {
  getCachedTarotDeckVersions,
  getSelectedTarotDeckId,
  saveTarotDeckVersions,
  setSelectedTarotDeckId,
} from '@/lib/tarot';
import {
  applyThemePreference,
  hasStoredThemePreference,
  persistThemePreference,
  resolveInitialThemePreference,
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
    'linear-gradient(135deg, var(--app-accent-soft) 0%, transparent 78%)',
};

const accentIconStyle = {
  ...glassLayerStyle,
  borderColor: 'var(--app-accent-border)',
  backgroundColor: 'var(--app-accent-surface)',
  color: 'var(--tarot-point-color)',
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

export function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(() => getCurrentUser());
  const [profileDetails, setProfileDetails] = useState<UserProfileDetailsResponse | null>(null);
  const [session] = useState(() => getSession());
  const [showBirthTarot, setShowBirthTarot] = useState(false);
  const [showSaju, setShowSaju] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => resolveInitialThemePreference() === 'dark');
  const [showInquiry, setShowInquiry] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [virtualInvestmentEnabled, setVirtualInvestmentEnabled] = useState(false);
  const [selectedTarotDeckId, setSelectedTarotDeck] = useState(() => getSelectedTarotDeckId());
  const [tarotDeckVersions, setTarotDeckVersions] = useState(() => getCachedTarotDeckVersions());
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileEditError, setProfileEditError] = useState('');
  const [isSavingTarotDeck, setIsSavingTarotDeck] = useState(false);
  const [tarotDeckSaveError, setTarotDeckSaveError] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveError, setSettingsSaveError] = useState('');
  const [profileEditDraft, setProfileEditDraft] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '',
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
  }, [session, user?.preferredTarotDeckId, user?.birthDate, user?.birthTime, user?.gender]);

  useEffect(() => {
    let active = true;

    getTarotDeckVersions()
      .then((response) => {
        if (!active || response.length === 0) return;

        const decks = response.map((deck) => ({
          id: deck.id,
          name: deck.name,
          description: deck.description ?? '',
          coverImageUrl: deck.coverImageUrl ?? null,
        }));

        saveTarotDeckVersions(decks);
        setTarotDeckVersions(decks);
      })
      .catch(() => {
        // Keep cached deck versions if the API request fails.
      });

    return () => {
      active = false;
    };
  }, []);

  const investmentStyle = useMemo<'stable' | 'aggressive'>(() => {
    if (!user) return 'stable';
    return user.investmentRiskProfile === 'AGGRESSIVE' ? 'aggressive' : 'stable';
  }, [user]);

  const userData = useMemo(() => {
    if (!user) return null;

    const normalizedBirthTarot = normalizeBirthTarot(profileDetails);
    const normalizedSaju = normalizeSaju(profileDetails);
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
      tokenExpiresAt: session ? new Date(session.tokens.accessTokenExpiresAt).toLocaleString() : '-',
      birthTarot: normalizedBirthTarot,
      saju: normalizedSaju,
    };
  }, [profileDetails, session, user]);

  useEffect(() => {
    if (typeof user?.notificationEnabled === 'boolean') {
      setNotificationEnabled(user.notificationEnabled);
    }
    if (typeof user?.darkModeEnabled === 'boolean' && !hasStoredThemePreference()) {
      setIsDarkMode(user.darkModeEnabled);
    }
    if (typeof user?.virtualInvestmentEnabled === 'boolean') {
      setVirtualInvestmentEnabled(user.virtualInvestmentEnabled);
    }
  }, [user]);

  useEffect(() => {
    const nextTheme = isDarkMode ? 'dark' : 'light';
    applyThemePreference(nextTheme);
    persistThemePreference(nextTheme);
  }, [isDarkMode]);

  useEffect(() => {
    if (!user?.preferredTarotDeckId) return;

    setSelectedTarotDeck(user.preferredTarotDeckId);
    setSelectedTarotDeckId(user.preferredTarotDeckId);
  }, [user?.preferredTarotDeckId]);

  useEffect(() => {
    if (!user) return;

    setProfileEditDraft({
      name: user.name ?? '',
      birthDate: normalizeDateInputValue(user.birthDate),
      birthTime: normalizeTimeInputValue(user.birthTime),
      gender: normalizeGenderInputValue(user.gender),
      preferredSectors: user.preferredSectors ?? [],
    });
  }, [user]);

  const isAnyModalOpen = showBirthTarot || showSaju || showInquiry || showProfileEdit;

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

    if (profileEditDraft.preferredSectors.length === 0) {
      setProfileEditError('선호 섹터를 하나 이상 선택해주세요.');
      return;
    }

    setProfileEditError('');
    setIsSavingProfile(true);

    try {
      const updatedUser = await updateMyProfile({
        name: trimmedName,
        birthDate: profileEditDraft.birthDate || null,
        birthTime: profileEditDraft.birthTime || null,
        gender: profileEditDraft.gender || null,
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

  const handleNotificationToggle = async () => {
    if (!user || isSavingSettings) return;

    const nextValue = !notificationEnabled;
    const previousUser = user;
    const optimisticUser = { ...user, notificationEnabled: nextValue };

    setSettingsSaveError('');
    setNotificationEnabled(nextValue);
    setUser(optimisticUser);
    updateSessionUser(optimisticUser);
    setIsSavingSettings(true);

    try {
      const updatedUser = await updateMyProfile({ notificationEnabled: nextValue });
      updateSessionUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      setNotificationEnabled(previousUser.notificationEnabled ?? false);
      setUser(previousUser);
      updateSessionUser(previousUser);
      setSettingsSaveError(
        error instanceof Error ? error.message : '알림 설정 저장 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleThemeToggle = async () => {
    if (!user || isSavingSettings) return;

    const nextValue = !isDarkMode;
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

  const handleInvestmentStyleChange = async (nextStyle: 'stable' | 'aggressive') => {
    if (!user || isSavingSettings) return;

    const nextValue = nextStyle === 'aggressive' ? 'AGGRESSIVE' : 'STABLE';
    if (user.investmentRiskProfile === nextValue) return;

    const previousUser = user;
    const optimisticUser = { ...user, investmentRiskProfile: nextValue };

    setSettingsSaveError('');
    setUser(optimisticUser);
    updateSessionUser(optimisticUser);
    setIsSavingSettings(true);

    try {
      const updatedUser = await updateMyProfile({ investmentRiskProfile: nextValue });
      updateSessionUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      setUser(previousUser);
      updateSessionUser(previousUser);
      setSettingsSaveError(
        error instanceof Error ? error.message : '투자 성향 저장 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleVirtualInvestmentToggle = async () => {
    if (!user || isSavingSettings) return;

    const nextValue = !virtualInvestmentEnabled;
    const previousUser = user;
    const optimisticUser = { ...user, virtualInvestmentEnabled: nextValue };

    setSettingsSaveError('');
    setVirtualInvestmentEnabled(nextValue);
    setUser(optimisticUser);
    updateSessionUser(optimisticUser);
    setIsSavingSettings(true);

    try {
      const updatedUser = await updateMyProfile({ virtualInvestmentEnabled: nextValue });
      updateSessionUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      setVirtualInvestmentEnabled(previousUser.virtualInvestmentEnabled ?? false);
      setUser(previousUser);
      updateSessionUser(previousUser);
      setSettingsSaveError(
        error instanceof Error ? error.message : '가상 투자 수익률 설정 저장 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTarotDeckSelect = async (deckId: string) => {
    if (deckId === selectedTarotDeckId || isSavingTarotDeck) return;

    const previousDeckId = selectedTarotDeckId;
    setTarotDeckSaveError('');
    setSelectedTarotDeck(deckId);
    setSelectedTarotDeckId(deckId);
    setIsSavingTarotDeck(true);

    try {
      const updatedUser = await updateMyProfile({
        preferredTarotDeckId: deckId,
      });

      updateSessionUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      setSelectedTarotDeck(previousDeckId);
      setSelectedTarotDeckId(previousDeckId);
      setTarotDeckSaveError(
        error instanceof Error ? error.message : '타로 덱 저장 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSavingTarotDeck(false);
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
            className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-backdrop)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="w-full max-w-md overflow-hidden rounded-t-3xl border-t-2 backdrop-blur-xl"
              style={accentButtonStyle}
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

              <div className="space-y-4 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
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
                  <input
                    type="date"
                    value={profileEditDraft.birthDate}
                    onChange={(event) =>
                      setProfileEditDraft((prev) => ({ ...prev, birthDate: event.target.value }))
                    }
                    className="w-full rounded-xl border px-4 py-3 focus:outline-none"
                    style={inputStyle}
                  />
                </ProfileField>

                <ProfileField label="태어난 시간">
                  <input
                    type="time"
                    value={profileEditDraft.birthTime}
                    onChange={(event) =>
                      setProfileEditDraft((prev) => ({ ...prev, birthTime: event.target.value }))
                    }
                    className="w-full rounded-xl border px-4 py-3 focus:outline-none"
                    style={inputStyle}
                  />
                </ProfileField>

                <ProfileField label="성별">
                  <select
                    value={profileEditDraft.gender}
                    onChange={(event) =>
                      setProfileEditDraft((prev) => ({ ...prev, gender: event.target.value }))
                    }
                    className="w-full rounded-xl border px-4 py-3 focus:outline-none"
                    style={inputStyle}
                  >
                    <option value="">미등록</option>
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </select>
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
            className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-backdrop)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="w-full max-w-md overflow-hidden rounded-t-3xl border-t-2 backdrop-blur-xl"
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
                  <div className="space-y-2">
                    {Object.entries(userData.saju.ohang).map(([element, value]) => (
                      <div key={element} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: 'var(--app-text-muted)' }}>
                            {element === 'wood'
                              ? '木 (목)'
                              : element === 'fire'
                                ? '火 (화)'
                                : element === 'earth'
                                  ? '土 (토)'
                                  : element === 'metal'
                                    ? '金 (금)'
                                    : '水 (수)'}
                          </span>
                          <span style={{ color: 'var(--tarot-point-color)' }}>{value}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--app-surface-bg-strong)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{
                              background:
                                'linear-gradient(90deg, var(--tarot-point-color) 0%, var(--app-accent-gradient-end) 100%)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {userData.saju.sections.map((section) => (
                  <div
                    key={section.key}
                    className={`rounded-2xl border p-4 backdrop-blur-xl ${section.className}`}
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
                <h3 className="text-lg font-semibold" style={{ color: 'var(--tarot-text-main)' }}>문의하기</h3>
                <button
                  onClick={() => setShowInquiry(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ backgroundColor: 'var(--app-surface-bg)' }}
                >
                  <X className="h-4 w-4" style={{ color: 'var(--app-icon-muted)' }} />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text-muted)' }}>문의 유형</label>
                  <select className="w-full rounded-xl border px-4 py-3 backdrop-blur-xl transition-colors focus:outline-none" style={inputStyle}>
                    <option>서비스 이용 문의</option>
                    <option>결제 및 환불</option>
                    <option>기술적 문제</option>
                    <option>기타</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text-muted)' }}>문의 내용</label>
                  <textarea
                    rows={5}
                    placeholder="문의하실 내용을 입력해주세요"
                    className="w-full resize-none rounded-xl border px-4 py-3 placeholder:text-[var(--app-input-placeholder)] backdrop-blur-xl transition-colors focus:outline-none"
                    style={inputStyle}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInquiry(false)}
                    className="flex-1 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-white/10"
                    style={glassButtonStyle}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => setShowInquiry(false)}
                    className="flex-1 rounded-xl border py-3 text-sm font-semibold backdrop-blur-xl transition-all"
                    style={accentButtonStyle}
                  >
                    전송
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

          <div className="space-y-0 divide-y p-4" style={{ borderColor: 'var(--app-surface-divider)' }}>
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
            <div className="flex items-center gap-3 py-3">
              <Info className="h-5 w-5" style={{ color: 'var(--app-icon-soft)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--app-text-muted)' }}>토큰 만료</span>
              <span className="max-w-[180px] text-right text-sm font-medium" style={{ color: 'var(--tarot-text-main)' }}>{userData.tokenExpiresAt}</span>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setShowBirthTarot(true)}
            className="group relative w-full overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all hover:shadow-lg"
            style={accentCardStyle}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={accentIconStyle}>
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold" style={{ color: 'var(--tarot-text-main)' }}>내 생일 타로 카드</h3>
                  <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>{userData.birthTarot.koreanName}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--tarot-point-color)' }} />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowSaju(true)}
            className="group relative w-full overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all hover:shadow-lg"
            style={accentCardStyle}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={accentIconStyle}>
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold" style={{ color: 'var(--tarot-text-main)' }}>내 사주 정보</h3>
                  <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>사주팔자, 오행, 십성 등</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--tarot-point-color)' }} />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => navigate('/liked-fortunes')}
            className="group relative w-full overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all hover:shadow-lg"
            style={accentCardStyle}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={accentIconStyle}>
                  <Heart className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold" style={{ color: 'var(--tarot-text-main)' }}>좋아요한 운세</h3>
                  <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>저장한 투자 운세 결과</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--tarot-point-color)' }} />
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 overflow-hidden rounded-3xl border backdrop-blur-xl"
          style={glassCardStyle}
        >
          <div className="border-b px-5 py-4" style={{ borderColor: 'var(--app-surface-divider)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--tarot-text-main)' }}>상담 설정</h3>
          </div>

          <div className="space-y-0 divide-y p-4" style={{ borderColor: 'var(--app-surface-divider)' }}>
            <div className="py-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: 'var(--app-icon-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>투자 성향</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInvestmentStyleChange('stable')}
                  disabled={isSavingSettings}
                  aria-pressed={investmentStyle === 'stable'}
                  className="rounded-xl border px-4 py-2.5 text-center text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  style={
                    investmentStyle === 'stable'
                      ? { ...accentIconStyle, boxShadow: '0 12px 24px -20px var(--app-accent-glow)' }
                      : { ...glassCardStyle, color: 'var(--app-text-muted)' }
                  }
                >
                  <Shield className="mx-auto mb-1 h-5 w-5" />
                  안정형
                </button>
                <button
                  type="button"
                  onClick={() => handleInvestmentStyleChange('aggressive')}
                  disabled={isSavingSettings}
                  aria-pressed={investmentStyle === 'aggressive'}
                  className="rounded-xl border px-4 py-2.5 text-center text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  style={
                    investmentStyle === 'aggressive'
                      ? { ...accentIconStyle, boxShadow: '0 12px 24px -20px var(--app-accent-glow)' }
                      : { ...glassCardStyle, color: 'var(--app-text-muted)' }
                  }
                >
                  <TrendingUp className="mx-auto mb-1 h-5 w-5" />
                  공격형
                </button>
              </div>
            </div>

            <SettingToggle
              icon={Bell}
              label="알림 설정"
              enabled={notificationEnabled}
              onToggle={handleNotificationToggle}
              disabled={isSavingSettings}
            />

            <SettingToggle
              icon={isDarkMode ? Moon : Sun}
              label="화면 모드"
              enabled={isDarkMode}
              onToggle={handleThemeToggle}
              disabled={isSavingSettings}
            />

            <SettingToggle
              icon={TrendingUp}
              label="가상 투자 수익률"
              enabled={virtualInvestmentEnabled}
              onToggle={handleVirtualInvestmentToggle}
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

            <div className="py-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: 'var(--app-icon-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--app-text-soft)' }}>타로 덱 선택</span>
              </div>
              {tarotDeckSaveError ? (
                <div className="mb-3 rounded-xl border px-3 py-2 text-xs" style={{ borderColor: 'var(--app-danger-border)', backgroundColor: 'var(--app-danger-bg)', color: 'var(--app-danger-text)' }}>
                  {tarotDeckSaveError}
                </div>
              ) : null}
              {isSavingTarotDeck ? (
                <div className="mb-3 text-xs" style={{ color: 'var(--app-text-subtle)' }}>선택한 덱을 저장하고 있습니다.</div>
              ) : null}
              <div className="grid gap-2">
                {tarotDeckVersions.map((deck) => {
                  const isSelected = deck.id === selectedTarotDeckId;

                  return (
                    <button
                      key={deck.id}
                      onClick={() => handleTarotDeckSelect(deck.id)}
                      className="rounded-xl border px-4 py-3 text-left text-sm transition-all"
                      style={
                        isSelected
                          ? { ...accentIconStyle, boxShadow: '0 12px 24px -20px var(--app-accent-glow)' }
                          : { ...glassCardStyle, color: 'var(--app-text-muted)' }
                      }
                    >
                      <div className="font-medium" style={{ color: isSelected ? 'var(--tarot-text-main)' : 'inherit' }}>{deck.name}</div>
                      <div className="mt-1 text-xs" style={{ color: isSelected ? 'var(--app-text-muted)' : 'var(--app-text-subtle)' }}>{deck.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 space-y-2"
        >
          <button
            onClick={() => setShowInquiry(true)}
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
          <p>© 2024 Stock Oracle. All rights reserved.</p>
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

function normalizeDateInputValue(value?: string | null) {
  if (!value) return '';

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return '';

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeTimeInputValue(value?: string | null) {
  if (!value) return '';

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '';
}

function normalizeGenderInputValue(value?: string | null) {
  if (!value) return '';
  if (value === 'M' || value === 'MALE') return 'M';
  if (value === 'F' || value === 'FEMALE') return 'F';
  return '';
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
    meaning: birthTarot?.meaning ?? '희망, 영감, 밝은 미래',
    description: birthTarot?.description?.trim() || null,
    imageUrl:
      resolveApiAssetUrl(birthTarot?.imageUrl) ??
      'https://images.unsplash.com/photo-1683217956228-d3d24916df55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXJvdCUyMGNhcmQlMjBteXN0aWNhbHxlbnwxfHx8fDE3NzM3NDg5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  };
}

function normalizeSaju(profileDetails: UserProfileDetailsResponse | null) {
  const saju = profileDetails?.saju;
  const palza = saju?.palza ?? saju?.palja ?? ['乙未', '己卯', '壬午', '辛亥'];
  const descriptionSections = [
    {
      key: 'ilju',
      label: '일주',
      data: normalizeSajuDescription(saju?.ilju, '일주 정보', '일주 해석 정보가 없습니다.'),
      className: 'border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 to-teal-500/5',
      titleClassName: 'text-emerald-300',
    },
    {
      key: 'wolji',
      label: '월지',
      data: normalizeSajuDescription(saju?.wolji, '월지 정보', '월지 해석 정보가 없습니다.'),
      className: 'border-sky-400/25 bg-gradient-to-br from-sky-500/10 to-cyan-500/5',
      titleClassName: 'text-sky-300',
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
      titleClassName: 'text-violet-300',
    },
  ];

  return {
    palza,
    ohang: {
      wood: saju?.ohang?.wood ?? 40,
      fire: saju?.ohang?.fire ?? 25,
      earth: saju?.ohang?.earth ?? 15,
      metal: saju?.ohang?.metal ?? 10,
      water: saju?.ohang?.water ?? 10,
    },
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
