import { useId } from 'react';

interface VodaLogoProps {
  size?: number;
  className?: string;
}

interface VodaLogoHybridProps extends VodaLogoProps {
  theme?: 'light' | 'dark';
}

function useStableSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/:/g, '')}`;
}

export function VodaLogo({ size = 120, className = '' }: VodaLogoProps) {
  const accentId = useStableSvgId('voda-elegant-accent');

  return (
    <svg
      width={size}
      height={size * (192 / 520)}
      viewBox="0 0 520 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Voda logo"
      role="img"
    >
      <defs>
        <linearGradient id={accentId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.34" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <path
        d="M 25 50 Q 28 48 30 50 L 55 110 L 60 110 L 85 50 Q 87 48 90 50"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="160" cy="80" r="40" stroke="currentColor" strokeWidth="13" fill="none" />
      <circle cx="160" cy="80" r="52" stroke={`url(#${accentId})`} strokeWidth="1.5" fill="none" opacity="0.7" />
      <circle cx="160" cy="80" r="14" fill="currentColor" />
      <circle cx="160" cy="80" r="7" fill="currentColor" opacity="0.3" />
      <path
        d="M 255 50 L 255 110 M 255 50 Q 318 50 318 80 Q 318 110 255 110"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 362 110 Q 367 105 372 90 L 385 52 Q 388 48 391 52 L 404 90 Q 409 105 414 110 M 377 83 L 399 83"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 30 130 L 410 130"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.25"
      />
      <circle cx="60" cy="130" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="380" cy="130" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function VodaLogoHybrid({ size = 120, className = '', theme = 'dark' }: VodaLogoHybridProps) {
  const gradientId = useStableSvgId('voda-gradient');
  const shimmerGradientId = useStableSvgId('voda-shimmer-gradient');
  const glowId = useStableSvgId('voda-glow');
  const bgGradientId = useStableSvgId('voda-bg-gradient');
  const outerRingOpacity = theme === 'dark' ? 0.4 : 0.28;
  const backgroundOpacity = theme === 'dark' ? 0.12 : 0.08;

  return (
    <svg
      width={size}
      height={size * (198 / 660)}
      viewBox="0 0 660 198"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Voda logo"
      role="img"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a227" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
        <linearGradient id={shimmerGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff8dc" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8b7500" stopOpacity="0.1" />
        </linearGradient>

        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={bgGradientId}>
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="86" cy="88" r="66" fill={`url(#${bgGradientId})`} opacity={backgroundOpacity} />

      <g filter={`url(#${glowId})`}>
        <circle
          cx="86"
          cy="88"
          r="56"
          stroke={`url(#${shimmerGradientId})`}
          strokeWidth="1"
          fill="none"
          opacity={outerRingOpacity}
        />
        <path
          d="M 56 58 L 86 118 L 116 58"
          stroke={`url(#${gradientId})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse
          cx="86"
          cy="92"
          rx="22"
          ry="16"
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          fill="none"
        />
        <circle cx="86" cy="92" r="7.5" fill="#d4af37" />
        <circle cx="86" cy="92" r="3.8" fill="#e8d5a8" opacity="0.8" />
      </g>

      <g transform="translate(184, 0)">
        <path
          d="M 25 50 Q 28 48 30 50 L 55 110 L 60 110 L 85 50 Q 87 48 90 50"
          stroke={`url(#${gradientId})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="160" cy="80" r="36" stroke={`url(#${gradientId})`} strokeWidth="15" fill="none" />
        <circle
          cx="160"
          cy="80"
          r="47"
          stroke={`url(#${shimmerGradientId})`}
          strokeWidth="1.5"
          fill="none"
          opacity={outerRingOpacity}
        />
        <circle cx="160" cy="80" r="13" fill="#d4af37" />
        <circle cx="160" cy="80" r="6" fill="#e8d5a8" opacity="0.8" />
        <path
          d="M 255 50 L 255 110 M 255 50 Q 318 50 318 80 Q 318 110 255 110"
          stroke={`url(#${gradientId})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 362 110 Q 367 105 372 90 L 385 52 Q 388 48 391 52 L 404 90 Q 409 105 414 110 M 377 83 L 399 83"
          stroke={`url(#${gradientId})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 30 132 L 410 132"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          fill="none"
          opacity="0.25"
        />
      </g>
    </svg>
  );
}

export function VodaIcon({ size = 60, className = '' }: VodaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Voda icon"
      role="img"
    >
      <path
        d="M 20 20 L 40 60 L 60 20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse
        cx="40"
        cy="43"
        rx="14"
        ry="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <circle cx="40" cy="43" r="4" fill="currentColor" />
    </svg>
  );
}

export function VodaIconHybrid({ size = 60, className = '' }: VodaLogoProps) {
  const gradientId = useStableSvgId('voda-icon-gradient');
  const glowId = useStableSvgId('voda-icon-glow');
  const bgGradientId = useStableSvgId('voda-icon-bg');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Voda icon"
      role="img"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={bgGradientId}>
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="40" cy="40" r="35" fill={`url(#${bgGradientId})`} />

      <g filter={`url(#${glowId})`}>
        <path
          d="M 20 20 L 40 60 L 60 20"
          stroke={`url(#${gradientId})`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse
          cx="40"
          cy="43"
          rx="14"
          ry="10"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.5"
          fill="none"
        />
        <circle cx="40" cy="43" r="5" fill="#fbbf24" />
        <circle cx="40" cy="43" r="2.5" fill="#fef3c7" />
      </g>
    </svg>
  );
}

export function VodaThemeLogo({ size = 120, className = '' }: VodaLogoProps) {
  return (
    <>
      <VodaLogoHybrid size={size} theme="light" className={`dark:hidden ${className}`} />
      <VodaLogoHybrid size={size} theme="dark" className={`hidden dark:block ${className}`} />
    </>
  );
}
