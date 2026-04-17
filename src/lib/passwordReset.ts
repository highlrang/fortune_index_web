const PASSWORD_RESET_TOKEN_KEY = 'fortune-index-password-reset-token';

export { PASSWORD_RESET_TOKEN_KEY };

export function savePasswordResetToken(token: string) {
  localStorage.setItem(PASSWORD_RESET_TOKEN_KEY, token);
}

export function getPasswordResetToken() {
  return localStorage.getItem(PASSWORD_RESET_TOKEN_KEY) ?? '';
}

export function clearPasswordResetToken() {
  localStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
}
