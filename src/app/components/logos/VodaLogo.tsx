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
  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Voda logo"
      role="img"
    >
      <g>
        <path
          d="M 20 15 L 40 55 L 60 15"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse
          cx="40"
          cy="38"
          rx="12"
          ry="8"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="40" cy="38" r="3.5" fill="currentColor" />
        <path
          d="M 48 35 L 54 38 L 48 41"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />
      </g>

      <text
        x="75"
        y="50"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="40"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="-1"
      >
        Voda
      </text>
    </svg>
  );
}

export function VodaLogoHybrid({ size = 120, className = '', theme = 'dark' }: VodaLogoHybridProps) {
  const gradientId = useStableSvgId('voda-gradient');
  const glowId = useStableSvgId('voda-glow');
  const bgGradientId = useStableSvgId('voda-bg-gradient');
  const textColor = theme === 'dark' ? '#f1efff' : '#1e293b';

  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Voda logo"
      role="img"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
        </linearGradient>

        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={bgGradientId}>
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="40" cy="38" r="28" fill={`url(#${bgGradientId})`} opacity="0.1" />

      <g filter={`url(#${glowId})`}>
        <path
          d="M 20 15 L 40 55 L 60 15"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse
          cx="40"
          cy="38"
          rx="12"
          ry="8"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="40" cy="38" r="4" fill="#fbbf24" />
        <circle cx="40" cy="38" r="2" fill="#fef3c7" />
        <path
          d="M 48 35 L 54 38 L 48 41"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.8"
        />
      </g>

      <text
        x="75"
        y="50"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="40"
        fontWeight="700"
        fill={textColor}
        letterSpacing="-1"
      >
        Voda
      </text>

      <text
        x="75"
        y="50"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="40"
        fontWeight="700"
        fill={`url(#${gradientId})`}
        letterSpacing="-1"
        opacity={theme === 'dark' ? '0.2' : '0.3'}
      >
        Voda
      </text>
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
