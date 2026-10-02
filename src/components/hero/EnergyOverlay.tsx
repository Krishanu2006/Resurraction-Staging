import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface EnergyOverlayProps {
  mouseX?: number;
  mouseY?: number;
  scrollY?: number;
}

export const EnergyOverlay: React.FC<EnergyOverlayProps> = ({
  mouseX = 0,
  mouseY = 0,
  scrollY = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const parallaxX = prefersReducedMotion ? 0 : mouseX * -30;
  const parallaxY = prefersReducedMotion ? 0 : mouseY * -30 + scrollY * 0.15;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {/* Central Volumetric Crimson & Hot Red Plasma Flare */}
      <div
        className={prefersReducedMotion ? '' : 'animate-energy-pulse'}
        style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          right: '5%',
          height: '60%',
          background: `
            radial-gradient(ellipse at 50% 45%, rgba(229, 27, 50, 0.22) 0%, rgba(142, 6, 23, 0.14) 40%, transparent 70%),
            radial-gradient(circle at 65% 38%, rgba(242, 177, 138, 0.12) 0%, transparent 45%)
          `,
          filter: 'blur(32px)',
          transform: `translate3d(${parallaxX * 0.6}px, ${parallaxY * 0.6}px, 0)`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)',
        }}
      />

      {/* Atmospheric Horizontal Light Stream Sweeps */}
      {!prefersReducedMotion && (
        <>
          <div
            className="animate-energy-sweep"
            style={{
              position: 'absolute',
              top: '32%',
              left: 0,
              width: '55vw',
              height: '180px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(229, 27, 50, 0.16) 45%, rgba(242, 177, 138, 0.22) 75%, transparent 100%)',
              filter: 'blur(28px)',
              mixBlendMode: 'screen',
            }}
          />
          <div
            className="animate-energy-sweep"
            style={{
              position: 'absolute',
              top: '44%',
              left: 0,
              width: '40vw',
              height: '120px',
              animationDelay: '7s',
              background: 'linear-gradient(90deg, transparent 0%, rgba(142, 6, 23, 0.2) 50%, rgba(255, 244, 237, 0.12) 80%, transparent 100%)',
              filter: 'blur(22px)',
              mixBlendMode: 'screen',
            }}
          />
        </>
      )}

      {/* Atmospheric Haze / Cosmic Dust Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(142, 6, 23, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 40%, rgba(229, 27, 50, 0.08) 0%, transparent 50%)
          `,
          mixBlendMode: 'screen',
          transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
        }}
      />

      {/* Fine Energy Filaments (SVG Vector Plasma Ribbons) */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.62,
        }}
      >
        <path
          className={prefersReducedMotion ? '' : 'animate-plasma-flow'}
          d="M -100 480 Q 300 420, 700 460 T 1600 440"
          fill="none"
          stroke="url(#plasma-ribbon-1)"
          strokeWidth="2.2"
          filter="drop-shadow(0 0 6px rgba(242, 177, 138, 0.8))"
        />
        <path
          className={prefersReducedMotion ? '' : 'animate-plasma-flow plasma-flow-delay'}
          d="M -50 510 Q 400 540, 900 490 T 1700 520"
          fill="none"
          stroke="url(#plasma-ribbon-2)"
          strokeWidth="1.6"
          strokeDasharray="6 14"
        />
        <defs>
          <linearGradient id="plasma-ribbon-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8E0617" stopOpacity="0" />
            <stop offset="35%" stopColor="#E51B32" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F2B18A" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#E51B32" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8E0617" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="plasma-ribbon-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFD0B3" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8E0617" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
