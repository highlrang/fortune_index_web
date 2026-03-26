import {
  clearSession,
  getAccessToken,
  getSession,
  saveSession,
  type SessionState,
} from './session';

const DEFAULT_API_BASE_URL = 'http://117.52.84.99:7071';
const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const API_KEY = import.meta.env.VITE_API_KEY;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean;
}

type QueryValue = string | number | boolean | null | undefined;
let refreshPromise: Promise<boolean> | null = null;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await performRequest(path, options);
  const payload = await parseResponsePayload(response);

  if (response.status === 401 && shouldAttemptRefresh(path, options)) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      const retryResponse = await performRequest(path, {
        ...options,
        skipAuthRefresh: true,
      });
      const retryPayload = await parseResponsePayload(retryResponse);

      if (!retryResponse.ok) {
        throw new ApiError(
          resolveErrorMessage(retryPayload, retryResponse.status),
          retryResponse.status,
          retryPayload,
        );
      }

      return retryPayload as T;
    }
  }

  if (!response.ok) {
    throw new ApiError(resolveErrorMessage(payload, response.status), response.status, payload);
  }

  return payload as T;
}

async function performRequest(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (API_KEY) {
    headers.API_Key = API_KEY;
  }

  const accessToken = getAccessToken();
  if (accessToken && shouldAttachAccessToken(path)) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

async function parseResponsePayload(response: Response) {
  const text = await response.text();
  return text ? safeJsonParse(text) : null;
}

function shouldAttachAccessToken(path: string) {
  return !(
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/signup')
  );
}

function shouldAttemptRefresh(path: string, options: RequestOptions) {
  if (options.skipAuthRefresh) return false;
  if (!getSession()?.tokens.refreshToken) return false;
  if (path === '/api/auth/refresh') return false;

  return !(
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/signup') ||
    path.startsWith('/api/auth/password-reset') ||
    path === '/api/auth/logout'
  );
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const session = getSession();
    if (!session?.tokens.refreshToken) return false;

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (API_KEY) {
        headers.API_Key = API_KEY;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refreshToken: session.tokens.refreshToken }),
      });

      const payload = await parseResponsePayload(response);

      if (!response.ok || !payload || typeof payload !== 'object' || !('tokens' in payload)) {
        clearSession();
        return false;
      }

      const refreshed = payload as AuthResponse;
      saveSession(toSessionState(refreshed));
      return true;
    } catch {
      clearSession();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function resolveErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === 'object') {
    if ('message' in payload && typeof payload.message === 'string') {
      return payload.message;
    }
    if ('error' in payload && typeof payload.error === 'string') {
      return payload.error;
    }
  }

  if (status === 401) return '인증이 필요합니다.';
  if (status === 403) return '권한이 없습니다.';
  if (status === 404) return '요청한 데이터를 찾을 수 없습니다.';
  if (status === 503) return '서버가 일시적으로 응답하지 않습니다.';
  return '요청 처리 중 오류가 발생했습니다.';
}

function buildQuery(params: Record<string, QueryValue | QueryValue[] | Record<string, unknown>>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    if (typeof value === 'object') {
      searchParams.set(key, JSON.stringify(value));
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function resolveApiAssetUrl(url?: string | null) {
  if (!url) return url ?? undefined;

  try {
    return new URL(url).toString();
  } catch {
    return new URL(url, API_BASE_URL).toString();
  }
}

function normalizeApiBaseUrl(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : DEFAULT_API_BASE_URL;
}

export interface AuthUserResponse {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  investmentRiskProfile: 'STABLE' | 'AGGRESSIVE';
  preferredSectors: string[];
  preferredTarotDeckId?: string | null;
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

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface AuthResponse {
  user: AuthUserResponse;
  tokens: AuthTokenResponse;
}

export interface EmailCodeResponse {
  email: string;
  purpose: string;
  expiresAt: string;
}

export interface MessageResponse {
  message: string;
}

export interface EmailVerificationResponse {
  email: string;
  purpose: string;
  verified: boolean;
  verifiedAt: string;
}

export interface ScenarioOptionResponse {
  code: string;
  title: string;
  description: string;
}

export interface TotalIndexResponse {
  totalScore: number;
  detail: {
    selectedMarket: string;
    marketScore: number;
    marketRawValue: number;
    sajuScore: number;
    dailyGanji: string;
    tarotScore: number;
    tarotCardName: string;
  };
}

export interface TarotCardConsultResponse {
  selectedIndex: number;
  code: string;
  deckType: 'TAROT' | 'ORACLE';
  deckVersionId?: string;
  name: string;
  sortOrder: number;
  arcanaType: string;
  suit?: string;
  meaning: string;
  imageUrl: string;
  videoUrl?: string;
}

export interface ConsultResponse {
  mode: 'ONLY_STOCK' | 'STOCK_SAJU' | 'STOCK_TAROT' | 'STOCK_ALL';
  stock: {
    code: string;
    name: string;
    currentPrice: number;
    changeRate: number;
    sector: string;
    fallback: boolean;
  };
  saju?: {
    dayMaster: { symbol: string; fiveElement: string; yinYang: string };
    dayBranch: { symbol: string; fiveElement: string; yinYang: string };
    monthBranch: { symbol: string; fiveElement: string; yinYang: string };
  };
  tarot?: {
    interpretationMode: string;
    cards: TarotCardConsultResponse[];
  };
  ai: {
    provider: string;
    model: string;
    mode: string;
    analysisResults: {
      market_analysis: { title: string; content: string };
      tarot_analysis: { title: string; content: string };
      saju_analysis: { title: string; content: string };
    };
    finalAdvice: string;
    riskScore: number;
    rawJson: string;
  };
  history: {
    id: number;
    userId: number;
    shareKey: string;
    consultedAt: string;
    aiAnswerText: string;
    marketAnalysisText: string;
    tarotAnalysisText?: string;
    sajuAnalysisText?: string;
  };
}

export interface ConsultingHistoryListItemResponse {
  id: number;
  shareKey: string;
  mode: 'ONLY_STOCK' | 'STOCK_SAJU' | 'STOCK_TAROT' | 'STOCK_ALL';
  scenario?: string;
  stockCode: string;
  stockName: string;
  consultedAt: string;
  aiSummary: string;
  tarotInterpretationMode?: string;
  tarotCardCodes: string[];
  tarotCardNames: string[];
}

export interface LocalTimePayload {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface EmailCodeVerifyPayload {
  email: string;
  verificationCode: string;
}

export interface TokenRefreshPayload {
  refreshToken: string;
}

export interface PasswordResetConfirmPayload {
  email: string;
  verificationCode: string;
  newPassword: string;
}

export interface WithdrawPayload {
  password: string;
}

export interface UpdateMyProfilePayload {
  name?: string;
  birthDate?: string | null;
  birthTime?: string | null;
  gender?: 'F' | 'M' | string | null;
  preferredTarotDeckId?: string | null;
}

export interface PageableQuery {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface ConsultingHistoryDateLabelResponse {
  code: string;
  title: string;
  count: number;
}

export interface ConsultingHistoryDateSummaryResponse {
  date: string;
  totalConsultings: number;
  labels: ConsultingHistoryDateLabelResponse[];
}

export interface PageConsultingHistoryDateSummaryResponse {
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
  numberOfElements?: number;
  size?: number;
  number?: number;
  empty?: boolean;
  content?: ConsultingHistoryDateSummaryResponse[];
}

export interface StockSnapshotResponse {
  ticker: string;
  companyName: string;
  marketPrice: number;
  changeRate: number;
  capturedAt: string;
}

export interface ConsultingHistoryReviewResponse {
  satisfaction?: 'HELPFUL' | 'NOT_HELPFUL' | string;
  realizedProfitRate?: number;
  reviewNote?: string;
  reviewedAt?: string;
  reviewed: boolean;
}

export interface ConsultingHistoryDateItemResponse {
  id: number;
  consultedAt: string;
  mode: 'ONLY_STOCK' | 'STOCK_SAJU' | 'STOCK_TAROT' | 'STOCK_ALL';
  scenario?: 'TIMING_ENTRY' | 'TIMING_EXIT' | 'SAJU_MATCH' | 'RESCUE_PLAN' | 'MENTAL_GUIDE';
  label: ConsultingHistoryDateLabelResponse;
  shareKey: string;
  selectedStockName: string;
  aiAnswerText: string;
  stock: StockSnapshotResponse;
  tarotCardNames: string[];
  review: ConsultingHistoryReviewResponse;
}

export interface ConsultingHistoryDateDetailResponse {
  date: string;
  consultings: ConsultingHistoryDateItemResponse[];
}

export interface UpdateConsultingReviewPayload {
  satisfaction?: 'HELPFUL' | 'NOT_HELPFUL';
  realizedProfitRate?: number;
  reviewNote?: string;
  reviewedAt?: string;
}

export interface CreateVirtualInvestmentPayload {
  stockCode: string;
  buyQuantity: number;
  boughtAt?: string;
}

export interface VirtualInvestmentPositionResponse {
  id: number;
  userId: number;
  stockCode: string;
  averageBuyPrice: number;
  buyQuantity: number;
  boughtAt: string;
  isHolding: boolean;
  currentPrice: number;
  currentReturnRate: number;
  evaluationProfit: number;
  priceFallback: boolean;
}

export interface SajuSnapshotResponse {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  summary: string;
}

export interface TarotCardHistoryResponse {
  selectedIndex: number;
  code: string;
  deckType: string;
  name: string;
  cardNumber: number;
  sortOrder: number;
  arcanaType: string;
  suit?: string;
  meaning: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface TarotSnapshotResponse {
  interpretationMode?: string;
  summary: string;
  cards: TarotCardHistoryResponse[];
}

export interface SharedConsultingHistoryResponse {
  id: number;
  userId: number;
  mode: 'ONLY_STOCK' | 'STOCK_SAJU' | 'STOCK_TAROT' | 'STOCK_ALL';
  scenario?: 'TIMING_ENTRY' | 'TIMING_EXIT' | 'SAJU_MATCH' | 'RESCUE_PLAN' | 'MENTAL_GUIDE';
  shareKey: string;
  consultedAt: string;
  stock: StockSnapshotResponse;
  saju?: SajuSnapshotResponse;
  tarot?: TarotSnapshotResponse;
  question?: string;
  aiAnswerText: string;
  marketAnalysisText: string;
  tarotAnalysisText?: string;
  sajuAnalysisText?: string;
  analysisResultJson: string;
  aiResponseJson: string;
}

export interface KisApiRawResponse {
  rtCd?: string;
  msgCd?: string;
  msg1?: string;
  output?: unknown;
  output1?: unknown;
  output2?: unknown;
  ctxAreaFk100?: string;
  ctxAreaNk100?: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  verificationCode: string;
  birthDate: string;
  birthTime?: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  investmentRiskProfile: 'STABLE' | 'AGGRESSIVE';
  preferredSectors: string[];
}

export interface ConsultPayload {
  userId: number;
  mode: 'ONLY_STOCK' | 'STOCK_SAJU' | 'STOCK_TAROT' | 'STOCK_ALL';
  scenario: 'TIMING_ENTRY' | 'TIMING_EXIT' | 'SAJU_MATCH' | 'RESCUE_PLAN' | 'MENTAL_GUIDE';
  stockCode: string;
  stockName?: string;
  tarotIndices?: number[];
  tarotDeckVersionId?: string;
  tarotInterpretationMode?: 'MAIN_TRADITIONAL';
  question?: string;
  referenceDateTime?: string;
}

export interface TarotDeckVersionResponse {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string | null;
  active: boolean;
}

export interface TarotDeckCardResponse {
  selectedIndex: number;
  code: string;
  deckVersionId: string;
  deckType: 'TAROT' | 'ORACLE';
  name: string;
  koreanName?: string;
  sortOrder: number;
  arcanaType: string;
  suit?: string;
  meaning: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface BirthTarotProfileResponse {
  deckVersionId?: string;
  name?: string;
  koreanName?: string;
  number?: number;
  meaning?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface SajuDescriptionResponse {
  name?: string;
  summary?: string;
}

export interface SajuProfileResponse {
  palza?: string[];
  palja?: string[];
  ohang?: {
    wood?: number;
    fire?: number;
    earth?: number;
    metal?: number;
    water?: number;
  };
  ilju?: SajuDescriptionResponse | null;
  wolji?: SajuDescriptionResponse | null;
  daeun?: SajuDescriptionResponse | string | null;
  sewun?: SajuDescriptionResponse | string | null;
  sipsung?: string[];
}

export interface UserProfileDetailsResponse {
  birthTarot?: BirthTarotProfileResponse | null;
  saju?: SajuProfileResponse | null;
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/api/auth/login', { method: 'POST', body: payload });
}

export async function signup(payload: SignUpPayload) {
  return request<AuthResponse>('/api/auth/signup', { method: 'POST', body: payload });
}

export async function requestSignupEmailCode(email: string) {
  return request<EmailCodeResponse>('/api/auth/signup/email/request', {
    method: 'POST',
    body: { email },
  });
}

export async function verifySignupCode(payload: EmailCodeVerifyPayload) {
  return request<EmailVerificationResponse>('/api/auth/signup/email/verify', {
    method: 'POST',
    body: payload,
  });
}

export async function getMe() {
  return request<AuthUserResponse>('/api/auth/me');
}

export async function getMyProfileDetails() {
  return request<UserProfileDetailsResponse>('/api/users/me/profile-details');
}

export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  return request<AuthUserResponse>('/api/users/me', {
    method: 'PATCH',
    body: payload,
  });
}

export async function withdraw(payload: WithdrawPayload) {
  return request<MessageResponse>('/api/auth/me', {
    method: 'DELETE',
    body: payload,
  });
}

export async function logout(refreshToken: string) {
  return request<MessageResponse>('/api/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function refreshAuthToken(payload: TokenRefreshPayload) {
  return request<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    body: payload,
  });
}

export async function requestPasswordResetCode(email: string) {
  return request<EmailCodeResponse>('/api/auth/password-reset/request', {
    method: 'POST',
    body: { email },
  });
}

export async function verifyPasswordResetCode(payload: EmailCodeVerifyPayload) {
  return request<EmailVerificationResponse>('/api/auth/password-reset/verify', {
    method: 'POST',
    body: payload,
  });
}

export async function confirmPasswordReset(payload: PasswordResetConfirmPayload) {
  return request<MessageResponse>('/api/auth/password-reset/confirm', {
    method: 'POST',
    body: payload,
  });
}

export async function getInvestmentIndex() {
  return request<TotalIndexResponse>('/api/v1/investment-index');
}

export async function getScenarios() {
  return request<ScenarioOptionResponse[]>('/api/scenarios');
}

export async function getTarotDeckVersions() {
  return request<TarotDeckVersionResponse[]>('/api/tarot/deck-versions');
}

export async function getTarotDeckCards(deckVersionId: string, selectedIndices?: number[]) {
  return request<TarotDeckCardResponse[]>(
    `/api/tarot/deck-versions/${deckVersionId}/cards${buildQuery({ selectedIndices })}`,
  );
}

export async function consult(payload: ConsultPayload) {
  return request<ConsultResponse>('/api/consult', { method: 'POST', body: payload });
}

export async function getHistoryList(userId: number) {
  return request<ConsultingHistoryListItemResponse[]>(`/api/history?userId=${userId}`);
}

export async function getHistoryDetail(historyId: number, userId?: number) {
  return request<SharedConsultingHistoryResponse>(
    `/api/history/${historyId}${buildQuery({ userId })}`,
  );
}

export async function getSharedHistory(shareKey: string) {
  return request<SharedConsultingHistoryResponse>(`/api/history/share/${shareKey}`);
}

export async function getConsultingHistories(userId: number, pageable: PageableQuery) {
  const query = buildQuery({
    page: pageable.page,
    size: pageable.size,
    sort: pageable.sort,
  });
  return request<PageConsultingHistoryDateSummaryResponse>(
    `/api/users/${userId}/consulting-histories${query}`,
  );
}

export async function getHistoryDetailsByDate(userId: number, date: string) {
  return request<ConsultingHistoryDateDetailResponse>(
    `/api/users/${userId}/consulting-histories/by-date${buildQuery({ date })}`,
  );
}

export async function updateConsultingReview(
  userId: number,
  historyId: number,
  payload: UpdateConsultingReviewPayload,
) {
  return request<ConsultingHistoryReviewResponse>(
    `/api/users/${userId}/consulting-histories/${historyId}/review`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

export async function getVirtualInvestments(userId: number, holdingOnly?: boolean) {
  return request<VirtualInvestmentPositionResponse[]>(
    `/api/users/${userId}/virtual-investments${buildQuery({ holdingOnly })}`,
  );
}

export async function createVirtualInvestment(
  userId: number,
  payload: CreateVirtualInvestmentPayload,
) {
  return request<VirtualInvestmentPositionResponse>(`/api/users/${userId}/virtual-investments`, {
    method: 'POST',
    body: payload,
  });
}

export async function getSectorIndex(indexCode: string, marketDivisionCode = 'U') {
  return request<KisApiRawResponse>(
    `/api/kis/market/sectors/index-price${buildQuery({ indexCode, marketDivisionCode })}`,
  );
}

export async function getSectorConstituents(indexCode: string, marketDivisionCode = 'U') {
  return request<KisApiRawResponse>(
    `/api/kis/market/sectors/constituents${buildQuery({ indexCode, marketDivisionCode })}`,
  );
}

export interface VolumeRankQuery {
  marketDivisionCode?: string;
  screenDivisionCode?: string;
  inputIscd?: string;
  divisionClassCode?: string;
  belongingClassCode?: string;
  targetClassCode?: string;
  targetExcludeClassCode?: string;
  inputPrice1?: string;
  inputPrice2?: string;
  volumeCount?: string;
  inputDate1?: string;
}

export async function getVolumeRank(query: VolumeRankQuery = {}) {
  return request<KisApiRawResponse>(
    `/api/kis/market/rankings/volume-rank${buildQuery({
      marketDivisionCode: query.marketDivisionCode ?? 'J',
      screenDivisionCode: query.screenDivisionCode ?? '20171',
      inputIscd: query.inputIscd ?? '0000',
      divisionClassCode: query.divisionClassCode ?? '0',
      belongingClassCode: query.belongingClassCode ?? '0',
      targetClassCode: query.targetClassCode ?? '111111111',
      targetExcludeClassCode: query.targetExcludeClassCode ?? '0000000000',
      inputPrice1: query.inputPrice1 ?? '0',
      inputPrice2: query.inputPrice2 ?? '0',
      volumeCount: query.volumeCount ?? '0',
      inputDate1: query.inputDate1 ?? '0',
    })}`,
  );
}

export async function getTopUpdown(marketDivisionCode = 'J', screenDivisionCode = '20170', rankingSortCode = '0') {
  return request<KisApiRawResponse>(
    `/api/kis/market/rankings/top-updown${buildQuery({
      marketDivisionCode,
      screenDivisionCode,
      rankingSortCode,
    })}`,
  );
}

export interface MarketCapQuery {
  marketDivisionCode?: string;
  screenDivisionCode?: string;
  divisionClassCode?: string;
  inputIscd?: string;
  targetClassCode?: string;
  targetExcludeClassCode?: string;
  inputPrice1?: string;
  inputPrice2?: string;
  volumeCount?: string;
}

export async function getMarketCap(query: MarketCapQuery = {}) {
  return request<KisApiRawResponse>(
    `/api/kis/market/rankings/market-cap${buildQuery({
      marketDivisionCode: query.marketDivisionCode ?? 'J',
      screenDivisionCode: query.screenDivisionCode ?? '20174',
      divisionClassCode: query.divisionClassCode ?? '0',
      inputIscd: query.inputIscd ?? '0000',
      targetClassCode: query.targetClassCode ?? '0',
      targetExcludeClassCode: query.targetExcludeClassCode ?? '0',
      inputPrice1: query.inputPrice1 ?? '',
      inputPrice2: query.inputPrice2 ?? '',
      volumeCount: query.volumeCount ?? '',
    })}`,
  );
}

export async function getHoliday(baseDate: string) {
  return request<KisApiRawResponse>(`/api/kis/market/holiday${buildQuery({ baseDate })}`);
}

export function toSessionState(auth: AuthResponse): SessionState {
  return {
    user: auth.user,
    tokens: auth.tokens,
  };
}
