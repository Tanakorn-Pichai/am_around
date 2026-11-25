import React from 'react';

interface AmAroundIconProps {
  size?: number;
  className?: string;
}

/**
 * Exact am around squircle app icon:
 * - Vibrant orange squircle (#FF6B00 -> #FF7A00)
 * - Intersecting golden-orange road accents at the base
 * - Solid white map-pin silhouette
 * - Dark charcoal scooter & rider silhouette with orange helmet and 3 horizontal speed lines
 * - Two curved white radar/signal waves radiating from top-right of the pin
 */
export const AmAroundIcon: React.FC<AmAroundIconProps> = ({ size = 44, className = '' }) => {
  const gradId = React.useId();
  const clipId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="am around logo"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#FF5E00" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="100" height="100" rx="23" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* Vibrant orange squircle background */}
        <rect x="0" y="0" width="100" height="100" rx="23" fill={`url(#${gradId})`} />

        {/* Subtle warm top sheen */}
        <ellipse cx="32" cy="14" rx="48" ry="26" fill="#FF9A3C" fillOpacity="0.22" />

        {/* Intersecting golden-yellow road lines at the base */}
        <path
          d="M-6 89 L44 74 L106 94"
          stroke="#FFC247"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <path
          d="M10 102 L48 76 L92 70"
          stroke="#FFD97D"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
        <ellipse cx="47" cy="83" rx="14" ry="3.2" fill="#B83D00" fillOpacity="0.28" />

        {/* Two curved white radar / Wi-Fi signal waves at top-right */}
        <path
          d="M71 22 C77 24.5 81.5 29.5 83.5 35.5"
          stroke="#FFFFFF"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M75 14 C84 17.5 90 25 92.5 34"
          stroke="#FFFFFF"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeOpacity="0.88"
          fill="none"
        />

        {/* Solid white map-pin silhouette */}
        <path
          d="M47 16 C31.5 16 19 28.5 19 43.8 C19 60.2 37.6 74.8 45.2 81.4 C46.2 82.3 47.8 82.3 48.8 81.4 C56.4 74.8 75 60.2 75 43.8 C75 28.5 62.5 16 47 16 Z"
          fill="#FFFFFF"
        />

        {/* Three horizontal speed lines behind the scooter rider */}
        <line x1="25.5" y1="40.5" x2="32.5" y2="40.5" stroke="#1A1A1A" strokeWidth="2.1" strokeLinecap="round" />
        <line x1="23.8" y1="45" x2="31.5" y2="45" stroke="#1A1A1A" strokeWidth="2.1" strokeLinecap="round" />
        <line x1="26.5" y1="49.5" x2="32.5" y2="49.5" stroke="#1A1A1A" strokeWidth="2.1" strokeLinecap="round" />

        {/* Stylized dark charcoal scooter & rider silhouette */}
        {/* Rear & front wheels */}
        <circle cx="38.5" cy="54.2" r="4.6" fill="#1A1A1A" />
        <circle cx="38.5" cy="54.2" r="1.8" fill="#FFFFFF" />
        <circle cx="58.5" cy="54.2" r="4.6" fill="#1A1A1A" />
        <circle cx="58.5" cy="54.2" r="1.8" fill="#FFFFFF" />

        {/* Scooter chassis & front fairing */}
        <path
          d="M35.5 51.2 H47.2 C49.5 51.2 51.6 49.4 52.8 46.8 L55.4 40.5 H58.2 L55.5 49.2 L60.2 51.2 H55.6 C53.2 51.2 51.6 54 48.8 54 H36.2 Z"
          fill="#1A1A1A"
        />
        {/* Scooter seat & rear body */}
        <path
          d="M34.2 46.5 C34.2 44.8 35.8 44 38.4 44 H45.8 C47 44 47.6 45.2 47.2 46.6 L45.8 50.8 H35.2 Z"
          fill="#1A1A1A"
        />
        {/* Handlebar */}
        <path
          d="M53.5 38.6 L59.4 37.8"
          stroke="#1A1A1A"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Rider torso & arm reaching to handlebar */}
        <path
          d="M42.8 44.5 L45.8 36.8 C46.4 35.2 48.2 34.7 49.6 35.6 L54.6 38.6"
          stroke="#1A1A1A"
          strokeWidth="4.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Rider leg */}
        <path
          d="M43.8 44.4 L48.2 46.5 L48.6 51.5"
          stroke="#1A1A1A"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bright orange rider helmet */}
        <circle cx="49.2" cy="30.2" r="4.9" fill="#FF6B00" />
        {/* Helmet visor accent */}
        <path
          d="M51.2 28.8 C52.8 29.1 53.8 30.2 53.8 31.6 H51.2 Z"
          fill="#1A1A1A"
        />
      </g>
    </svg>
  );
};

interface AmAroundWordmarkProps {
  variant?: 'onOrange' | 'onLight';
  iconSize?: number;
  className?: string;
}

export const AmAroundBrandLockup: React.FC<AmAroundWordmarkProps> = ({
  variant = 'onOrange',
  iconSize = 42,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <AmAroundIcon
        size={iconSize}
        className={
          variant === 'onOrange'
            ? 'rounded-[11px] ring-2 ring-white/25 shadow-sm shrink-0'
            : 'rounded-[11px] shadow-sm shrink-0'
        }
      />
      <span
        className={`font-display font-bold tracking-[-0.02em] leading-none whitespace-nowrap ${
          variant === 'onOrange' ? 'text-white text-[22px]' : 'text-[#1A1A1A] text-[20px]'
        }`}
      >
        am around
      </span>
    </div>
  );
};
