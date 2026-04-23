const NATIVE_APP_UA_MARKER = 'MY_APP';
const AUTH_VERIFIED_PATH = '/auth/verified';
const AUTH_VERIFIED_DEEP_LINK = `voda://${AUTH_VERIFIED_PATH.replace(/^\//, '')}`;
const AUTH_VERIFIED_DEEP_LINK_ATTEMPT_KEY = 'voda-auth-verified-deep-link-attempted';

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function isNativeWebView() {
  return window.navigator.userAgent.includes(NATIVE_APP_UA_MARKER);
}

function hasAttemptedAuthVerifiedDeepLink() {
  try {
    return window.sessionStorage.getItem(AUTH_VERIFIED_DEEP_LINK_ATTEMPT_KEY) === 'true';
  } catch {
    return false;
  }
}

function markAuthVerifiedDeepLinkAttempted() {
  try {
    window.sessionStorage.setItem(AUTH_VERIFIED_DEEP_LINK_ATTEMPT_KEY, 'true');
  } catch {
    // Ignore storage failures and keep the deep link flow functional.
  }
}

export function buildAuthVerifiedQuery(email?: string) {
  const searchParams = new URLSearchParams();

  if (email?.trim()) {
    searchParams.set('email', email.trim());
  } else {
    searchParams.set('status', 'success');
  }

  return searchParams.toString();
}

export function getAuthVerifiedWebUrl(query = '') {
  const search = query ? `?${query}` : '';
  return `${window.location.origin}${AUTH_VERIFIED_PATH}${search}`;
}

export function openAuthVerifiedDeepLink(query = '') {
  if (!isMobileBrowser() || isNativeWebView()) return false;

  const search = query ? `?${query}` : '';
  const fallbackUrl = getAuthVerifiedWebUrl(query);

  markAuthVerifiedDeepLinkAttempted();
  window.location.href = `${AUTH_VERIFIED_DEEP_LINK}${search}`;

  window.setTimeout(() => {
    window.location.href = fallbackUrl;
  }, 1500);

  return true;
}

export function openAuthVerifiedDeepLinkOnce(query = '') {
  if (hasAttemptedAuthVerifiedDeepLink()) return false;
  return openAuthVerifiedDeepLink(query);
}
