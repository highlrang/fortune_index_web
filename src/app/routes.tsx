import { createBrowserRouter, redirect } from 'react-router';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ConsultationPage } from './pages/ConsultationPage';
import { ConsultationHistoryPage } from './pages/ConsultationHistoryPage';
import { TarotPickerPage } from './pages/TarotPickerPage';
import { TarotSpreadPage } from './pages/TarotSpreadPage';
import { TarotResultPage } from './pages/TarotResultPage';
import { InvestmentResultPage } from './pages/InvestmentResultPage';
import { MyPage } from './pages/MyPage';
import { LikedFortunesPage } from './pages/LikedFortunesPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { SignupEmailPendingPage } from './pages/SignupEmailPendingPage';
import { SignupEmailVerifiedPage } from './pages/SignupEmailVerifiedPage';
import { SignupProfilePage } from './pages/SignupProfilePage';
import { AuthVerifiedPage } from './pages/AuthVerifiedPage';
import { PasswordResetPage } from './pages/PasswordResetPage';
import { WealthLandingPage } from './pages/WealthLandingPage';
import { SubscriptionLandingPage } from './pages/SubscriptionLandingPage';
import { LogoShowcasePage } from './pages/LogoShowcasePage';
import { savePasswordResetToken } from '@/lib/passwordReset';
import { captureSignupVerificationParams } from '@/lib/signupVerification';

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

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginPage,
    loader: (args) => capturePasswordResetToken(args) ?? captureSignupEmailVerificationToken(args),
  },
  {
    path: '/signup',
    Component: SignupPage,
  },
  {
    path: '/signup/email-check',
    Component: SignupEmailPendingPage,
  },
  {
    path: '/signup/email/verified',
    Component: SignupEmailVerifiedPage,
  },
  {
    path: '/email/verify',
    Component: LoginPage,
    loader: (args) => capturePasswordResetToken(args) ?? captureSignupEmailVerificationToken(args),
  },
  {
    path: '/auth/verified',
    Component: AuthVerifiedPage,
  },
  {
    path: '/signup/profile',
    Component: SignupProfilePage,
  },
  {
    path: '/login',
    Component: LoginPage,
    loader: (args) => capturePasswordResetToken(args) ?? captureSignupEmailVerificationToken(args),
  },
  {
    path: '/password-reset',
    Component: PasswordResetPage,
    loader: capturePasswordResetToken,
  },
  {
    path: '/web/wealth',
    Component: WealthLandingPage,
  },
  {
    path: '/web/subscription',
    Component: SubscriptionLandingPage,
  },
  {
    path: '/voda',
    Component: LogoShowcasePage,
  },
  {
    path: '/logo-showcase',
    Component: LogoShowcasePage,
  },
  {
    path: '/home',
    Component: HomePage,
  },
  {
    path: '/consultation',
    Component: ConsultationPage,
  },
  {
    path: '/consultation-history',
    Component: ConsultationHistoryPage,
  },
  {
    path: '/tarot-picker',
    Component: TarotPickerPage,
  },
  {
    path: '/tarot-spread',
    Component: TarotSpreadPage,
  },
  {
    path: '/tarot-result',
    Component: TarotResultPage,
  },
  {
    path: '/investment-result',
    Component: InvestmentResultPage,
  },
  {
    path: '/my',
    Component: MyPage,
  },
  {
    path: '/liked-fortunes',
    Component: LikedFortunesPage,
  },
  {
    path: '/notifications',
    loader: () => {
      throw redirect('/home');
    },
  },
  {
    path: '/terms',
    Component: TermsPage,
  },
  {
    path: '/privacy',
    Component: PrivacyPolicyPage,
  },
  {
    path: '/refund-policy',
    Component: RefundPolicyPage,
  },
]);
