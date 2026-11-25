import React from 'react';

interface ProviderBadgeProps {
  shortCode: string;
  badgeColor: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-[14px]',
  md: 'w-10 h-10 text-[17px]',
  lg: 'w-11 h-11 text-[18px]',
};

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({
  shortCode,
  badgeColor,
  name,
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center font-display font-bold text-white shrink-0 select-none shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${className}`}
      style={{ backgroundColor: badgeColor }}
      aria-label={name ? `${name} badge` : undefined}
    >
      <span className="leading-none">{shortCode}</span>
    </div>
  );
};
