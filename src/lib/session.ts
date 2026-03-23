const SESSION_KEY = 'stock-oracle-session';
const LAST_CONSULT_KEY = 'stock-oracle-last-consult';

export type InvestmentRiskProfile = 'STABLE' | 'AGGRESSIVE';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  investmentRiskProfile: InvestmentRiskProfile;
  preferredSectors: string[];
  birthDate?: string | null;
  birthTime?: string | null;
  gender?: string | null;
  profileImageUrl?: string | null;
  notificationEnabled?: boolean;
  virtualInvestmentEnabled?: boolean;
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
