import React from 'react';

type NutriAILogoProps = {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
};

export default function NutriAILogo({ variant = 'full', className = '' }: NutriAILogoProps) {
  const Icon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" aria-hidden="true">
      {/* Circular wellness/balance element */}
      <circle cx="50" cy="50" r="45" fill="currentColor" className="text-primary-container" />
      
      {/* Left leaf */}
      <path d="M50 62 Q20 62 25 35 Q45 35 50 62" fill="currentColor" className="text-primary/70" />
      
      {/* Right leaf */}
      <path d="M50 62 Q80 52 75 25 Q55 30 50 62" fill="currentColor" className="text-primary" />
      
      {/* Center leaf/stem */}
      <path d="M50 62 Q40 32 50 15 Q60 32 50 62" fill="currentColor" className="text-primary-dark opacity-90" style={{ color: '#059669' }} />
      
      {/* Bowl */}
      <path d="M20 60 A 30 30 0 0 0 80 60 Z" fill="currentColor" style={{ color: '#064e3b' }} />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Icon />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0">
          <Icon />
        </div>
        <span className="font-headline-md text-lg md:text-xl tracking-tight text-on-surface font-bold leading-none select-none">
          NutriAI
        </span>
      </div>
    );
  }

  // Full variant (Welcome screen)
  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="w-16 h-16 md:w-20 md:h-20 mb-4 flex-shrink-0">
        <Icon />
      </div>
      <div className="flex flex-col items-center">
        <span className="font-headline-lg text-3xl md:text-4xl tracking-tight text-on-surface font-bold leading-none mb-2 select-none">
          NutriAI
        </span>
        <span className="font-body-sm text-xs md:text-sm font-semibold tracking-[0.15em] uppercase text-primary select-none">
          Your Healthy Companion
        </span>
      </div>
    </div>
  );
}
