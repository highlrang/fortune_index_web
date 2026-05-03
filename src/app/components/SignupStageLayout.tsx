import { useEffect, useRef, useState, type ReactNode } from 'react';
import { WheelOfFortune } from './WheelOfFortune';
import { VodaThemeLogo } from './logos/VodaLogo';

interface SignupStageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  contentScrollable?: boolean;
  pageScrollable?: boolean;
}

export function SignupStageLayout({
  title,
  description,
  children,
  contentScrollable = false,
  pageScrollable = false,
}: SignupStageLayoutProps) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const baselineViewportHeightRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const viewport = window.visualViewport;
    const getViewportHeight = () => viewport?.height ?? window.innerHeight;
    const isEditableElement = (element: Element | null) =>
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement ||
      (element instanceof HTMLElement && element.isContentEditable);

    const syncKeyboardState = () => {
      const currentHeight = getViewportHeight();
      const baselineHeight = baselineViewportHeightRef.current || currentHeight;

      if (!baselineViewportHeightRef.current || currentHeight > baselineHeight) {
        baselineViewportHeightRef.current = currentHeight;
      }

      const activeElement = document.activeElement;
      const heightDelta = baselineViewportHeightRef.current - currentHeight;
      const keyboardVisible = isEditableElement(activeElement) && heightDelta > 160;

      if (!keyboardVisible && heightDelta < 80) {
        baselineViewportHeightRef.current = currentHeight;
      }

      setIsKeyboardOpen(keyboardVisible);
    };

    baselineViewportHeightRef.current = getViewportHeight();
    syncKeyboardState();

    viewport?.addEventListener('resize', syncKeyboardState);
    viewport?.addEventListener('scroll', syncKeyboardState);
    window.addEventListener('focusin', syncKeyboardState);
    window.addEventListener('focusout', syncKeyboardState);
    window.addEventListener('orientationchange', syncKeyboardState);

    return () => {
      viewport?.removeEventListener('resize', syncKeyboardState);
      viewport?.removeEventListener('scroll', syncKeyboardState);
      window.removeEventListener('focusin', syncKeyboardState);
      window.removeEventListener('focusout', syncKeyboardState);
      window.removeEventListener('orientationchange', syncKeyboardState);
    };
  }, []);

  return (
    <div className={`fi-page ${pageScrollable ? 'fi-mobile-screen-scrollable overflow-y-auto' : 'fi-mobile-screen'}`}>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className={`relative mx-auto flex w-full max-w-md flex-col px-4 sm:px-5 ${pageScrollable ? 'min-h-screen min-h-dvh' : 'h-full'}`}>
        <div className={`fi-auth-shell ${isKeyboardOpen ? 'fi-auth-shell-keyboard-open' : ''}`}>
          <div className="mb-4 text-center max-[900px]:mb-3">
            <div className="mb-2 flex items-center justify-center">
              <div className="origin-center scale-[0.74] max-[900px]:scale-[0.62] sm:scale-[0.84]">
                <VodaThemeLogo size={152} />
              </div>
            </div>
            <p className="text-[11px] fi-text-muted">사주와 타로로 풀어내는 나만의 투자 운세</p>
          </div>

          <div className="mb-4 flex justify-center max-[900px]:mb-3">
            <div className="origin-top scale-[0.76] max-[900px]:scale-[0.6] sm:scale-[0.82]">
              <WheelOfFortune />
            </div>
          </div>

          <div className="mb-4 space-y-1.5 max-[900px]:mb-3">
            <h2 className="text-center text-base fi-text-main sm:text-lg">{title}</h2>
            <p className="text-center text-xs leading-5 fi-text-muted">{description}</p>
            <div className="fi-top-divider mx-auto h-px w-20" />
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              className={`fi-glass rounded-2xl p-4 sm:p-5 ${contentScrollable ? 'fi-mobile-scroll max-h-full' : ''}`}
            >
              {children}
            </div>

            <div className="pointer-events-none absolute -left-1 -top-1 h-16 w-16 rounded-tl-2xl border-l-2 border-t-2" style={{ borderColor: 'var(--app-accent-border)' }} />
            <div className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 rounded-br-2xl border-b-2 border-r-2" style={{ borderColor: 'var(--app-accent-border)' }} />
          </div>

          <div
            className={`mt-4 text-center transition-opacity duration-200 max-[900px]:mt-3 ${
              isKeyboardOpen ? 'pointer-events-none invisible opacity-0' : 'opacity-100'
            }`}
            aria-hidden={isKeyboardOpen}
          >
            <p className="text-[11px] fi-text-subtle">© 2026 Voda. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
