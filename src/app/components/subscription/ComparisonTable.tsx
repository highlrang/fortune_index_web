import { Check, X } from 'lucide-react';

const rows = [
  ['오늘의 기본 운세', true, true],
  ['프리미엄 타로 덱', false, true],
  ['월별/연별 상세 분석', false, true],
  ['상담기록 저장', '1주일 저장', '무제한 저장'],
  ['무제한 상담', false, true],
] as const;

function renderValue(value: boolean | string, premium = false) {
  if (typeof value === 'string') {
    return (
      <span className={`text-center text-xs font-medium sm:text-sm ${premium ? 'text-amber-200' : 'text-white/60'}`}>
        {value}
      </span>
    );
  }

  return value ? (
    <Check className={`h-5 w-5 ${premium ? 'text-amber-300' : 'text-emerald-300'}`} />
  ) : (
    <X className="h-5 w-5 text-white/30" />
  );
}

export function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm">
      <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-white/10 bg-white/10 text-sm font-medium text-white">
        <div className="p-4">기능</div>
        <div className="p-4 text-center">무료</div>
        <div className="p-4 text-center text-amber-200">프리미엄</div>
      </div>
      {rows.map(([label, free, premium]) => (
        <div key={label} className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-white/10 text-sm text-white/75 last:border-b-0">
          <div className="p-4">{label}</div>
          <div className="flex items-center justify-center p-4">
            {renderValue(free)}
          </div>
          <div className="flex items-center justify-center p-4">
            {renderValue(premium, true)}
          </div>
        </div>
      ))}
    </div>
  );
}
