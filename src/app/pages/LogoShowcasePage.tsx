import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { VodaIcon, VodaIconHybrid, VodaLogo, VodaLogoHybrid } from '../components/logos/VodaLogo';

function ThemePreview({
  theme,
  title,
  description,
}: {
  theme: 'light' | 'dark';
  title: string;
  description: string;
}) {
  const isDark = theme === 'dark';
  const background = isDark
    ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 52%, #2e1065 100%)'
    : 'linear-gradient(135deg, #faf9f6 0%, rgba(242, 237, 255, 0.72) 48%, #ffffff 100%)';
  const panelClass = isDark
    ? 'border-[rgba(223,188,95,0.38)] bg-[rgba(39,34,68,0.72)] text-[#f1efff]'
    : 'border-[rgba(212,186,134,0.52)] bg-white/70 text-[#454545]';
  const mutedClass = isDark ? 'text-[#f1efff]/70' : 'text-[#454545]/70';
  const buttonClass = isDark
    ? 'border-white/15 bg-white/10 text-[#f1efff]'
    : 'border-[#d4ba86]/40 bg-white/70 text-[#454545]';

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/15" style={{ background }}>
      <div className={`flex min-h-[360px] flex-col p-6 sm:p-8 ${isDark ? 'text-[#f1efff]' : 'text-[#454545]'}`}>
        <header className="flex items-center justify-between">
          <VodaLogoHybrid size={118} theme={theme} />
          <nav className="hidden items-center gap-2 sm:flex">
            <button className={`rounded-lg border px-4 py-2 text-sm ${buttonClass}`}>로그인</button>
            <button className="rounded-lg bg-gradient-to-r from-[#dfbe66] to-[#ad88ff] px-4 py-2 text-sm font-medium text-[#161223] shadow-lg shadow-[#dfbe66]/20">
              시작하기
            </button>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 md:grid-cols-[1fr_220px]">
          <div>
            <p className={`mb-3 text-sm font-medium ${isDark ? 'text-[#dfbe66]' : 'text-[#80612e]'}`}>{title}</p>
            <h2 className="max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
              자산 흐름을 보는 통찰의 브랜드
            </h2>
            <p className={`mt-4 max-w-md text-sm leading-6 ${mutedClass}`}>{description}</p>
          </div>

          <div className={`mx-auto flex aspect-square w-44 items-center justify-center rounded-[28px] border backdrop-blur-xl ${panelClass}`}>
            <VodaIconHybrid size={104} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoTile({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className: string;
}) {
  return (
    <div className="space-y-3">
      <div className={`flex min-h-36 items-center justify-center rounded-xl border p-8 ${className}`}>{children}</div>
      <p className="text-center text-xs text-[#f1efff]/60">{label}</p>
    </div>
  );
}

export function LogoShowcasePage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen px-5 py-10 sm:p-12"
      style={{
        background:
          'linear-gradient(135deg, #1e1b4b 0%, #312e81 52%, #2e1065 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="text-center">
          <div className="mb-5 flex justify-center">
            <VodaLogoHybrid size={152} theme="dark" />
          </div>
          <h1 className="mb-4 text-4xl font-semibold text-[#f1efff]">Voda 로고 쇼케이스</h1>
          <p className="mx-auto max-w-xl text-sm leading-6 text-[#f1efff]/70">
            서비스의 딥 네이비, 글래스 퍼플, 골드 포인트 팔레트에 맞춘 라이트/다크 테마별 로고 적용안입니다.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="group mx-auto mt-6 flex items-center gap-2 rounded-xl border border-[#dfbe66]/50 bg-[#dfbe66]/15 px-5 py-3 text-sm font-medium text-[#f1efff] shadow-lg shadow-[#dfbe66]/10 transition hover:bg-[#dfbe66]/25"
          >
            서비스 화면에서 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#f1efff]">테마별 권장 배치</h2>
            <p className="mt-2 text-sm text-[#f1efff]/65">
              헤더 좌측에는 워드마크, 핵심 시각 영역에는 아이콘을 크게 배치하는 구성이 가장 안정적입니다.
            </p>
          </div>

          <div className="grid gap-6">
            <ThemePreview
              theme="light"
              title="라이트 테마"
              description="밝은 배경에서는 텍스트를 차콜로 낮추고 골드 아이콘을 전면에 둬서 프리미엄 톤을 유지합니다."
            />
            <ThemePreview
              theme="dark"
              title="다크 테마"
              description="어두운 배경에서는 라벤더 화이트 텍스트와 골드/퍼플 심볼 대비를 높여 첫 화면에서 브랜드가 바로 보이게 합니다."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-8">
          <h2 className="mb-8 text-2xl font-semibold text-[#f1efff]">로고 변형</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <LogoTile label="라이트 배경 / 하이브리드" className="border-[#d4ba86]/40 bg-[#faf9f6]">
              <VodaLogoHybrid size={150} theme="light" />
            </LogoTile>
            <LogoTile label="다크 배경 / 하이브리드" className="border-[#dfbe66]/35 bg-[rgba(39,34,68,0.72)]">
              <VodaLogoHybrid size={150} theme="dark" />
            </LogoTile>
            <LogoTile label="단색 라이트" className="border-white/10 bg-white text-[#454545]">
              <div className="flex items-center gap-8">
                <VodaLogo size={132} />
                <VodaIcon size={56} />
              </div>
            </LogoTile>
            <LogoTile label="단색 다크" className="border-[#dfbe66]/35 bg-[#1e1b4b] text-[#f1efff]">
              <div className="flex items-center gap-8">
                <VodaLogo size={132} />
                <VodaIcon size={56} className="text-[#dfbe66]" />
              </div>
            </LogoTile>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-8">
          <h2 className="mb-8 text-2xl font-semibold text-[#f1efff]">앱 아이콘</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] border border-[#dfbe66]/30 bg-[rgba(39,34,68,0.72)] shadow-xl shadow-[#ad88ff]/20">
                <VodaIconHybrid size={62} theme="dark" />
              </div>
              <span className="text-xs text-[#f1efff]/60">다크 앱 아이콘</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] border border-[#d4ba86]/40 bg-white shadow-xl shadow-[#dfbe66]/20">
                <VodaIconHybrid size={62} theme="light" />
              </div>
              <span className="text-xs text-[#f1efff]/60">라이트 앱 아이콘</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#2e1065] shadow-xl shadow-[#ad88ff]/20">
                <VodaIconHybrid size={62} theme="dark" />
              </div>
              <span className="text-xs text-[#f1efff]/60">그라디언트 아이콘</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#dfbe66]/30 bg-gradient-to-r from-[#dfbe66]/10 to-[#ad88ff]/10 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-[#f1efff]">사용 방법</h2>
          <div className="rounded-lg bg-[#1e1b4b] p-4">
            <pre className="overflow-x-auto text-xs text-[#f1efff]">
{`import { VodaLogoHybrid, VodaIconHybrid } from '@/app/components/logos/VodaLogo';

<VodaLogoHybrid size={120} theme="dark" />
<VodaLogoHybrid size={120} theme="light" />
<VodaIconHybrid size={64} theme="dark" />`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
