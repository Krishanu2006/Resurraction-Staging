import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase',
  {
    variants: {
      variant: {
        default:
          'border-[var(--theme-card-border,var(--theme-border))] bg-[var(--theme-card-bg,rgba(255,255,255,0.05))] text-[var(--theme-accent)] shadow-sm backdrop-blur-md',
        secondary:
          'border-transparent bg-[var(--theme-surface)] text-[var(--theme-text)]',
        destructive:
          'border-transparent bg-red-500/20 text-red-400 border-red-500/40',
        outline:
          'border-[var(--theme-border)] text-[var(--theme-muted)]',
        accent:
          'border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-accent)_15%,transparent)] text-[var(--theme-accent)] shadow-[var(--theme-glow)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
