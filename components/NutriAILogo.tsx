import React from 'react';

type NutriAILogoProps = {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
};

export default function NutriAILogo({ variant = 'full', className = '' }: NutriAILogoProps) {
  const Icon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" aria-hidden="true">
      {/* Balance Arc */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" className="text-primary/30" strokeWidth="2" strokeDasharray="6 4" />
      
      {/* Sun/Wellness circle */}
      <circle cx="50" cy="45" r="32" fill="currentColor" className="text-primary-container" />
      
      {/* Left accent leaf */}
      <path d="M45 55 Q20 55 25 30 Q40 30 45 55" fill="currentColor" className="text-primary/70" />
      
      {/* Orange accent (carrot/squash) */}
      <path d="M40 55 L25 20 Q35 15 42 25 L47 55 Z" fill="#f59e0b" />
      
      {/* Center dark leaf */}
      <path d="M50 55 Q35 25 50 10 Q65 25 50 55" fill="currentColor" style={{ color: '#059669' }} className="text-primary-dark opacity-90" />
      
      {/* Prominent right leaf */}
      <path d="M55 55 Q85 45 80 15 Q60 25 55 55" fill="currentColor" className="text-primary" />
      
      {/* Small floating accents (vitamins/energy) */}
      <circle cx="25" cy="45" r="3" fill="#fbbf24" />
      <circle cx="75" cy="35" r="4" fill="#34d399" />
      <circle cx="65" cy="15" r="2.5" fill="#f59e0b" />
      <circle cx="35" cy="15" r="2" fill="currentColor" className="text-primary" />

      {/* Bowl */}
      <path d="M15 55 Q15 85 50 85 Q85 85 85 55 Z" fill="currentColor" style={{ color: '#065f46' }} />
      {/* Bowl Rim */}
      <ellipse cx="50" cy="55" rx="35" ry="4" fill="currentColor" style={{ color: '#064e3b' }} />
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
