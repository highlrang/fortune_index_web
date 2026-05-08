import {
  clearSession,
  getAccessToken,
  getSession,
  saveSession,
  type SessionState,
} from '../session';
import { getOptionalEnv, requireEnv } from '../env';

const API_BASE_URL = requireEnv('VITE_API_BASE_URL');
const API_KEY = getOptionalEnv('VITE_API_KEY');

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;

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

let refreshPromise: Promise<boolean> | null = null;
const LAST_AUTH_FAILURE_KEY = 'fortune-index-last-auth-failure';

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await performRequest(path, options);
  } catch (error) {
    throw normalizeUnknownError(error);
  }

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
  return !isPublicAuthPath(path);
}

function shouldAttemptRefresh(path: string, options: RequestOptions) {
  if (options.skipAuthRefresh) return false;
  if (!getSession()?.tokens.refreshToken) return false;
  if (path === '/api/auth/refresh') return false;
  return !(isPublicAuthPath(path) || path === '/api/auth/logout');
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

      if (response.status === 401) {
        clearSessionAfterAuthFailure({
          reason: 'refresh_unauthorized',
          status: response.status,
          payload,
        });
        return false;
      }

      if (!response.ok || !payload || typeof payload !== 'object' || !('tokens' in payload)) {
        recordAuthFailure({
          reason: 'refresh_failed',
          status: response.status,
          payload,
        });
        return false;
      }

      const refreshedSession = toRefreshedSessionState(session, payload);
      if (!refreshedSession) {
        return false;
      }

      saveSession(refreshedSession);
      return true;
    } catch (error) {
      recordAuthFailure({
        reason: 'refresh_request_error',
        error: error instanceof Error ? error.message : String(error),
      });
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
      return localizeErrorMessage(payload.message, status);
    }
    if ('error' in payload && typeof payload.error === 'string') {
      return localizeErrorMessage(payload.error, status);
    }
  }

  if (typeof payload === 'string' && payload.trim()) {
    return localizeErrorMessage(payload, status);
  }

  if (status === 401) return '인증이 필요합니다.';
  if (status === 403) return '권한이 없습니다.';
  if (status === 404) return '요청한 데이터를 찾을 수 없습니다.';
  if (status === 503) return '서버가 일시적으로 응답하지 않습니다.';
  return '요청 처리 중 오류가 발생했습니다.';
}

function localizeErrorMessage(message: string, status?: number) {
  const normalized = message.trim();
  if (!normalized) {
    return fallbackStatusMessage(status);
  }

  const lowered = normalized.toLowerCase();

  if (
    lowered === 'unauthorized' ||
    lowered === '401 unauthorized' ||
    lowered.includes('unauthorized') ||
    lowered.includes('access token') ||
    lowered.includes('jwt')
  ) {
    return '인증이 필요합니다.';
  }

  if (
    lowered === 'forbidden' ||
    lowered === '403 forbidden' ||
    lowered.includes('forbidden') ||
    lowered.includes('access denied')
  ) {
    return '권한이 없습니다.';
  }

  if (
    lowered === 'not found' ||
    lowered === '404 not found' ||
    lowered.includes('not found')
  ) {
    return '요청한 데이터를 찾을 수 없습니다.';
  }

  if (
    lowered.includes('failed to fetch') ||
    lowered.includes('networkerror') ||
    lowered.includes('network error') ||
    lowered.includes('load failed') ||
    lowered.includes('fetch failed')
  ) {
    return '네트워크 연결을 확인해주세요.';
  }

  if (
    lowered.includes('timeout') ||
    lowered.includes('timed out') ||
    lowered.includes('request timeout')
  ) {
    return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  }

  if (
    lowered.includes('internal server error') ||
    lowered === '500' ||
    lowered === '500 internal server error'
  ) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (
    lowered.includes('service unavailable') ||
    lowered === '503' ||
    lowered === '503 service unavailable'
  ) {
    return '서버가 일시적으로 응답하지 않습니다.';
  }

  if (/^\d{3}\s+[a-z]/i.test(normalized)) {
    return fallbackStatusMessage(status);
  }

  return normalized;
}

function fallbackStatusMessage(status?: number) {
  if (status === 400) return '잘못된 요청입니다.';
  if (status === 401) return '인증이 필요합니다.';
  if (status === 403) return '권한이 없습니다.';
  if (status === 404) return '요청한 데이터를 찾을 수 없습니다.';
  if (status === 408) return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  if (status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  if (status === 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  if (status === 503) return '서버가 일시적으로 응답하지 않습니다.';
  return '요청 처리 중 오류가 발생했습니다.';
}

function clearSessionAfterAuthFailure(details: Record<string, unknown>) {
  clearSession();
  recordAuthFailure(details);
}

function recordAuthFailure(details: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const failure = {
    ...details,
    path: window.location.pathname,
    recordedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(LAST_AUTH_FAILURE_KEY, JSON.stringify(failure));
  console.warn('[auth] token refresh failed', failure);
}

function normalizeUnknownError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new Error(localizeErrorMessage(error.message));
  }

  if (typeof error === 'string') {
    return new Error(localizeErrorMessage(error));
  }

  return new Error('요청 처리 중 오류가 발생했습니다.');
}

export function buildQuery(params: Record<string, QueryValue | QueryValue[] | Record<string, unknown>>) {
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

function isPublicAuthPath(path: string) {
  return (
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/signup') ||
    path.startsWith('/api/auth/signup/email/request') ||
    path.startsWith('/api/auth/password-reset') ||
    path.startsWith('/api/auth/email/request') ||
    path.startsWith('/api/auth/email/status')
  );
}

function toRefreshedSessionState(currentSession: SessionState, payload: unknown): SessionState | null {
  if (!payload || typeof payload !== 'object' || !('tokens' in payload)) {
    return null;
  }

  const partialAuth = payload as Partial<SessionState>;

  return {
    user: partialAuth.user ?? currentSession.user,
    tokens: partialAuth.tokens ?? currentSession.tokens,
  };
}
