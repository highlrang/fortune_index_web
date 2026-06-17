import { MoonStar, Sparkles, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  getHomeSummary,
  resolveApiAssetUrl,
  type HomeFortuneResponse,
  type HomeTarotResponse,
  type HomeZodiacResponse,
  type HomeSummaryResponse,
} from '@/lib/api';
import { HomeFortuneJourneySection } from '../components/HomeFortuneJourneySection';
import { BottomNavigation } from '../components/BottomNavigation';
import { VodaThemeLogo } from '../components/logos/VodaLogo';
import { TarotCardDetailDialog } from '../components/TarotCardDetailDialog';

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

type DailyFlowType = 'saju' | 'tarot' | 'zodiac';
type DailyFlowData = HomeFortuneResponse | HomeZodiacResponse | null;

const heavenlyStemColors: Record<string, string> = {
  갑: '푸른',
  을: '푸른',
  병: '붉은',
  정: '붉은',
  무: '노란',
  기: '노란',
  경: '하얀',
  신: '하얀',
  임: '검은',
  계: '검은',
};

const earthlyBranchSymbols: Record<string, string> = {
  자: '쥐',
  축: '소',
  인: '호랑이',
  묘: '토끼',
  진: '용',
  사: '뱀',
  오: '말',
  미: '양',
  신: '원숭이',
  유: '닭',
  술: '개',
  해: '돼지',
};

const zodiacSymbols: Record<string, string> = {
  양자리: '양',
  황소자리: '황소',
  쌍둥이자리: '쌍둥이',
  게자리: '게',
  사자자리: '사자',
  처녀자리: '처녀',
  천칭자리: '저울',
  전갈자리: '전갈',
  사수자리: '궁수',
  염소자리: '염소',
  물병자리: '물병',
  물고기자리: '물고기',
};

function getDetailedContent(data: DailyFlowData) {
  return {
    lead: data?.detail?.body ?? data?.summary ?? unavailableCardMeta,
    points: data?.detail?.points ?? [],
  };
}

function getSajuSymbol(name?: string) {
  if (!name) return '일주 상징';

  const stem = [...name].find((char) => heavenlyStemColors[char]);
  const branch = [...name].find((char) => earthlyBranchSymbols[char]);

  if (stem && branch) return `${heavenlyStemColors[stem]} ${earthlyBranchSymbols[branch]}`;
  if (branch) return earthlyBranchSymbols[branch];

  return '일주 상징';
}

function getZodiacSymbol(name?: string) {
  if (!name) return '별자리 상징';

  const zodiacName = Object.keys(zodiacSymbols).find((key) => name.includes(key));

  return zodiacName ? zodiacSymbols[zodiacName] : '별자리 상징';
}

function getFlowSymbol(type: Exclude<DailyFlowType, 'tarot'>, data: DailyFlowData) {
  if (data?.symbol?.label) return data.symbol.label;

  return type === 'saju' ? getSajuSymbol(data?.name) : getZodiacSymbol(data?.name);
}

function getTarotDetailCard(data: HomeTarotResponse | null) {
  return {
    label: data?.name ?? unavailableCardValue,
    meaning: data?.summary ?? unavailableCardMeta,
    description: data?.detail?.body ??
      '오늘의 타로는 지금 드러난 카드의 상징을 통해 분위기, 선택의 태도, 조심해야 할 반응을 읽습니다. 서버 상세 리딩이 연결되면 이 영역에 카드의 맥락, 투자 흐름에서의 해석, 오늘 적용할 행동 가이드가 더 깊게 표시됩니다.',
    imageSrc: resolveApiAssetUrl(data?.detail?.imageUrl),
    videoSrc: resolveApiAssetUrl(data?.detail?.videoUrl) || undefined,
  };
}

export function HomePage() {
  const [summary, setSummary] = useState<HomeSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFlowType, setSelectedFlowType] = useState<DailyFlowType | null>(null);
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
    <div className="fi-page home-page min-h-screen pb-24">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--app-accent-soft)' }} />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--glow-purple)' }} />
      </div>

      <div className="home-page-content relative mx-auto max-w-md px-5 pt-6">
        <div className="mb-8">
          <div>
            <VodaThemeLogo size={136} />
            <p className="text-sm fi-text-muted">오늘의 사주, 타로, 별자리 흐름</p>
          </div>
        </div>

        <section
          className="mb-8 rounded-3xl p-5 shadow-2xl"
          style={accentCardStyle}
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
              onClick={() => setSelectedFlowType('saju')}
            />
            <DailyCard
              label="오늘의 타로"
              value={tarotSummary?.name ?? unavailableCardValue}
              icon={<Sparkles className="h-5 w-5" />}
              isLoading={isLoading}
              onClick={() => setSelectedFlowType('tarot')}
            />
            <DailyCard
              label="오늘의 별자리"
              value={zodiacSummary?.name ?? unavailableCardValue}
              icon={<MoonStar className="h-5 w-5" />}
              isLoading={isLoading}
              onClick={() => setSelectedFlowType('zodiac')}
            />
          </div>
        </section>

        <div className="mb-8">
          <HomeFortuneJourneySection />
        </div>
      </div>

      {selectedFlowType && (
        selectedFlowType === 'tarot' ? (
          <TarotCardDetailDialog
            card={getTarotDetailCard(tarotSummary ?? null)}
            eyebrow="Daily Tarot"
            open
            onOpenChange={(open) => {
              if (!open) setSelectedFlowType(null);
            }}
          />
        ) : (
          <DailyFlowModal
            type={selectedFlowType}
            data={selectedFlowType === 'saju' ? sajuSummary ?? null : zodiacSummary ?? null}
            onClose={() => setSelectedFlowType(null)}
          />
        )
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
  onClick,
  styleVariant = 'default',
}: {
  label: string;
  value: string;
  icon: ReactNode;
  isLoading: boolean;
  onClick: () => void;
  styleVariant?: 'default' | 'accent';
}) {
  return (
    <button
      type="button"
      className="min-w-0 rounded-2xl border p-3 text-left transition-transform active:scale-[0.98] disabled:cursor-default disabled:active:scale-100"
      style={styleVariant === 'accent' ? accentCardStyle : glassCardStyle}
      onClick={onClick}
      disabled={isLoading}
      aria-label={`${label} 상세 보기`}
    >
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg border" style={glassCardStyle}>
        <span style={{ color: 'var(--app-accent-text-soft)' }}>{icon}</span>
      </div>
      <p className="text-[10px] font-medium leading-none whitespace-nowrap fi-text-subtle">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-none fi-text-main whitespace-nowrap overflow-hidden text-ellipsis">
        {isLoading ? '' : value}
      </p>
    </button>
  );
}

function DailyFlowModal({
  type,
  data,
  onClose,
}: {
  type: Exclude<DailyFlowType, 'tarot'>;
  data: DailyFlowData;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const modalMeta = {
    saju: { label: '오늘의 사주', icon: <Sun className="h-5 w-5" /> },
    zodiac: { label: '오늘의 별자리', icon: <MoonStar className="h-5 w-5" /> },
  }[type];
  const content = getDetailedContent(data);
  const symbol = getFlowSymbol(type, data);
  const symbolDescription = data?.symbol?.description;
  const showSymbol = type === 'saju';

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
            <p className="mt-1 text-lg font-semibold fi-text-main">{modalMeta.label}</p>
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

        <div>
          <div className="mb-4">
            {showSymbol ? (
              <>
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span style={{ color: 'var(--app-accent-text-soft)' }}>{modalMeta.icon}</span>
                  <p className="text-2xl font-semibold leading-tight fi-text-main">
                    {data?.name ?? unavailableCardValue}
                  </p>
                  <p className="text-sm font-medium leading-tight fi-text-subtle">
                    {symbol}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <span style={{ color: 'var(--app-accent-text-soft)' }}>{modalMeta.icon}</span>
                <p className="text-base font-semibold leading-tight fi-text-main">
                  {data?.name ?? unavailableCardValue}
                </p>
              </div>
            )}
            {showSymbol && symbolDescription ? (
              <p className="mt-2 text-sm leading-6 break-keep fi-text-muted">
                {symbolDescription}
              </p>
            ) : null}
          </div>
          <p className="text-sm leading-6 break-keep fi-text-muted">
            {content.lead}
          </p>
          <div className="mt-4 space-y-2">
            {content.points.map((point) => (
              <p key={point} className="text-sm leading-6 break-keep fi-text-muted">
                {point}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
