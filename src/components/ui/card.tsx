import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, onMouseMove, onMouseLeave, children, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = React.useState({ x: 50, y: 50 });
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = innerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const rx = -((e.clientY - rect.top) / rect.height - 0.5) * 7;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 7;
      setCoords({ x, y });
      setTilt({ rx, ry });
      setIsHovered(true);
    }
    onMouseMove?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setTilt({ rx: 0, ry: 0 });
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  return (
    <div
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      data-card="true"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative rounded-xl border border-[color-mix(in_srgb,var(--theme-border)_65%,rgba(255,255,255,0.15))] bg-[color-mix(in_srgb,var(--theme-surface)_84%,rgba(0,0,0,0.75))] text-[var(--theme-text)] shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-2xl transition-all duration-300',
        className
      )}
      style={{
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) translateZ(6px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transformStyle: 'preserve-3d',
        ...style,
      }}
      {...props}
    >
      {/* 3D Holographic Glare Reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(circle 350px at ${coords.x}% ${coords.y}%, color-mix(in srgb, var(--theme-accent) 18%, transparent), transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-nasalization text-xl font-bold leading-none tracking-tight text-[var(--theme-text)]',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
};
