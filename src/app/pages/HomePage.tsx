import { Bell, MoonStar, Sparkles, Sun } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
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

const pendingCardMeta = '불러오는 중';
const unavailableCardValue = '-';
const unavailableCardMeta = '아직 준비되지 않았어요';

export function HomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<HomeSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <VodaThemeLogo size={118} />
            <p className="text-xs fi-text-muted">오늘의 사주, 타로, 별자리 흐름</p>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="fi-icon-button relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-90"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--point-gold)', boxShadow: '0 0 0 2px var(--bg-main)' }} />
          </button>
        </div>

        <section className="mb-8 rounded-3xl p-5 shadow-2xl" style={accentCardStyle}>
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.24em] fi-text-subtle">Daily Fortune</p>
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

          <div className="grid grid-cols-3 gap-3">
            <DailyCard
              label="오늘의 사주"
              value={sajuSummary?.name ?? unavailableCardValue}
              meta={sajuSummary?.summary ?? (isLoading ? pendingCardMeta : unavailableCardMeta)}
              icon={<Sun className="h-5 w-5" />}
              isLoading={isLoading}
              styleVariant="accent"
            />
            <DailyCard
              label="오늘의 타로"
              value={tarotSummary?.name ?? unavailableCardValue}
              meta={tarotSummary?.summary ?? (isLoading ? pendingCardMeta : unavailableCardMeta)}
              icon={<Sparkles className="h-5 w-5" />}
              isLoading={isLoading}
            />
            <DailyCard
              label="오늘의 별자리"
              value={zodiacSummary?.name ?? unavailableCardValue}
              meta={zodiacSummary?.summary ?? (isLoading ? pendingCardMeta : unavailableCardMeta)}
              icon={<MoonStar className="h-5 w-5" />}
              isLoading={isLoading}
            />
          </div>

        </section>

        <div className="mb-8">
          <HomeFortuneJourneySection />
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  );
}

function DailyCard({
  label,
  value,
  meta,
  icon,
  isLoading,
  styleVariant = 'default',
}: {
  label: string;
  value: string;
  meta: string;
  icon: ReactNode;
  isLoading: boolean;
  styleVariant?: 'default' | 'accent';
}) {
  return (
    <div
      className="h-full rounded-2xl border p-4"
      style={styleVariant === 'accent' ? accentCardStyle : glassCardStyle}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border" style={glassCardStyle}>
        <span style={{ color: 'var(--app-accent-text-soft)' }}>{icon}</span>
      </div>
      <p className="text-[11px] uppercase tracking-[0.18em] fi-text-subtle">{label}</p>
      <p className="mt-2 text-sm font-semibold fi-text-main">{isLoading ? '...' : value}</p>
      <p className="mt-1 text-xs fi-text-muted">{isLoading ? '불러오는 중' : meta}</p>
    </div>
  );
}
