import { createBrowserRouter, redirect } from 'react-router';
import { savePasswordResetToken } from '@/lib/passwordReset';
import { getSession } from '@/lib/session';
import { captureSignupVerificationParams } from '@/lib/signupVerification';

const lazyPage = <T extends Record<string, unknown>>(loader: () => Promise<T>, exportName: keyof T) => async () => ({
  Component: (await loader())[exportName],
});

function captureSignupEmailVerificationToken({ request }: { request: Request }) {
  const url = new URL(request.url);
  const { email, emailVerificationToken, status } = captureSignupVerificationParams(
    url.searchParams,
  );

  if (!emailVerificationToken) return null;

  const redirectSearchParams = new URLSearchParams();
  redirectSearchParams.set('emailVerificationToken', emailVerificationToken);

  if (email) {
    redirectSearchParams.set('email', email);
  }

  if (status) {
    redirectSearchParams.set('status', status);
  }

  throw redirect(`/signup/email/verified?${redirectSearchParams.toString()}`);
}

function capturePasswordResetToken({ request }: { request: Request }) {
  const url = new URL(request.url);
  const resetToken = url.searchParams.get('resetToken')?.trim() ?? '';

  if (!resetToken) return null;

  savePasswordResetToken(resetToken);
  if (url.pathname === '/password-reset') return null;

  throw redirect(`/password-reset?resetToken=${encodeURIComponent(resetToken)}`);
}

function redirectAuthenticatedUser() {
  if (getSession()) {
    throw redirect('/home');
  }

  return null;
}

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: lazyPage(() => import('./pages/LoginPage'), 'LoginPage'),
    loader: (args) =>
      redirectAuthenticatedUser()
      ?? capturePasswordResetToken(args)
      ?? captureSignupEmailVerificationToken(args),
  },
  {
    path: '/signup',
    lazy: lazyPage(() => import('./pages/SignupPage'), 'SignupPage'),
  },
  {
    path: '/signup/email-check',
    lazy: lazyPage(() => import('./pages/SignupEmailPendingPage'), 'SignupEmailPendingPage'),
  },
  {
    path: '/signup/email/verified',
    lazy: lazyPage(() => import('./pages/SignupEmailVerifiedPage'), 'SignupEmailVerifiedPage'),
  },
  {
    path: '/email/verify',
    lazy: lazyPage(() => import('./pages/LoginPage'), 'LoginPage'),
    loader: (args) => capturePasswordResetToken(args) ?? captureSignupEmailVerificationToken(args),
  },
  {
    path: '/auth/verified',
    lazy: lazyPage(() => import('./pages/AuthVerifiedPage'), 'AuthVerifiedPage'),
  },
  {
    path: '/signup/profile',
    lazy: lazyPage(() => import('./pages/SignupProfilePage'), 'SignupProfilePage'),
  },
  {
    path: '/login',
    lazy: lazyPage(() => import('./pages/LoginPage'), 'LoginPage'),
    loader: (args) =>
      redirectAuthenticatedUser()
      ?? capturePasswordResetToken(args)
      ?? captureSignupEmailVerificationToken(args),
  },
  {
    path: '/password-reset',
    lazy: lazyPage(() => import('./pages/PasswordResetPage'), 'PasswordResetPage'),
    loader: capturePasswordResetToken,
  },
  {
    path: '/web/wealth',
    lazy: lazyPage(() => import('./pages/WealthLandingPage'), 'WealthLandingPage'),
  },
  {
    path: '/web/subscription',
    lazy: lazyPage(() => import('./pages/SubscriptionLandingPage'), 'SubscriptionLandingPage'),
  },
  {
    path: '/voda',
    lazy: lazyPage(() => import('./pages/LogoShowcasePage'), 'LogoShowcasePage'),
  },
  {
    path: '/logo-showcase',
    lazy: lazyPage(() => import('./pages/LogoShowcasePage'), 'LogoShowcasePage'),
  },
  {
    path: '/home',
    lazy: lazyPage(() => import('./pages/HomePage'), 'HomePage'),
  },
  {
    path: '/consultation',
    lazy: lazyPage(() => import('./pages/ConsultationPage'), 'ConsultationPage'),
  },
  {
    path: '/consultation-history',
    lazy: lazyPage(() => import('./pages/ConsultationHistoryPage'), 'ConsultationHistoryPage'),
  },
  {
    path: '/tarot-picker',
    lazy: lazyPage(() => import('./pages/TarotPickerPage'), 'TarotPickerPage'),
  },
  {
    path: '/tarot-spread',
    lazy: lazyPage(() => import('./pages/TarotSpreadPage'), 'TarotSpreadPage'),
  },
  {
    path: '/tarot-result',
    lazy: lazyPage(() => import('./pages/TarotResultPage'), 'TarotResultPage'),
  },
  {
    path: '/investment-result',
    lazy: lazyPage(() => import('./pages/InvestmentResultPage'), 'InvestmentResultPage'),
  },
  {
    path: '/my',
    lazy: lazyPage(() => import('./pages/MyPage'), 'MyPage'),
  },
  {
    path: '/liked-fortunes',
    lazy: lazyPage(() => import('./pages/LikedFortunesPage'), 'LikedFortunesPage'),
  },
  {
    path: '/notifications',
    loader: () => {
      throw redirect('/home');
    },
  },
  {
    path: '/terms',
    lazy: lazyPage(() => import('./pages/TermsPage'), 'TermsPage'),
  },
  {
    path: '/privacy',
    lazy: lazyPage(() => import('./pages/PrivacyPolicyPage'), 'PrivacyPolicyPage'),
  },
  {
    path: '/refund-policy',
    lazy: lazyPage(() => import('./pages/RefundPolicyPage'), 'RefundPolicyPage'),
  },
]);
