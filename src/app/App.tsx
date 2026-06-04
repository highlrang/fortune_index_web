import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { applyThemePreference, resolveInitialThemePreference } from '@/lib/theme';
import { getCurrentUser } from '@/lib/session';
import { setSelectedTarotDeckId } from '@/lib/tarot';
import { savePasswordResetToken } from '@/lib/passwordReset';
import { AUTH_REQUIRED_EVENT } from '@/lib/api/client';
import {
  captureSignupVerificationParams,
  getSignupVerificationEmail,
} from '@/lib/signupVerification';
import {
  buildAuthVerifiedQuery,
  getAuthVerifiedWebUrl,
  openAuthVerifiedDeepLink,
} from '@/lib/nativeDeepLink';

export default function App() {
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);

  useEffect(() => {
    if (!document.documentElement.classList.contains('is-native-webview')) return;

    window.__FORTUNE_NATIVE_TAROT_COMPLETE__ = (payload) => {
      router.navigate('/tarot-result', { state: payload });
    };

    return () => {
      delete window.__FORTUNE_NATIVE_TAROT_COMPLETE__;
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const {
      email,
      emailVerificationToken,
      status,
    } = captureSignupVerificationParams(searchParams);

    if (emailVerificationToken) {
      if (window.location.pathname !== '/signup/email/verified') {
        const query = buildAuthVerifiedQuery({
          email: email || getSignupVerificationEmail(),
          emailVerificationToken,
          status,
        });
        const openedDeepLink = openAuthVerifiedDeepLink(query);

        const targetUrl = getAuthVerifiedWebUrl(query);
        window.history.replaceState(null, '', targetUrl);

        if (!openedDeepLink) {
          window.location.replace(targetUrl);
        }
      }
    }

    const resetToken = searchParams.get('resetToken')?.trim() ?? '';

    if (resetToken) {
      savePasswordResetToken(resetToken);

      if (window.location.pathname !== '/password-reset') {
        window.history.replaceState(
          null,
          '',
          `/password-reset?resetToken=${encodeURIComponent(resetToken)}`,
        );
      }
    }

    const currentUser = getCurrentUser();
    const defaultTheme = currentUser?.darkModeEnabled === false ? 'light' : 'dark';

    if (currentUser?.preferredTarotDeckId) {
      setSelectedTarotDeckId(currentUser.preferredTarotDeckId);
    }

    applyThemePreference(resolveInitialThemePreference(defaultTheme));
  }, []);

  useEffect(() => {
    const handleAuthRequired = () => {
      if (window.location.pathname === '/' || window.location.pathname === '/login') return;
      setShowAuthRequiredModal(true);
    };

    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);

    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
    };
  }, []);

  const handleGoToLogin = () => {
    setShowAuthRequiredModal(false);
    router.navigate('/login');
  };

  return (
    <>
      <RouterProvider router={router} />
      <Dialog open={showAuthRequiredModal} onOpenChange={setShowAuthRequiredModal}>
        <DialogContent
          className="w-[calc(100%-2rem)] !max-w-md rounded-2xl border p-5 sm:!max-w-md"
          style={{
            borderColor: 'var(--app-surface-border)',
            backgroundColor: 'var(--app-surface-bg)',
            color: 'var(--tarot-text-main)',
            backdropFilter: 'var(--app-card-blur)',
            WebkitBackdropFilter: 'var(--app-card-blur)',
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg">로그인이 필요합니다</DialogTitle>
            <DialogDescription style={{ color: 'var(--app-text-muted)' }}>
              다시 로그인한 뒤 이용해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={handleGoToLogin}
              className="h-11 w-full rounded-full border text-sm font-semibold"
              style={{
                borderColor: 'var(--app-accent-border)',
                backgroundColor: 'var(--app-accent-soft)',
                color: 'var(--app-accent-text-strong)',
              }}
            >
              로그인 하러가기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: 'var(--app-surface-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--app-surface-border)',
          },
        }}
      />
    </>
  );
}
