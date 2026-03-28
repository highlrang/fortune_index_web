import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { WheelOfFortune } from './WheelOfFortune';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-12">
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <h1 className="bg-gradient-to-r from-amber-200 to-yellow-300 bg-clip-text text-2xl font-medium text-transparent">
              Stock Oracle
            </h1>
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-sm text-white/50">사주와 타로로 풀어내는 나만의 투자 운세</p>
        </div>

        <div className="mb-12">
          <WheelOfFortune />
        </div>

        <div className="mb-8 space-y-2">
          <h2 className="text-center text-xl text-white">{title}</h2>
          <p className="text-center text-sm leading-6 text-white/60">{description}</p>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            {children}
          </div>

          <div className="pointer-events-none absolute -left-1 -top-1 h-16 w-16 rounded-tl-2xl border-l-2 border-t-2 border-amber-500/30" />
          <div className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 rounded-br-2xl border-b-2 border-r-2 border-amber-500/30" />
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-white/20">© 2024 Stock Oracle. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
