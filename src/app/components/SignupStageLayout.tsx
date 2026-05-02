import type { ReactNode } from 'react';
import { WheelOfFortune } from './WheelOfFortune';
import { VodaThemeLogo } from './logos/VodaLogo';

interface SignupStageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  contentScrollable?: boolean;
}

export function SignupStageLayout({
  title,
  description,
  children,
  contentScrollable = false,
}: SignupStageLayoutProps) {
  return (
    <div className="fi-page fi-mobile-screen">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-md flex-col px-5 sm:px-6">
        <div className="fi-auth-shell">
          <div className="mb-5 text-center max-[820px]:mb-4">
            <div className="mb-3 flex items-center justify-center max-[820px]:mb-2">
              <div className="origin-center scale-[0.82] max-[820px]:scale-[0.68] sm:scale-[0.9]">
                <VodaThemeLogo size={152} />
              </div>
            </div>
            <p className="text-xs fi-text-muted max-[820px]:text-[11px]">사주와 타로로 풀어내는 나만의 투자 운세</p>
          </div>

          <div className="mb-5 flex justify-center max-[820px]:mb-4">
            <div className="origin-top scale-[0.84] max-[820px]:scale-[0.66]">
              <WheelOfFortune />
            </div>
          </div>

          <div className="mb-5 space-y-2 max-[820px]:mb-4">
            <h2 className="text-center text-lg fi-text-main sm:text-xl">{title}</h2>
            <p className="text-center text-sm leading-6 fi-text-muted max-[820px]:text-xs max-[820px]:leading-5">{description}</p>
            <div className="fi-top-divider mx-auto h-px w-24" />
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              className={`fi-glass rounded-2xl p-5 sm:p-6 ${contentScrollable ? 'fi-mobile-scroll max-h-full' : ''}`}
            >
              {children}
            </div>

            <div className="pointer-events-none absolute -left-1 -top-1 h-16 w-16 rounded-tl-2xl border-l-2 border-t-2" style={{ borderColor: 'var(--app-accent-border)' }} />
            <div className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 rounded-br-2xl border-b-2 border-r-2" style={{ borderColor: 'var(--app-accent-border)' }} />
          </div>

          <div className="mt-5 text-center max-[820px]:mt-4">
            <p className="text-[11px] fi-text-subtle">© 2026 Voda. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
