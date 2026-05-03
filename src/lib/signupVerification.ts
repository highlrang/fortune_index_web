const SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY = 'fortune-index-signup-email-verification-token';
const SIGNUP_EMAIL_VERIFICATION_EMAIL_KEY = 'fortune-index-signup-email-verification-email';

const EMAIL_VERIFICATION_TOKEN_PARAM_KEYS = [
  'emailVerificationToken',
  'verificationToken',
  'token',
  'emailToken',
] as const;

const EMAIL_PARAM_KEYS = ['email', 'loginId'] as const;

const SUCCESS_STATUS_VALUES = new Set(['success', 'verified', 'ok']);

export { SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY };

function getFirstSearchParam(searchParams: URLSearchParams, keys: readonly string[]) {
  for (const key of keys) {
    const value = searchParams.get(key)?.trim();
    if (value) return value;
  }

  return '';
}

export function saveSignupVerificationEmail(email: string) {
  localStorage.setItem(SIGNUP_EMAIL_VERIFICATION_EMAIL_KEY, email);
}

export function getSignupVerificationEmail() {
  return localStorage.getItem(SIGNUP_EMAIL_VERIFICATION_EMAIL_KEY) ?? '';
}

export function saveSignupEmailVerificationToken(token: string) {
  localStorage.setItem(SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY, token);
}

export function getSignupEmailVerificationToken() {
  return localStorage.getItem(SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY) ?? '';
}

export function captureSignupVerificationParams(searchParams: URLSearchParams) {
  const emailVerificationToken = getFirstSearchParam(
    searchParams,
    EMAIL_VERIFICATION_TOKEN_PARAM_KEYS,
  );
  const email = getFirstSearchParam(searchParams, EMAIL_PARAM_KEYS);
  const status = searchParams.get('status')?.trim().toLowerCase() ?? '';
  const isSuccess = status
    ? SUCCESS_STATUS_VALUES.has(status)
    : Boolean(emailVerificationToken);

  if (email) {
    saveSignupVerificationEmail(email);
  }

  if (emailVerificationToken) {
    saveSignupEmailVerificationToken(emailVerificationToken);
  }

  return {
    email,
    emailVerificationToken,
    status,
    isSuccess,
  };
}

export function clearSignupEmailVerification() {
  localStorage.removeItem(SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY);
  localStorage.removeItem(SIGNUP_EMAIL_VERIFICATION_EMAIL_KEY);
}
