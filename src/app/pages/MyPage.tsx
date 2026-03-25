import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Cake,
  Sparkles,
  ChevronRight,
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
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import {
  getMe,
  getMyProfileDetails,
  getTarotDeckVersions,
  logout,
  resolveApiAssetUrl,
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

export function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(() => getCurrentUser());
  const [profileDetails, setProfileDetails] = useState<UserProfileDetailsResponse | null>(null);
  const [session] = useState(() => getSession());
  const [showBirthTarot, setShowBirthTarot] = useState(false);
  const [showSaju, setShowSaju] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [virtualInvestmentEnabled, setVirtualInvestmentEnabled] = useState(false);
  const [selectedTarotDeckId, setSelectedTarotDeck] = useState(() => getSelectedTarotDeckId());
  const [tarotDeckVersions, setTarotDeckVersions] = useState(() => getCachedTarotDeckVersions());

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
      tokenExpiresAt: session ? new Date(session.tokens.accessTokenExpiresAt).toLocaleString() : '-',
      birthTarot: normalizedBirthTarot,
      saju: normalizedSaju,
    };
  }, [profileDetails, session, user]);

  useEffect(() => {
    if (typeof user?.notificationEnabled === 'boolean') {
      setNotificationEnabled(user.notificationEnabled);
    }
    if (typeof user?.darkModeEnabled === 'boolean') {
      setIsDarkMode(user.darkModeEnabled);
    }
    if (typeof user?.virtualInvestmentEnabled === 'boolean') {
      setVirtualInvestmentEnabled(user.virtualInvestmentEnabled);
    }
  }, [user]);

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

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 text-lg text-white">로그인 정보가 없습니다.</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-full border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-sm text-amber-200"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 pb-24">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <AnimatePresence>
        {showBirthTarot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBirthTarot(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative mx-4 max-w-sm"
            >
              <div className="absolute -top-12 left-0 right-0 text-center">
                <p className="text-sm text-white/60">화면을 터치하면 닫힙니다</p>
              </div>

              <div className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37] bg-gradient-to-br from-purple-900/95 via-violet-800/90 to-purple-900/95 p-8 shadow-2xl">
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={{
                    boxShadow: [
                      '0 0 40px rgba(212, 175, 55, 0.5), inset 0 0 40px rgba(168, 85, 247, 0.4)',
                      '0 0 60px rgba(212, 175, 55, 0.7), inset 0 0 60px rgba(168, 85, 247, 0.6)',
                      '0 0 40px rgba(212, 175, 55, 0.5), inset 0 0 40px rgba(168, 85, 247, 0.4)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="relative mb-6 aspect-[2/3] overflow-hidden rounded-2xl border-2 border-[#D4AF37]/40">
                  <img
                    src={userData.birthTarot.imageUrl}
                    alt={userData.birthTarot.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                </div>

                <div className="relative space-y-3 text-center">
                  <div className="text-sm text-[#D4AF37]/70">생일 타로 카드</div>
                  <h2 className="text-3xl font-bold text-white">{userData.birthTarot.koreanName}</h2>
                  <p className="text-lg text-white/70">{userData.birthTarot.name}</p>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-sm text-[#D4AF37]">
                    <Sparkles className="h-4 w-4" />
                    {userData.birthTarot.number}번 카드
                  </div>
                  <p className="pt-2 text-sm leading-relaxed text-white/80">{userData.birthTarot.meaning}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaju && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="w-full max-w-md overflow-hidden rounded-t-3xl border-t-2 border-[#D4AF37]/40 bg-gradient-to-br from-indigo-950/98 via-indigo-900/98 to-violet-950/98 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">내 사주 정보</h3>
                <button
                  onClick={() => setShowSaju(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-[#D4AF37]">
                    <Sparkles className="h-4 w-4" />
                    사주팔자
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {userData.saju.palza.map((char, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-xl"
                      >
                        <div className="text-2xl font-bold text-white">{char}</div>
                        <div className="mt-1 text-xs text-white/50">{['년주', '월주', '일주', '시주'][idx]}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium text-[#D4AF37]">오행 분포</h4>
                  <div className="space-y-2">
                    {Object.entries(userData.saju.ohang).map(([element, value]) => (
                      <div key={element} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/70">
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
                          <span className="text-[#D4AF37]">{value}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-500"
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
                      <span className="text-xs text-white/50">{section.title}</span>
                    </div>
                    <p className="text-sm leading-6 text-white/90">{section.summary}</p>
                  </div>
                ))}

                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-5 text-white/60">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-950/98 via-indigo-900/98 to-violet-950/98 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">문의하기</h3>
                <button
                  onClick={() => setShowInquiry(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">문의 유형</label>
                  <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-xl transition-colors focus:border-[#D4AF37]/50 focus:outline-none">
                    <option>서비스 이용 문의</option>
                    <option>결제 및 환불</option>
                    <option>기술적 문제</option>
                    <option>기타</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">문의 내용</label>
                  <textarea
                    rows={5}
                    placeholder="문의하실 내용을 입력해주세요"
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 backdrop-blur-xl transition-colors focus:border-[#D4AF37]/50 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInquiry(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => setShowInquiry(false)}
                    className="flex-1 rounded-xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/60 to-amber-600/50 py-3 text-sm font-semibold text-white shadow-lg shadow-[#D4AF37]/20 backdrop-blur-xl transition-all hover:shadow-xl hover:shadow-[#D4AF37]/30"
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
          <h1 className="text-2xl font-semibold text-white">마이</h1>
          <p className="text-sm text-white/50">내 정보 및 설정</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-[#D4AF37]/20 via-amber-600/10 to-transparent p-6">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#D4AF37]/10 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/30 to-amber-600/20 backdrop-blur-xl">
                <User className="h-8 w-8 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-1 text-xl font-bold text-white">{userData.name}</h2>
                <p className="text-sm text-white/60">{userData.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-white/5 p-4">
            <div className="flex items-center gap-3 py-3">
              <Mail className="h-5 w-5 text-white/40" />
              <span className="flex-1 text-sm text-white/70">이메일</span>
              <span className="text-sm font-medium text-white">{userData.email}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Calendar className="h-5 w-5 text-white/40" />
              <span className="flex-1 text-sm text-white/70">생년월일</span>
              <span className="text-sm font-medium text-white">{userData.birthDate}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Clock className="h-5 w-5 text-white/40" />
              <span className="flex-1 text-sm text-white/70">태어난 시간</span>
              <span className="text-sm font-medium text-white">{userData.birthTime}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Cake className="h-5 w-5 text-white/40" />
              <span className="flex-1 text-sm text-white/70">성별 / 나이</span>
              <span className="text-sm font-medium text-white">
                {userData.gender} {userData.age}
              </span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <TrendingUp className="h-5 w-5 text-white/40" />
              <span className="flex-1 text-sm text-white/70">투자 성향</span>
              <span className="text-sm font-medium text-white">
                {investmentStyle === 'aggressive' ? '공격형' : '안정형'}
              </span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Shield className="h-5 w-5 text-white/40" />
              <span className="flex-1 text-sm text-white/70">선호 섹터</span>
              <span className="max-w-[180px] text-right text-sm font-medium text-white">
                {userData.preferredSectors.join(', ') || '-'}
              </span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Info className="h-5 w-5 text-white/40" />
              <span className="flex-1 text-sm text-white/70">토큰 만료</span>
              <span className="max-w-[180px] text-right text-sm font-medium text-white">{userData.tokenExpiresAt}</span>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setShowBirthTarot(true)}
            className="group relative w-full overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 via-amber-600/5 to-transparent p-4 backdrop-blur-xl transition-all hover:border-[#D4AF37]/50 hover:shadow-lg hover:shadow-[#D4AF37]/20"
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#D4AF37]/10 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/20">
                  <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">내 생일 타로 카드</h3>
                  <p className="text-sm text-white/60">{userData.birthTarot.koreanName}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowSaju(true)}
            className="group relative w-full overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 via-amber-600/5 to-transparent p-4 backdrop-blur-xl transition-all hover:border-[#D4AF37]/50 hover:shadow-lg hover:shadow-[#D4AF37]/20"
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#D4AF37]/10 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/20">
                  <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">내 사주 정보</h3>
                  <p className="text-sm text-white/60">사주팔자, 오행, 십성 등</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => navigate('/liked-fortunes')}
            className="group relative w-full overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 via-amber-600/5 to-transparent p-4 backdrop-blur-xl transition-all hover:border-[#D4AF37]/50 hover:shadow-lg hover:shadow-[#D4AF37]/20"
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#D4AF37]/10 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/20">
                  <Heart className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">좋아요한 운세</h3>
                  <p className="text-sm text-white/60">저장한 투자 운세 결과</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/5 px-5 py-4">
            <h3 className="font-semibold text-white">상담 설정</h3>
          </div>

          <div className="space-y-0 divide-y divide-white/5 p-4">
            <div className="py-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-white/60" />
                <span className="text-sm font-medium text-white/90">투자 성향</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`rounded-xl border px-4 py-2.5 text-center text-sm font-medium ${
                    investmentStyle === 'stable'
                      ? 'border-[#D4AF37]/50 bg-[#D4AF37]/20 text-white shadow-lg shadow-[#D4AF37]/10'
                      : 'border-white/10 bg-white/5 text-white/60'
                  }`}
                >
                  <Shield className="mx-auto mb-1 h-5 w-5" />
                  안정형
                </div>
                <div
                  className={`rounded-xl border px-4 py-2.5 text-center text-sm font-medium ${
                    investmentStyle === 'aggressive'
                      ? 'border-[#D4AF37]/50 bg-[#D4AF37]/20 text-white shadow-lg shadow-[#D4AF37]/10'
                      : 'border-white/10 bg-white/5 text-white/60'
                  }`}
                >
                  <TrendingUp className="mx-auto mb-1 h-5 w-5" />
                  공격형
                </div>
              </div>
            </div>

            <SettingToggle
              icon={Bell}
              label="알림 설정"
              enabled={notificationEnabled}
              onToggle={() => setNotificationEnabled(!notificationEnabled)}
            />

            <SettingToggle
              icon={isDarkMode ? Moon : Sun}
              label="화면 모드"
              enabled={isDarkMode}
              onToggle={() => setIsDarkMode(!isDarkMode)}
            />

            <SettingToggle
              icon={TrendingUp}
              label="가상 투자 수익률"
              enabled={virtualInvestmentEnabled}
              onToggle={() => setVirtualInvestmentEnabled(!virtualInvestmentEnabled)}
            />

            <div className="py-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-white/60" />
                <span className="text-sm font-medium text-white/90">타로 덱 선택</span>
              </div>
              <div className="grid gap-2">
                {tarotDeckVersions.map((deck) => {
                  const isSelected = deck.id === selectedTarotDeckId;

                  return (
                    <button
                      key={deck.id}
                      onClick={() => {
                        setSelectedTarotDeckId(deck.id);
                        setSelectedTarotDeck(deck.id);
                      }}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        isSelected
                          ? 'border-[#D4AF37]/50 bg-[#D4AF37]/20 text-white shadow-lg shadow-[#D4AF37]/10'
                          : 'border-white/10 bg-white/5 text-white/60'
                      }`}
                    >
                      <div className="font-medium">{deck.name}</div>
                      <div className="mt-1 text-xs text-white/45">{deck.description}</div>
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
            className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-white/60" />
              <span className="text-sm font-medium text-white/90">문의하기</span>
            </div>
            <ChevronRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1" />
          </button>

          <button className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-white/60" />
              <span className="text-sm font-medium text-white/90">앱 정보</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">v1.0.0</span>
              <ChevronRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleLogout}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-xl transition-all hover:border-red-500/50 hover:bg-red-500/20"
        >
          <LogOut className="h-5 w-5 text-red-400" />
          <span className="font-medium text-red-400">로그아웃</span>
        </motion.button>

        <div className="mb-4 space-y-2 text-center text-xs text-white/40">
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/terms')} className="hover:text-white/60">
              이용약관
            </button>
            <span>·</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-white/60">
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
}: {
  icon: typeof User;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-white/60" />
        <span className="text-sm font-medium text-white/90">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          enabled ? 'bg-[#D4AF37]' : 'bg-white/20'
        }`}
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
    return trimmed || '미등록';
  }

  const hour = String(value.hour).padStart(2, '0');
  const minute = String(value.minute).padStart(2, '0');
  return `${hour}:${minute}`;
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
