import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { applyThemePreference, resolveInitialThemePreference } from '@/lib/theme';
import { getCurrentUser } from '@/lib/session';
import { setSelectedTarotDeckId } from '@/lib/tarot';
import { savePasswordResetToken } from '@/lib/passwordReset';
import {
  getSignupVerificationEmail,
  saveSignupEmailVerificationToken,
} from '@/lib/signupVerification';
import {
  buildAuthVerifiedQuery,
  getAuthVerifiedWebUrl,
  openAuthVerifiedDeepLink,
} from '@/lib/nativeDeepLink';

export default function App() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailVerificationToken =
      searchParams.get('emailVerificationToken')?.trim() ||
      searchParams.get('token')?.trim() ||
      '';

    if (emailVerificationToken) {
      saveSignupEmailVerificationToken(emailVerificationToken);

      if (window.location.pathname !== '/signup/email/verified') {
        const query = buildAuthVerifiedQuery({
          email: getSignupVerificationEmail(),
          emailVerificationToken,
        });
        const openedDeepLink = openAuthVerifiedDeepLink(query);

        window.history.replaceState(null, '', getAuthVerifiedWebUrl(query));

        if (!openedDeepLink) {
          window.location.replace(getAuthVerifiedWebUrl(query));
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

  return (
    <>
      <RouterProvider router={router} />
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
