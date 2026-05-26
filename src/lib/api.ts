import type { SessionState } from './session';
import { buildQuery, request } from './api/client';
export { ApiError, resolveApiAssetUrl } from './api/client';

export type SubscriptionTier = 'FREE' | 'PREMIUM';
export type InvestmentRiskProfile = 'STABLE' | 'AGGRESSIVE';
export type ConsultMode =
  | 'INVESTMENT_SAJU'
  | 'INVESTMENT_TAROT'
  | 'INVESTMENT_ZODIAC'
  | 'INVESTMENT_ALL';
export type ConsultScenario =
  | 'TIMING_ENTRY'
  | 'TIMING_EXIT'
  | 'SAJU_MATCH'
  | 'RESCUE_PLAN'
  | 'MENTAL_GUIDE';

export interface LocalTimeValue {
  hour: number;
  minute: number;
  second?: number;
  nano?: number;
}

export interface AuthUserResponse {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  subscriptionTier: SubscriptionTier;
  preferredTarotDeckId?: string | null;
  investmentRiskProfile: InvestmentRiskProfile;
  preferredSectors: string[];
}

export interface CurrentUserResponse extends AuthUserResponse {
  birthDate: string;
  birthTime?: LocalTimeValue | null;
  gender: 'F' | 'M';
  profileImageUrl?: string | null;
  notificationEnabled: boolean;
  darkModeEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
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

export interface EmailVerificationRequestResponse {
  email: string;
  purpose: string;
  expiresAt: string;
}

export interface PasswordResetRequestResponse {
  email: string;
  purpose: 'PASSWORD_RESET';
  expiresAt: string;
}

export interface MessageResponse {
  message: string;
}

export interface CreateInquiryPayload {
  category: 'SERVICE' | 'BILLING' | 'TECHNICAL' | 'OTHER';
  content: string;
}

export interface EmailVerificationStatusResponse {
  status: string;
  emailVerificationToken?: string;
}

export interface ScenarioOptionResponse {
  code: string;
  title: string;
  description: string;
}

export interface HomeFortuneResponse {
  name: string;
  summary: string;
}

export interface HomeTarotResponse {
  name: string;
  summary: string;
}

export interface HomeZodiacResponse {
  name: string;
  summary: string;
}

export interface HomeSummaryResponse {
  summary: string;
  saju: HomeFortuneResponse;
  tarot: HomeTarotResponse;
  zodiac: HomeZodiacResponse;
}

export interface FocusConsultResponse {
  label: string;
  currentValue: number;
  changeRate: number;
  interestArea: string;
  fallback: boolean;
}

export interface FocusSnapshotResponse {
  label: string;
  currentValue: number;
  changeRate: number;
  capturedAt: string;
}

export interface SajuCoreEnergy {
  symbol: string;
  fiveElement: string;
  yinYang: string;
}

export interface SajuAnalysisResult {
  natalChart: unknown;
  keyPalaces: unknown;
  characters: unknown[];
  tenGods: unknown[];
  fiveElementBalance: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  yinYangBalance: {
    yinCount: number;
    yangCount: number;
    totalCount: number;
  };
  annualFortune: unknown;
  majorFortune: unknown;
}

export interface SajuConsultingResult {
  analysis: SajuAnalysisResult;
  dayMaster: SajuCoreEnergy;
  dayBranch: SajuCoreEnergy;
  monthBranch: SajuCoreEnergy;
  currentFortune: unknown;
}

export interface SajuSnapshotResponse {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  summary: string;
}

export interface TarotCardConsultResponse {
  selectedIndex: number;
  code: string;
  deckType: 'TAROT' | 'ORACLE';
  deckRole: 'MAIN' | 'ASSISTANT';
  deckVersionId: string;
  cardSetId: string;
  name: string;
  koreanName?: string;
  sortOrder: number;
  arcanaType?: string | null;
  suit?: string | null;
  meaning: string;
  description?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface TarotDeckConsultResponse {
  deckVersionId: string;
  deckType: 'TAROT' | 'ORACLE';
  deckRole: 'MAIN' | 'ASSISTANT';
  cardSetId: string;
  cards: TarotCardConsultResponse[];
}

export interface TarotConsultResponse {
  interpretationMode: 'MAIN_TRADITIONAL';
  cards: TarotCardConsultResponse[];
  assistantDecks: TarotDeckConsultResponse[];
}

export interface TarotCardHistoryResponse {
  selectedIndex: number;
  code: string;
  deckType: string;
  deckRole: string;
  deckVersionId?: string;
  cardSetId?: string;
  name: string;
  koreanName?: string;
  cardNumber: number;
  sortOrder: number;
  arcanaType?: string | null;
  suit?: string | null;
  meaning: string;
  description?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface TarotDeckHistoryResponse {
  deckVersionId?: string;
  deckType: string;
  deckRole: string;
  cardSetId?: string;
  cards: TarotCardHistoryResponse[];
}

export interface TarotSnapshotResponse {
  interpretationMode?: string;
  summary: string;
  cards: TarotCardHistoryResponse[];
  assistantDecks: TarotDeckHistoryResponse[];
}

export interface AnalysisSectionPayload {
  title: string;
  content: string;
}

export interface AnalysisResultsPayload {
  investment_analysis?: AnalysisSectionPayload;
  tarot_analysis?: AnalysisSectionPayload;
  saju_analysis?: AnalysisSectionPayload;
  zodiac_analysis?: AnalysisSectionPayload;
}

export interface ConsultingHistoryAnalysisResponse {
  saju: string | null;
  tarot: string | null;
  zodiac: string | null;
}

export interface HybridConsultingAiResponse {
  provider: 'GEMINI';
  model: string;
  mode: string;
  analysisResults: AnalysisResultsPayload;
  finalAdvice: string;
  riskScore?: number;
  rawJson: string;
  evidence: {
    grounded: boolean;
    citations: Array<{
      title: string;
      url: string;
    }>;
  };
}

export interface SharedConsultingHistoryResponse {
  id: number;
  userId: number;
  mode: ConsultMode;
  scenario?: ConsultScenario;
  shareKey: string;
  consultedAt: string;
  focus: FocusSnapshotResponse;
  saju?: SajuSnapshotResponse;
  tarot?: TarotSnapshotResponse;
  question?: string;
  riskScore?: number | null;
  overallSummary: string;
  analysis: ConsultingHistoryAnalysisResponse;
  analysisResultJson: string;
  aiResponseJson: string;
  retro?: Record<string, unknown> | null;
}

export interface ConsultResponse {
  mode: ConsultMode;
  focus: FocusConsultResponse;
  saju?: SajuConsultingResult;
  tarot?: TarotConsultResponse;
  ai: HybridConsultingAiResponse;
  history: SharedConsultingHistoryResponse;
  disclaimer?: string;
}

export interface DailyRiskIndexResponse {
  userId: number;
  date: string;
  riskScore: number;
  energyLabel: string;
  riskFlags: string[];
  disclaimer: string;
}

export interface TokenRefreshPayload {
  refreshToken: string;
}

export interface PasswordResetConfirmPayload {
  resetToken: string;
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
  investmentRiskProfile?: InvestmentRiskProfile;
  preferredSectors?: string[];
  notificationEnabled?: boolean;
  darkModeEnabled?: boolean;
}

export interface PageableQuery {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageResponse<T> {
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
  numberOfElements?: number;
  size?: number;
  number?: number;
  empty?: boolean;
  content?: T[];
  pageable?: {
    pageNumber?: number;
    pageSize?: number;
  };
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

export interface ConsultingHistoryListItemResponse {
  id: number;
  shareKey: string;
  mode: ConsultMode;
  scenario?: ConsultScenario;
  focusLabel: string;
  question?: string;
  consultedAt: string;
  overallSummary: string;
  analysis: ConsultingHistoryAnalysisResponse;
  tarotInterpretationMode?: string;
  tarotCardCodes: string[];
  tarotCardNames: string[];
}

export interface ConsultingHistoryReviewResponse {
  satisfaction?: 'HELPFUL' | 'NOT_HELPFUL' | string;
  realizedProfitRate?: number;
  reviewNote?: string;
  reviewedAt?: string;
  reviewed: boolean;
}

export interface ConsultingHistorySummaryResponse {
  id: number;
  mode?: ConsultMode;
  scenario?: ConsultScenario;
  consultedAt: string;
  selectedFocusLabel?: string;
  currentValue?: number | null;
  changeRate?: number | null;
  tarotInterpretationMode?: string | null;
  tarotCardCodes: string[];
  tarotCardNames: string[];
  feedback?: 'HELPFUL' | 'NOT_HELPFUL' | string | null;
  realizedProfitRate?: number | null;
  retrospectedAt?: string | null;
}

export interface ConsultingHistoryLikeResponse {
  historyId: number;
  liked: boolean;
  satisfaction?: 'HELPFUL' | 'NOT_HELPFUL' | string | null;
  reviewedAt?: string | null;
}

export interface ConsultingHistoryDateItemResponse {
  id: number;
  consultedAt: string;
  mode: ConsultMode;
  scenario?: ConsultScenario;
  label: ConsultingHistoryDateLabelResponse;
  shareKey: string;
  selectedFocusLabel: string;
  overallSummary: string;
  analysis?: ConsultingHistoryAnalysisResponse;
  focus: FocusSnapshotResponse;
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

export interface SignUpPayload {
  name: string;
  emailVerificationToken: string;
  password: string;
  birthDate: string;
  birthTime?: string;
  gender?: 'F' | 'M';
  investmentRiskProfile: InvestmentRiskProfile;
  preferredSectors: string[];
}

export interface AssistantDeckSelectionRequest {
  deckVersionId: string;
  selectedIndices?: number[];
}

export interface ConsultPayload {
  userId: number;
  mode: ConsultMode;
  scenario?: ConsultScenario;
  focusLabel?: string;
  tarotIndices?: number[];
  tarotDeckVersionId?: string;
  assistantDeckSelections?: AssistantDeckSelectionRequest[];
  tarotInterpretationMode?: 'MAIN_TRADITIONAL';
  question?: string;
  referenceDateTime?: string;
}

export interface TarotDeckVersionResponse {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string | null;
  active: boolean;
  deckType?: 'TAROT' | 'ORACLE';
  deckRole?: 'MAIN' | 'ASSISTANT';
  cardSetId?: string;
  drawCount?: number;
  requiredSubscriptionTier?: SubscriptionTier;
  selected?: boolean;
}

export interface TarotDeckCardResponse {
  selectedIndex: number;
  code: string;
  deckVersionId: string;
  deckType: 'TAROT' | 'ORACLE';
  deckRole?: 'MAIN' | 'ASSISTANT';
  cardSetId?: string;
  name: string;
  koreanName?: string;
  sortOrder: number;
  arcanaType?: string;
  suit?: string;
  meaning: string;
  description?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  cardNumber?: number;
}

export interface HomeDailyTarotDrawCardResponse {
  index: number;
  card: TarotDeckCardResponse;
}

export interface HomeDailyTarotDrawResponse {
  drawDate: string;
  drawn: boolean;
  canDraw: boolean;
  drawnAt?: string | null;
  deckVersionId?: string | null;
  cards: HomeDailyTarotDrawCardResponse[];
}

export interface SaveHomeDailyTarotDrawPayload {
  tarotDeckVersionId: string;
  tarotIndices: number[];
}

export interface BirthTarotProfileResponse {
  deckVersionId?: string;
  name?: string;
  koreanName?: string;
  number?: number;
  cardMeaning?: string;
  cardDescription?: string;
  birthMeaning?: string;
  birthDescription?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface SajuDescriptionResponse {
  name?: string;
  summary?: string;
}

export interface SajuProfileResponse {
  palza?: string[];
  ohang?: {
    wood?: number;
    fire?: number;
    earth?: number;
    metal?: number;
    water?: number;
  };
  ilju?: SajuDescriptionResponse | null;
  wolji?: SajuDescriptionResponse | null;
  daeun?: SajuDescriptionResponse | null;
  sewun?: SajuDescriptionResponse | null;
}

export interface ZodiacProfileResponse {
  sign?: string;
  englishName?: string;
  dateRange?: string;
  element?: string;
  elementDescription?: string;
  keyword?: string;
  keywordDescription?: string;
  summary?: string;
  traits?: string[];
  traitDetails?: Array<{
    name?: string;
    description?: string;
  }>;
  strengths?: string[];
  cautions?: string[];
  moneyStyle?: string;
  investmentTendency?: string;
  careTip?: string;
}

export interface AstrologyProfileResponse {
  moonSign?: string;
  risingSign?: string;
  sunSign?: string;
}

export interface UserProfileDetailsResponse {
  birthTarot?: BirthTarotProfileResponse | null;
  saju?: SajuProfileResponse | null;
  zodiac?: ZodiacProfileResponse | null;
  astrology?: AstrologyProfileResponse | null;
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/api/auth/login', { method: 'POST', body: payload });
}

export async function signup(payload: SignUpPayload) {
  return request<AuthResponse>('/api/auth/signup', { method: 'POST', body: payload });
}

export async function requestSignupEmailVerification(email: string) {
  return request<EmailVerificationRequestResponse>('/api/auth/signup/email/request', {
    method: 'POST',
    body: { email },
  });
}

export async function getEmailVerificationStatus(email: string) {
  return request<EmailVerificationStatusResponse>(
    `/api/auth/email/status${buildQuery({ email })}`,
  );
}

export async function getMe() {
  return request<CurrentUserResponse>('/api/auth/me');
}

export async function getMyProfileDetails() {
  return request<UserProfileDetailsResponse>('/api/users/me/profile-details');
}

export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  return request<CurrentUserResponse>('/api/users/me', {
    method: 'PATCH',
    body: payload,
  });
}

export async function createInquiry(payload: CreateInquiryPayload) {
  return request<MessageResponse>('/api/support/inquiries', {
    method: 'POST',
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

export async function requestPasswordResetEmail(email: string) {
  return request<PasswordResetRequestResponse>('/api/auth/password-reset/request', {
    method: 'POST',
    body: { email },
  });
}

export async function confirmPasswordReset(payload: PasswordResetConfirmPayload) {
  return request<MessageResponse>('/api/auth/password-reset/confirm', {
    method: 'POST',
    body: payload,
  });
}

export async function getHomeSummary() {
  return request<HomeSummaryResponse>('/api/v1/home/summary');
}

export async function getHomeDailyTarotDraw() {
  return request<HomeDailyTarotDrawResponse>('/api/v1/home/tarot/daily-draw');
}

export async function saveHomeDailyTarotDraw(payload: SaveHomeDailyTarotDrawPayload) {
  return request<HomeDailyTarotDrawResponse>('/api/v1/home/tarot/daily-draw', {
    method: 'POST',
    body: payload,
  });
}

export async function getScenarios() {
  return request<ScenarioOptionResponse[]>('/api/scenarios');
}

export async function getDailyRiskIndex(userId: number) {
  return request<DailyRiskIndexResponse>(`/api/daily-risk-index${buildQuery({ userId })}`);
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

export async function getLikedConsultingHistories(userId: number, pageable: PageableQuery = {}) {
  const query = buildQuery({
    page: pageable.page,
    size: pageable.size,
    sort: pageable.sort,
  });

  return request<PageResponse<ConsultingHistorySummaryResponse>>(
    `/api/users/${userId}/consulting-histories/liked${query}`,
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

export async function likeConsultingHistory(userId: number, historyId: number) {
  return request<ConsultingHistoryLikeResponse>(
    `/api/users/${userId}/consulting-histories/${historyId}/liked`,
    {
      method: 'POST',
    },
  );
}

export async function unlikeConsultingHistory(userId: number, historyId: number) {
  return request<ConsultingHistoryLikeResponse>(
    `/api/users/${userId}/consulting-histories/${historyId}/liked`,
    {
      method: 'DELETE',
    },
  );
}

export function toSessionState(auth: AuthResponse): SessionState {
  return {
    user: auth.user,
    tokens: auth.tokens,
  };
}
