const SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY = 'fortune-index-signup-email-verification-token';
const SIGNUP_EMAIL_VERIFICATION_EMAIL_KEY = 'fortune-index-signup-email-verification-email';

export { SIGNUP_EMAIL_VERIFICATION_TOKEN_KEY };

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
  const emailVerificationToken = searchParams.get('emailVerificationToken')?.trim() || '';
  const email = searchParams.get('email')?.trim() ?? '';
  const status = searchParams.get('status')?.trim().toLowerCase() ?? '';
  const isSuccess = status ? status === 'success' : Boolean(emailVerificationToken);

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
