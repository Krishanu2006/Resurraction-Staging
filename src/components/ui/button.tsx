import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none tracking-wider',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--theme-cta,var(--theme-primary))] text-[var(--theme-text,#ffffff)] hover:bg-[var(--theme-cta-hover,#ffffff)] hover:text-black shadow-[var(--theme-glow,0_0_20px_rgba(0,0,0,0.2))] border border-[var(--theme-border,transparent)]',
        cosmic:
          'relative overflow-hidden bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white hover:opacity-95 shadow-[var(--theme-glow)] border border-[var(--theme-card-border)]',
        destructive:
          'bg-red-500/90 text-white hover:bg-red-600 shadow-sm',
        outline:
          'border border-[var(--theme-card-border,var(--theme-border))] bg-[var(--theme-card-bg,rgba(15,23,42,0.4))] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] hover:border-[var(--theme-accent)] backdrop-blur-md',
        secondary:
          'bg-[var(--theme-surface,#18130a)] text-[var(--theme-text)] hover:bg-[var(--theme-card-bg)] border border-[var(--theme-border)]',
        ghost:
          'text-[var(--theme-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)]',
        link:
          'text-[var(--theme-accent)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base font-semibold',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
