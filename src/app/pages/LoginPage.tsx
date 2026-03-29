import { WheelOfFortune } from '../components/WheelOfFortune';
import { LoginForm } from '../components/LoginForm';
import { Sparkles } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="fi-page min-h-screen">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      {/* Main container */}
      <div className="relative mx-auto max-w-md px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 fi-text-accent" />
            <h1 className="text-2xl font-medium fi-text-main">
              Stock Oracle
            </h1>
            <Sparkles className="h-6 w-6 fi-text-accent" />
          </div>
          <p className="text-sm fi-text-muted">
            사주와 타로로 풀어내는 나만의 투자 운세
          </p>
        </div>

        {/* Wheel of Fortune */}
        <div className="mb-12">
          <WheelOfFortune />
        </div>

        {/* Title */}
        <div className="mb-8 space-y-2">
          <h2 className="text-center text-xl fi-text-main">로그인</h2>
          <div className="fi-top-divider mx-auto h-px w-24" />
        </div>

        {/* Form */}
        <div className="relative">
          {/* Glassmorphism container */}
          <div className="fi-glass rounded-2xl p-8">
            <LoginForm />
          </div>

          {/* Decorative corner accents */}
          <div className="pointer-events-none absolute -left-1 -top-1 h-16 w-16 rounded-tl-2xl border-l-2 border-t-2" style={{ borderColor: 'var(--app-accent-border)' }} />
          <div className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 rounded-br-2xl border-b-2 border-r-2" style={{ borderColor: 'var(--app-accent-border)' }} />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs fi-text-subtle">
            © 2024 Stock Oracle. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
