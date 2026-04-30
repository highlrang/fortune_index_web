const SESSION_KEY = 'fortune-index-session';
const LAST_CONSULT_KEY = 'fortune-index-last-consult';
const HOME_TAROT_DRAW_KEY = 'fortune-index-home-tarot-draw';

export type InvestmentRiskProfile = 'STABLE' | 'AGGRESSIVE';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  investmentRiskProfile: InvestmentRiskProfile;
  preferredSectors: string[];
  subscriptionTier?: 'FREE' | 'PREMIUM' | null;
  preferredTarotDeckId?: string | null;
  birthDate?: string | null;
  birthTime?: string | { hour?: number; minute?: number; second?: number; nano?: number } | null;
  gender?: string | null;
  profileImageUrl?: string | null;
  notificationEnabled?: boolean;
  darkModeEnabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface SessionState {
  user: SessionUser;
  tokens: SessionTokens;
}

export interface HomeTarotDrawCard {
  selectedIndex: number;
  label: string;
  meaning: string;
  description?: string;
  imageSrc: string;
  videoSrc?: string;
}

export interface HomeTarotDrawState {
  deckVersionId: string;
  deckName: string;
  cards: HomeTarotDrawCard[];
  updatedAt: string;
}

export function getSession(): SessionState | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: SessionState) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function updateSessionUser(user: SessionUser) {
  const session = getSession();
  if (!session) return;

  saveSession({
    ...session,
    user,
  });
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken() {
  return getSession()?.tokens.accessToken ?? null;
}

export function getCurrentUser() {
  return getSession()?.user ?? null;
}

export function hasPremiumConsultingAccess(user = getCurrentUser()) {
  if (!user) return false;
  return user.subscriptionTier === 'PREMIUM';
}

export function saveLastConsultResult<T>(result: T) {
  localStorage.setItem(LAST_CONSULT_KEY, JSON.stringify(result));
}

export function getLastConsultResult<T>() {
  const raw = localStorage.getItem(LAST_CONSULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(LAST_CONSULT_KEY);
    return null;
  }
}

export function saveHomeTarotDraw(draw: HomeTarotDrawState) {
  localStorage.setItem(HOME_TAROT_DRAW_KEY, JSON.stringify(draw));
}

export function getHomeTarotDraw() {
  const raw = localStorage.getItem(HOME_TAROT_DRAW_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as HomeTarotDrawState;
  } catch {
    localStorage.removeItem(HOME_TAROT_DRAW_KEY);
    return null;
  }
}
