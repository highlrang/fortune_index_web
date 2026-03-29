export type ThemePreference = 'dark' | 'light';

const THEME_STORAGE_KEY = 'fortune-index-theme';

function canUseDom() {
  return typeof document !== 'undefined';
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredThemePreference(): ThemePreference | null {
  if (!canUseStorage()) return null;

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return null;
}

export function hasStoredThemePreference() {
  return getStoredThemePreference() !== null;
}

export function applyThemePreference(theme: ThemePreference) {
  if (!canUseDom()) return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.classList.toggle('dark', theme === 'dark');
}

export function persistThemePreference(theme: ThemePreference) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function resolveInitialThemePreference(defaultTheme: ThemePreference = 'dark') {
  return getStoredThemePreference() ?? defaultTheme;
}
