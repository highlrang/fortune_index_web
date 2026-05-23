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
        className="border-none p-0 text-white"
        style={{
          maxWidth: 'min(26rem, calc(100% - 2rem))',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--tarot-ambient-start) 94%, transparent) 0%, color-mix(in srgb, var(--tarot-ambient-mid) 92%, transparent) 100%)',
        }}
      >
        {card ? (
          <div className="overflow-hidden rounded-[24px]">
            <div className="mx-auto mt-6 w-40 overflow-hidden rounded-[22px] border" style={{ borderColor: 'var(--tarot-card-cover-border)' }}>
              {card.videoSrc ? (
                <video
                  key={card.videoSrc}
                  src={card.videoSrc}
                  className="h-56 w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                />
              ) : card.imageSrc ? (
                <img
                  src={card.imageSrc}
                  alt={card.label}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <TarotCardFallbackFace className="h-56 w-full" />
              )}
            </div>
            <DialogHeader className="px-6 pb-6 pt-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--app-accent-text-soft)' }}>
                {eyebrow}
              </p>
              <DialogTitle className="mt-1 text-xl font-semibold text-white">
                {card.label}
              </DialogTitle>
              {card.meaning ? (
                <DialogDescription className="text-sm leading-6 text-white/72">
                  {card.meaning}
                </DialogDescription>
              ) : null}
              {card.description ? (
                <p className="mt-3 text-sm leading-6 text-white/80">{card.description}</p>
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
