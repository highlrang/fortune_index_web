import type { Router } from 'react-router';

type AppHistoryEntry = {
  key: string;
  path: string;
  state: unknown;
};

const MAX_STACK_SIZE = 80;

let historyStack: AppHistoryEntry[] = [];
let activeRouter: Router | null = null;

function normalizePath(location: { pathname: string; search: string; hash: string }) {
  return `${location.pathname}${location.search}${location.hash}`;
}

function createEntry(location: { key?: string; pathname: string; search: string; hash: string; state?: unknown }) {
  return {
    key: location.key ?? normalizePath(location),
    path: normalizePath(location),
    state: location.state,
  };
}

function isSameEntry(left: AppHistoryEntry | undefined, right: AppHistoryEntry) {
  return Boolean(left && left.key === right.key && left.path === right.path);
}

function rememberNavigation(
  action: 'POP' | 'PUSH' | 'REPLACE',
  location: { key?: string; pathname: string; search: string; hash: string; state?: unknown },
) {
  const nextEntry = createEntry(location);
  const currentEntry = historyStack[historyStack.length - 1];

  if (isSameEntry(currentEntry, nextEntry)) return;

  if (action === 'POP') {
    const existingIndex = historyStack.findIndex((entry) => entry.key === nextEntry.key);

    if (existingIndex >= 0) {
      historyStack = historyStack.slice(0, existingIndex + 1);
      return;
    }

    historyStack.push(nextEntry);
  } else if (action === 'REPLACE') {
    if (historyStack.length === 0) {
      historyStack = [nextEntry];
    } else {
      historyStack = [...historyStack.slice(0, -1), nextEntry];
    }
  } else {
    historyStack.push(nextEntry);
  }

  if (historyStack.length > MAX_STACK_SIZE) {
    historyStack = historyStack.slice(historyStack.length - MAX_STACK_SIZE);
  }
}

export function navigateAppBack() {
  if (!activeRouter) return false;

  if (historyStack.length <= 1) return false;

  historyStack = historyStack.slice(0, -1);
  const previousEntry = historyStack[historyStack.length - 1];

  activeRouter.navigate(previousEntry.path, {
    replace: true,
    state: previousEntry.state,
  });

  return true;
}

export function setupAppBackNavigation(router: Router) {
  activeRouter = router;
  historyStack = [createEntry(router.state.location)];

  const unsubscribe = router.subscribe((state) => {
    rememberNavigation(state.historyAction, state.location);
  });

  const handleNativeBackEvent = (event: Event) => {
    if (navigateAppBack()) {
      event.preventDefault();
    }
  };

  window.__FORTUNE_NATIVE_GO_BACK__ = navigateAppBack;
  window.__FORTUNE_NATIVE_BACK__ = navigateAppBack;
  window.addEventListener('fortune:native-back', handleNativeBackEvent);

  return () => {
    unsubscribe();
    window.removeEventListener('fortune:native-back', handleNativeBackEvent);
    delete window.__FORTUNE_NATIVE_GO_BACK__;
    delete window.__FORTUNE_NATIVE_BACK__;

    if (activeRouter === router) {
      activeRouter = null;
      historyStack = [];
    }
  };
}
