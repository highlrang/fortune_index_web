import { Shield } from 'lucide-react';

const FALLBACK_TEXT =
  '[주의 및 면책 조항] ' +
  '본 서비스에서 제공하는 모든 정보는 사주수리과학 및 타로 해석에 기반한 학술 및 재미 목적의 참고 자료일 뿐이며, ' +
  '특정 종목의 추천, 가격 상승/하락 예측, 또는 투자 권유를 절대 포함하지 않습니다. ' +
  '시스템이 제공하는 조언은 투자자의 개인적 성향과 흐름을 리포트하는 콘텐츠입니다. ' +
  '모든 투자 결정의 책임과 그로 인한 결과(손익)는 전적으로 투자자 본인에게 귀속되므로 신중하게 투자하시기 바랍니다.';

interface InvestmentDisclaimerProps {
  variant?: 'default' | 'dark';
  className?: string;
  text?: string;
}

export function InvestmentDisclaimer({ variant = 'default', className = '', text }: InvestmentDisclaimerProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-xl border px-4 py-4 ${className}`}
      style={
        isDark
          ? {
              borderColor: 'rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(0,0,0,0.25)',
            }
          : {
              borderColor: 'var(--app-surface-border)',
              backgroundColor: 'var(--app-surface-bg)',
            }
      }
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--app-text-subtle)' }} />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--app-text-subtle)' }}
        >
          주의 및 면책 조항
        </span>
      </div>
      <p
        className="text-xs leading-relaxed"
        style={{ color: isDark ? 'rgba(255,255,255,0.28)' : 'var(--app-text-subtle)' }}
      >
        {text ?? FALLBACK_TEXT}
      </p>
    </div>
  );
}
