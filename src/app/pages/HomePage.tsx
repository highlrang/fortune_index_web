import { MoonStar, Sparkles, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  getHomeSummary,
  type HomeSummaryResponse,
} from '@/lib/api';
import { HomeFortuneJourneySection } from '../components/HomeFortuneJourneySection';
import { BottomNavigation } from '../components/BottomNavigation';
import { VodaThemeLogo } from '../components/logos/VodaLogo';

const glassCardStyle = {
  borderWidth: 'var(--app-hairline-border)',
  borderStyle: 'solid' as const,
  borderColor: 'var(--card-border)',
  background: 'var(--card-surface)',
  backdropFilter: 'var(--card-blur)',
  WebkitBackdropFilter: 'var(--card-blur)',
};

const accentCardStyle = {
  ...glassCardStyle,
  borderColor: 'var(--app-accent-border-strong)',
  background:
    'linear-gradient(145deg, color-mix(in srgb, var(--app-accent-soft) 42%, transparent) 0%, color-mix(in srgb, var(--bg-main) 88%, transparent) 100%)',
};

const unavailableCardValue = '-';
const unavailableCardMeta = '아직 준비되지 않았어요';

export function HomePage() {
  const [summary, setSummary] = useState<HomeSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const sajuSummary = summary?.saju;
  const tarotSummary = summary?.tarot;
  const zodiacSummary = summary?.zodiac;

  useEffect(() => {
    let active = true;

    getHomeSummary()
      .then((homeResponse) => {
        if (!active) return;
        setSummary(homeResponse);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : '홈 데이터를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="fi-page min-h-screen pb-24">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="relative mx-auto max-w-md px-5 pt-6">
        <div className="mb-8">
          <div>
            <VodaThemeLogo size={136} />
            <p className="text-sm fi-text-muted">오늘의 사주, 타로, 별자리 흐름</p>
          </div>
        </div>

        <section
          className="mb-8 rounded-3xl p-5 shadow-2xl"
          style={{ ...accentCardStyle, cursor: !isLoading ? 'pointer' : 'default' }}
          onClick={!isLoading ? () => setModalOpen(true) : undefined}
        >
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] fi-text-subtle">Daily Fortune</p>
            <h1 className="mt-2 text-2xl font-semibold fi-text-main">오늘의 흐름</h1>
            <p className="mt-2 text-sm leading-6 fi-text-muted">
              {summary?.summary ?? '사주, 타로, 별자리 세 축으로 오늘의 재운 분위기를 정리했습니다.'}
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--app-danger-border)', backgroundColor: 'var(--app-danger-bg)', color: 'var(--app-danger-text)' }}>
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2.5">
            <DailyCard
              label="오늘의 사주"
              value={sajuSummary?.name ?? unavailableCardValue}
              icon={<Sun className="h-5 w-5" />}
              isLoading={isLoading}
              styleVariant="accent"
            />
            <DailyCard
              label="오늘의 타로"
              value={tarotSummary?.name ?? unavailableCardValue}
              icon={<Sparkles className="h-5 w-5" />}
              isLoading={isLoading}
            />
            <DailyCard
              label="오늘의 별자리"
              value={zodiacSummary?.name ?? unavailableCardValue}
              icon={<MoonStar className="h-5 w-5" />}
              isLoading={isLoading}
            />
          </div>
        </section>

        <div className="mb-8">
          <HomeFortuneJourneySection />
        </div>
      </div>

      {modalOpen && (
        <DailyFlowModal
          saju={sajuSummary ?? null}
          tarot={tarotSummary ?? null}
          zodiac={zodiacSummary ?? null}
          onClose={() => setModalOpen(false)}
        />
      )}

      <BottomNavigation activeTab="home" />
    </div>
  );
}

function DailyCard({
  label,
  value,
  icon,
  isLoading,
  styleVariant = 'default',
}: {
  label: string;
  value: string;
  icon: ReactNode;
  isLoading: boolean;
  styleVariant?: 'default' | 'accent';
}) {
  return (
    <div
      className="rounded-2xl border p-3"
      style={styleVariant === 'accent' ? accentCardStyle : glassCardStyle}
    >
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg border" style={glassCardStyle}>
        <span style={{ color: 'var(--app-accent-text-soft)' }}>{icon}</span>
      </div>
      <p className="text-[10px] font-medium leading-none whitespace-nowrap fi-text-subtle">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-none fi-text-main whitespace-nowrap overflow-hidden text-ellipsis">
        {isLoading ? '' : value}
      </p>
    </div>
  );
}

function DailyFlowModal({
  saju,
  tarot,
  zodiac,
  onClose,
}: {
  saju: { name: string; summary: string } | null;
  tarot: { name: string; summary: string } | null;
  zodiac: { name: string; summary: string } | null;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const items = [
    { label: '오늘의 사주', icon: <Sun className="h-5 w-5" />, data: saju },
    { label: '오늘의 타로', icon: <Sparkles className="h-5 w-5" />, data: tarot },
    { label: '오늘의 별자리', icon: <MoonStar className="h-5 w-5" />, data: zodiac },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: 'var(--app-modal-backdrop)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl"
        style={{
          ...glassCardStyle,
          background: 'var(--app-modal-bg)',
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] fi-text-subtle">Daily Fortune</p>
            <p className="mt-1 text-lg font-semibold fi-text-main">오늘의 흐름</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={glassCardStyle}
          >
            <X className="h-4 w-4 fi-text-muted" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {items.map(({ label, icon, data }) => (
            <div key={label} className="rounded-2xl border p-4" style={glassCardStyle}>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border" style={glassCardStyle}>
                  <span style={{ color: 'var(--app-accent-text-soft)' }}>{icon}</span>
                </div>
                <div>
                  <p className="text-[10px] fi-text-subtle">{label}</p>
                  <p className="text-sm font-semibold leading-tight fi-text-main">
                    {data?.name ?? unavailableCardValue}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 break-keep fi-text-muted">
                {data?.summary ?? unavailableCardMeta}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
