import React from 'react';

interface LionLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const LionLogo: React.FC<LionLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    sm: { icon: 20, text: 'text-sm' },
    md: { icon: 28, text: 'text-base' },
    lg: { icon: 44, text: 'text-xl' },
    xl: { icon: 64, text: 'text-2xl' },
  };

  const dim = sizeMap[size].icon;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-[var(--accent-light)] border border-[var(--accent-border)] p-1.5 shadow-sm transition-all"
        style={{ width: dim + 8, height: dim + 8 }}
      >
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[var(--accent)] drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
        >
          {/* Stylized Lion Face & Infinity Silhouette */}
          {/* Mane outer contours */}
          <path
            d="M24 4C14 4 6 12 6 22C6 31 12 39 24 44C36 39 42 31 42 22C42 12 34 4 24 4Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          />
          {/* Inner Lion Crown / Infinity Knot */}
          <path
            d="M17 17C14 17 12 19.5 12 22.5C12 26 16 28 24 33C32 28 36 26 36 22.5C36 19.5 34 17 31 17C27.5 17 25 19.5 24 21C23 19.5 20.5 17 17 17Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lion Eyes & Nose Bridge */}
          <path
            d="M19 22L21 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M29 22L27 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Lion Muzzle / Nose */}
          <path
            d="M22 28H26L24 30.5L22 28Z"
            fill="currentColor"
          />
          <path
            d="M24 30.5V34"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1 text-[15px] font-mono">
            LIONFINITY <span className="text-emerald-500 font-bold">AI</span>
          </span>
        </div>
      )}
    </div>
  );
};
