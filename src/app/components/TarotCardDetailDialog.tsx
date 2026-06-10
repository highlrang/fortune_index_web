import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

export type TarotCardDetail = {
  label: string;
  meaning?: string;
  description?: string | null;
  imageSrc?: string;
  videoSrc?: string;
};

type TarotCardDetailDialogProps = {
  card: TarotCardDetail | null;
  eyebrow?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TarotCardDetailDialog({
  card,
  eyebrow = 'Tarot Card',
  open,
  onOpenChange,
}: TarotCardDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border p-0"
        style={{
          maxWidth: 'min(26rem, calc(100% - 2rem))',
          borderColor: 'var(--tarot-card-cover-border)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--app-modal-bg) 94%, var(--tarot-ambient-start) 6%) 0%, color-mix(in srgb, var(--app-modal-bg) 90%, var(--tarot-ambient-mid) 10%) 100%)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.42)',
        }}
      >
        {card ? (
          <div className="overflow-hidden rounded-[24px]">
            <div
              className="mx-auto mt-6 w-48 overflow-hidden rounded-[22px] border"
              style={{
                borderColor: 'var(--tarot-card-cover-border)',
                boxShadow: '0 18px 42px rgba(0, 0, 0, 0.34)',
              }}
            >
              {card.videoSrc ? (
                <video
                  key={card.videoSrc}
                  src={card.videoSrc}
                  className="block h-72 w-full object-cover opacity-100"
                  autoPlay
                  muted
                  playsInline
                  loop
                />
              ) : card.imageSrc ? (
                <img
                  src={card.imageSrc}
                  alt={card.label}
                  className="block h-72 w-full object-cover opacity-100"
                />
              ) : (
                <TarotCardFallbackFace className="h-72 w-full" />
              )}
            </div>
            <DialogHeader className="px-6 pb-6 pt-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--app-accent-text-soft)' }}>
                {eyebrow}
              </p>
              <DialogTitle className="mt-1 text-xl font-semibold" style={{ color: 'var(--app-text-soft)' }}>
                {card.label}
              </DialogTitle>
              {card.meaning ? (
                <DialogDescription className="text-sm leading-6" style={{ color: 'var(--app-text-muted)' }}>
                  {card.meaning}
                </DialogDescription>
              ) : null}
              {card.description ? (
                <p className="mt-3 text-sm leading-6" style={{ color: 'var(--app-text-muted)' }}>{card.description}</p>
              ) : null}
            </DialogHeader>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function TarotCardFallbackFace({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background:
          'linear-gradient(145deg, var(--tarot-card-cover-start) 0%, var(--tarot-card-cover-mid) 52%, var(--tarot-card-cover-end) 100%)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.18] via-transparent to-white/[0.05]" />
      <div className="absolute inset-3 rounded-[18px] border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 40%, transparent)' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border" style={{ borderColor: 'var(--tarot-card-sigil)', boxShadow: '0 0 24px color-mix(in srgb, var(--tarot-card-sigil) 35%, transparent)' }} />
      </div>
    </div>
  );
}
