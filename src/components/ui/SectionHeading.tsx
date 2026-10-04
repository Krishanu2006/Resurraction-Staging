import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  code: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  code,
  title,
  subtitle,
  align = 'left',
  className = '',
}) => {
  const isCentered = align === 'center';
  const parts = code.split('—');
  const number = parts[0]?.trim() || '';
  const label = parts.slice(1).join('—').trim();

  return (
    <header
      className={cn(
        'section-heading w-full max-w-[1100px] mb-16 md:mb-20',
        isCentered ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 mb-5',
          isCentered ? 'justify-center' : 'justify-start'
        )}
      >
        <Badge variant="accent" className="px-3 py-1 font-mono tracking-widest text-[11px]">
          {number}
        </Badge>
        <span className="w-9 h-[1px] bg-[var(--theme-border)] opacity-60" aria-hidden="true" />
        {label && (
          <span className="text-[var(--theme-muted)] font-mono text-xs tracking-widest uppercase">
            {label}
          </span>
        )}
      </div>

      <h2
        className={cn(
          'font-nasalization text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--theme-text)] leading-[1.12]',
          isCentered ? 'mx-auto max-w-[900px]' : 'max-w-[950px]'
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            'mt-6 text-base sm:text-lg md:text-xl text-[var(--theme-muted)] leading-relaxed font-sans max-w-[760px]',
            isCentered && 'mx-auto'
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
};