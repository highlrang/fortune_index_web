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
  imageSize?: 'default' | 'compact';
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TarotCardDetailDialog({
  card,
  eyebrow = 'Tarot Card',
  imageSize = 'default',
  open,
  onOpenChange,
}: TarotCardDetailDialogProps) {
  const imageFrameClassName = imageSize === 'compact'
    ? 'mx-auto mt-6 w-40 overflow-hidden rounded-[20px] border'
    : 'mx-auto mt-6 w-48 overflow-hidden rounded-[22px] border';
  const imageClassName = imageSize === 'compact'
    ? 'block h-60 w-full object-cover opacity-100'
    : 'block h-72 w-full object-cover opacity-100';
  const fallbackClassName = imageSize === 'compact' ? 'h-60 w-full' : 'h-72 w-full';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/70 backdrop-blur-none duration-75"
        className="border p-0 duration-75 data-[state=closed]:zoom-out-98 data-[state=open]:zoom-in-98"
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
              className={imageFrameClassName}
              style={{
                borderColor: 'var(--tarot-card-cover-border)',
                boxShadow: '0 18px 42px rgba(0, 0, 0, 0.34)',
              }}
            >
              {card.videoSrc ? (
                <video
                  key={card.videoSrc}
                  src={card.videoSrc}
                  className={imageClassName}
                  autoPlay
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  poster={card.imageSrc}
                />
              ) : card.imageSrc ? (
                <img
                  src={card.imageSrc}
                  alt={card.label}
                  className={imageClassName}
                />
              ) : (
                <TarotCardFallbackFace className={fallbackClassName} />
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
      <div className="absolute inset-3 rounded-[18px] border" style={{ borderColor: 'color-mix(in srgb, var(--tarot-card-cover-border) 45%, transparent)' }} />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <svg className="h-full w-full" viewBox="0 0 100 140">
          <polygon points="50,25 70,38 70,62 50,75 30,62 30,38" fill="none" stroke="var(--tarot-card-sigil)" strokeWidth="1.5" opacity="0.58" />
          <polygon points="50,32 65,42 65,58 50,68 35,58 35,42" fill="none" stroke="var(--tarot-card-sigil-soft)" strokeWidth="1" opacity="0.5" />
          <circle cx="50" cy="50" r="8" fill="var(--tarot-card-sigil)" opacity="0.56" />
          <circle cx="50" cy="50" r="4.5" fill="var(--tarot-card-sigil)" opacity="0.78" />
          <line x1="50" y1="50" x2="50" y2="25" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
          <line x1="50" y1="50" x2="70" y2="38" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
          <line x1="50" y1="50" x2="70" y2="62" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
          <line x1="50" y1="50" x2="50" y2="75" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
          <line x1="50" y1="50" x2="30" y2="62" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
          <line x1="50" y1="50" x2="30" y2="38" stroke="var(--tarot-card-sigil)" strokeWidth="0.8" opacity="0.45" />
        </svg>
      </div>
    </div>
  );
}
