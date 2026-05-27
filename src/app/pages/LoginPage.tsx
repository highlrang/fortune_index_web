import { WheelOfFortune } from '../components/WheelOfFortune';
import { LoginForm } from '../components/LoginForm';
import { VodaThemeLogo } from '../components/logos/VodaLogo';

export function LoginPage() {
  return (
    <div className="fi-page fi-mobile-screen-scrollable overflow-y-auto">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      {/* Main container */}
      <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col px-5">
        <div className="fi-auth-shell">
        {/* Header */}
        <div className="mb-5 text-center max-[820px]:mb-4">
          <div className="mb-3 flex items-center justify-center max-[820px]:mb-2">
            <div className="scale-[0.94] max-[820px]:scale-[0.82] sm:scale-100">
              <VodaThemeLogo size={168} />
            </div>
          </div>
          <p className="text-sm leading-5 fi-text-muted">
            사주, 타로, 별자리로 읽는 나만의 재물 흐름
          </p>
        </div>

        {/* Wheel of Fortune */}
        <div className="mb-4 flex justify-center max-[820px]:mb-3">
          <div className="-my-3 scale-[0.84] max-[820px]:scale-[0.66]">
            <WheelOfFortune />
          </div>
        </div>

        {/* Title */}
        <div className="mb-4 space-y-2 max-[820px]:mb-3">
          <h2 className="text-center text-xl fi-text-main sm:text-2xl">로그인</h2>
          <div className="fi-top-divider mx-auto h-px w-24" />
        </div>

        {/* Form */}
        <div className="relative">
          {/* Glassmorphism container */}
          <div className="fi-glass rounded-2xl p-5 sm:p-6">
            <LoginForm />
          </div>

          {/* Decorative corner accents */}
          <div className="pointer-events-none absolute -left-1 -top-1 h-16 w-16 rounded-tl-2xl border-l-2 border-t-2" style={{ borderColor: 'var(--app-accent-border)' }} />
          <div className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 rounded-br-2xl border-b-2 border-r-2" style={{ borderColor: 'var(--app-accent-border)' }} />
        </div>

        {/* Footer */}
        <div className="mt-5 text-center max-[820px]:mt-4">
          <p className="text-xs fi-text-subtle">
            © 2026 Voda. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
