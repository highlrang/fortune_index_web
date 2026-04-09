import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

type TarotRole = 'past-present' | 'flow' | 'warning';

interface TarotPreviewCard {
  id: TarotRole;
  role: string;
  title: string;
  cardName: string;
  keywords: string[];
  advice: string;
}

const previewCards: TarotPreviewCard[] = [
  {
    id: 'past-present',
    role: '과거/현재',
    title: '누적된 흐름 점검',
    cardName: '은둔자',
    keywords: ['기존 포지션', '정보 정리', '재점검'],
    advice: '최근 판단을 복기하면서 지금 들고 있는 자산의 이유를 먼저 확인하세요.',
  },
  {
    id: 'flow',
    role: '흐름',
    title: '오늘의 시장 온도',
    cardName: '운명의 수레바퀴',
    keywords: ['추세 변화', '타이밍', '변동성'],
    advice: '방향성보다 속도 변화를 읽는 쪽이 유리합니다. 급한 진입은 한 번 더 늦추세요.',
  },
  {
    id: 'warning',
    role: '주의사항',
    title: '실수 방지 포인트',
    cardName: '검 7',
    keywords: ['과열 경계', '루머', '추격 매수'],
    advice: '확인되지 않은 재료에 반응하기보다 손절선과 진입 조건을 먼저 정해두세요.',
  },
];

export function TodayInvestmentTarotSection() {
  const navigate = useNavigate();
  const [activeCardId, setActiveCardId] = useState<TarotRole>('flow');

  return (
    <section className="fi-glass relative overflow-hidden rounded-3xl px-5 py-6 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02]" />

      <div className="relative">
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 fi-text-accent" />
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] fi-text-subtle">Daily Tarot</p>
          </div>
          <h2 className="text-xl font-semibold fi-text-main">오늘의 투자 타로</h2>
          <p className="mt-2 text-sm leading-6 fi-text-muted">
            카드 3장이 각각 현재까지의 맥락, 오늘의 흐름, 실수하기 쉬운 지점을 나눠 보여줍니다.
            카드를 눌러 역할을 먼저 확인한 뒤 해석을 이어가세요.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {previewCards.map((card) => {
            const isActive = card.id === activeCardId;

            return (
              <div key={card.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveCardId(card.id)}
                  aria-pressed={isActive}
                  className="group w-full text-left"
                >
                  <div
                    className="relative flex aspect-[3/5] items-end overflow-hidden rounded-2xl border p-3 transition-transform duration-200 group-active:scale-[0.98]"
                    style={{
                      borderWidth: 'var(--app-hairline-border)',
                      borderStyle: 'solid',
                      borderColor: isActive ? 'var(--app-accent-border-strong)' : 'var(--card-border)',
                      background: isActive
                        ? 'linear-gradient(180deg, color-mix(in srgb, var(--app-accent-soft) 34%, transparent) 0%, color-mix(in srgb, var(--bg-main) 88%, transparent) 100%)'
                        : 'linear-gradient(180deg, color-mix(in srgb, var(--card-border) 12%, transparent) 0%, color-mix(in srgb, var(--bg-main) 86%, transparent) 100%)',
                      boxShadow: isActive ? '0 18px 30px -24px var(--app-accent-glow)' : 'none',
                    }}
                  >
                    <div className="absolute inset-x-3 top-3 flex items-start justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] fi-text-subtle">
                        {card.role}
                      </span>
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: isActive ? 'var(--point-gold)' : 'var(--app-surface-divider)' }}
                      />
                    </div>

                    <div className="relative w-full">
                      <p className="text-[11px] leading-5 fi-text-muted">{card.title}</p>
                    </div>
                  </div>
                </button>

                <div className="pt-3">
                  <p className="text-sm font-semibold fi-text-main">{card.cardName}</p>
                  <p className="mt-1 text-xs leading-5 fi-text-soft">{card.keywords.join(' · ')}</p>
                  <p className="mt-2 text-[12px] leading-5 fi-text-muted">{card.advice}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="rounded-2xl border px-4 py-4"
          style={{
            borderWidth: 'var(--app-hairline-border)',
            borderStyle: 'solid',
            borderColor: 'var(--card-border)',
            background: 'color-mix(in srgb, var(--bg-main) 88%, transparent)',
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium fi-text-main">하루 한 번만 참여 가능</p>
              <p className="mt-1 text-xs leading-5 fi-text-muted">
                오늘의 3장 스프레드는 1일 1회만 열립니다. 카드 선택 전 현재 포지션과 관심 종목을 먼저 정리해두세요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/tarot-picker')}
            className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              borderWidth: 'var(--app-hairline-border)',
              borderStyle: 'solid',
              borderColor: 'var(--app-accent-border-strong)',
              background: 'var(--app-accent-surface)',
              color: 'var(--tarot-text-main)',
            }}
          >
            오늘의 투자 타로 시작하기
          </button>
        </div>
      </div>
    </section>
  );
}
