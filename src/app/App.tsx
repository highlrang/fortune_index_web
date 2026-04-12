import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { applyThemePreference, resolveInitialThemePreference } from '@/lib/theme';
import { getCurrentUser } from '@/lib/session';
import { setSelectedTarotDeckId } from '@/lib/tarot';

export default function App() {
  useEffect(() => {
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
