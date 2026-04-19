import type { ReactNode } from 'react';
import { WheelOfFortune } from './WheelOfFortune';
import { VodaThemeLogo } from './logos/VodaLogo';

interface SignupStageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SignupStageLayout({
  title,
  description,
  children,
}: SignupStageLayoutProps) {
  return (
    <div className="fi-page min-h-screen">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-12">
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center">
            <VodaThemeLogo size={152} />
          </div>
          <p className="text-sm fi-text-muted">사주와 타로로 풀어내는 나만의 투자 운세</p>
        </div>

        <div className="mb-12">
          <WheelOfFortune />
        </div>

        <div className="mb-8 space-y-2">
          <h2 className="text-center text-xl fi-text-main">{title}</h2>
          <p className="text-center text-sm leading-6 fi-text-muted">{description}</p>
          <div className="fi-top-divider mx-auto h-px w-24" />
        </div>

        <div className="relative">
          <div className="fi-glass rounded-2xl p-8">
            {children}
          </div>

          <div className="pointer-events-none absolute -left-1 -top-1 h-16 w-16 rounded-tl-2xl border-l-2 border-t-2" style={{ borderColor: 'var(--app-accent-border)' }} />
          <div className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 rounded-br-2xl border-b-2 border-r-2" style={{ borderColor: 'var(--app-accent-border)' }} />
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs fi-text-subtle">© 2026 Voda. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
