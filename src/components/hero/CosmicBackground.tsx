import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CosmicBackgroundProps {
  mouseX?: number;
  mouseY?: number;
  scrollY?: number;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  mouseX = 0,
  mouseY = 0,
  scrollY = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const parallaxX = prefersReducedMotion ? 0 : mouseX * -18;
  const parallaxY = prefersReducedMotion ? 0 : mouseY * -18 + scrollY * 0.12;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: '-7%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        backgroundColor: 'var(--void)',
      }}
    >
      {/* Parallax and cinematic drift are intentionally split into two layers so
          React's inline transform cannot fight the CSS keyframe transform. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.45s cubic-bezier(0.2, 0.8, 0.4, 1)',
          willChange: 'transform',
        }}
      >
        <div
          className={prefersReducedMotion ? '' : 'animate-cosmic-drift'}
          style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
        >
          <img
            src="/assets/hero/cosmic-reference.jpeg"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 42%',
              filter: 'brightness(0.98) contrast(1.2) saturate(1.2)',
            }}
            loading="eager"
          />
        </div>
      </div>

      <div
        className={prefersReducedMotion ? '' : 'animate-background-breathe'}
        style={{
          position: 'absolute',
          inset: '-10%',
          background: 'radial-gradient(ellipse at 50% 48%, rgba(229,27,50,.18), rgba(142,6,23,.08) 42%, transparent 72%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 50% 48%, rgba(9, 3, 5, 0.05) 0%, rgba(0, 0, 0, 0.52) 60%, rgba(0, 0, 0, 0.96) 96%),
            linear-gradient(to bottom, rgba(0,0,0,.78) 0%, transparent 22%, transparent 68%, var(--void) 100%),
            linear-gradient(to right, rgba(0,0,0,.62) 0%, transparent 18%, transparent 82%, rgba(0,0,0,.62) 100%)
          `,
        }}
      />
    </div>
  );
};
