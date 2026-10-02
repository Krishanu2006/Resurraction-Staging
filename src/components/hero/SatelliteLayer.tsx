import React, { useMemo } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * SatelliteLayer
 * ---------------------------------------------------------------------------
 * A fully independent ambient layer: a handful of small spacecraft drifting
 * slowly across the hero on different trajectories.
 *
 * - Own keyframes (injected below, all prefixed `sat-`) — animations.css and
 *   every existing keyframe/class are untouched.
 * - No mouse/scroll parallax, no shared state with the particle system.
 * - Sits at z-index 2 (below particles at 3 and hero content), pointer-events
 *   disabled and aria-hidden.
 * - Honors prefers-reduced-motion by rendering nothing.
 */

type CraftKind = 'panel' | 'probe' | 'station';

interface Craft {
  id: number;
  kind: CraftKind;
  size: number;        // px width
  duration: number;    // seconds for one full crossing
  delay: number;       // seconds (negative = already in flight)
  from: [number, number]; // start point, vw / vh
  to: [number, number];   // end point, vw / vh
  opacity: number;
  color: string;       // glow / accent colour
  blinkDelay: number;
}

// Hand-authored so the trajectories feel deliberate rather than random.
const CRAFTS: Craft[] = [
  // Long, slow left → right sweep across the upper sky
  { id: 0, kind: 'panel',   size: 30, duration: 130, delay: -34, from: [-8, 16],  to: [108, 30], opacity: 0.8,  color: '#F2B18A', blinkDelay: 0 },
  // Right → left, lower, fastest and smallest
  { id: 1, kind: 'probe',   size: 16, duration: 78,  delay: -50, from: [110, 74], to: [-10, 58], opacity: 0.72, color: '#FFD0B3', blinkDelay: -0.8 },
  // Steep diagonal, top-right → bottom-left
  { id: 2, kind: 'station', size: 36, duration: 160, delay: -90, from: [90, -10], to: [8, 108],  opacity: 0.6,  color: '#E51B32', blinkDelay: -1.6 },
  // Shallow rising path, bottom-left → top-right
  { id: 3, kind: 'probe',   size: 20, duration: 105, delay: -12, from: [-8, 88],  to: [108, 40], opacity: 0.68, color: '#FFF4ED', blinkDelay: -0.4 },
  // Descending left → right, mid-size
  { id: 4, kind: 'panel',   size: 24, duration: 145, delay: -118, from: [-10, 44], to: [110, 92], opacity: 0.66, color: '#F2B18A', blinkDelay: -2.1 },
  // Tiny, distant, almost vertical drift
  { id: 5, kind: 'probe',   size: 12, duration: 190, delay: -60, from: [24, 112], to: [38, -12], opacity: 0.5,  color: '#E51B32', blinkDelay: -1.2 },
];

const CSS = `
@keyframes sat-travel {
  0%   { transform: translate3d(var(--sat-x0), var(--sat-y0), 0); opacity: 0; }
  6%   { opacity: var(--sat-opacity); }
  94%  { opacity: var(--sat-opacity); }
  100% { transform: translate3d(var(--sat-x1), var(--sat-y1), 0); opacity: 0; }
}
@keyframes sat-blink {
  0%, 82%, 100% { opacity: .15; }
  88%           { opacity: 1; }
}
@keyframes sat-layer-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes sat-bob {
  0%, 100% { transform: rotate(var(--sat-angle)) translateY(0); }
  50%      { transform: rotate(var(--sat-angle)) translateY(-1.5px); }
}
.sat-layer { animation: sat-layer-in 4s ease-out 2.4s both; }
.sat-mover {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  animation: sat-travel var(--sat-duration) linear var(--sat-delay) infinite;
  will-change: transform, opacity;
}
.sat-body {
  display: block;
  transform: rotate(var(--sat-angle));
  animation: sat-bob 9s ease-in-out infinite;
}
.sat-beacon { animation: sat-blink 4.5s ease-in-out var(--sat-blink-delay) infinite; }
@media (prefers-reduced-motion: reduce) {
  .sat-layer, .sat-mover, .sat-body, .sat-beacon { animation: none !important; }
}
`;

/** Small inline SVG silhouettes. Drawn nose-pointing-right (0°). */
const CraftSvg: React.FC<{ kind: CraftKind; color: string }> = ({ kind, color }) => {
  const hull = '#C9CED6';
  const dark = '#2A2D36';
  switch (kind) {
    case 'panel': // classic satellite with two solar wings
      return (
        <svg viewBox="0 0 40 20" width="100%" style={{ display: 'block', overflow: 'visible' }}>
          <rect x="1" y="5" width="12" height="10" rx="0.8" fill={dark} stroke={color} strokeWidth="0.6" opacity="0.95" />
          <rect x="27" y="5" width="12" height="10" rx="0.8" fill={dark} stroke={color} strokeWidth="0.6" opacity="0.95" />
          <path d="M5 5v10M9 5v10M31 5v10M35 5v10" stroke={color} strokeWidth="0.35" opacity="0.7" />
          <rect x="13" y="9.2" width="3" height="1.6" fill={hull} />
          <rect x="24" y="9.2" width="3" height="1.6" fill={hull} />
          <rect x="16" y="6.5" width="8" height="7" rx="1.4" fill={hull} />
          <circle cx="20" cy="10" r="1.6" fill={dark} />
          <circle className="sat-beacon" cx="22.6" cy="7.6" r="0.9" fill={color} />
        </svg>
      );
    case 'probe': // slim dart-shaped craft
      return (
        <svg viewBox="0 0 40 16" width="100%" style={{ display: 'block', overflow: 'visible' }}>
          <path d="M3 8 L14 3 L30 5.5 L38 8 L30 10.5 L14 13 Z" fill={hull} stroke={color} strokeWidth="0.5" />
          <path d="M14 3 L9 0.5 L11 5 Z M14 13 L9 15.5 L11 11 Z" fill={dark} stroke={color} strokeWidth="0.4" />
          <rect x="20" y="6.8" width="7" height="2.4" rx="1.2" fill={dark} />
          <circle cx="3.5" cy="8" r="1.3" fill={color} opacity="0.9" />
          <circle className="sat-beacon" cx="30" cy="5.6" r="0.8" fill={color} />
        </svg>
      );
    case 'station': // modular ring-and-truss platform
    default:
      return (
        <svg viewBox="0 0 48 24" width="100%" style={{ display: 'block', overflow: 'visible' }}>
          <path d="M2 12h44" stroke={hull} strokeWidth="1" />
          <rect x="3" y="3" width="8" height="6" fill={dark} stroke={color} strokeWidth="0.5" />
          <rect x="3" y="15" width="8" height="6" fill={dark} stroke={color} strokeWidth="0.5" />
          <rect x="37" y="3" width="8" height="6" fill={dark} stroke={color} strokeWidth="0.5" />
          <rect x="37" y="15" width="8" height="6" fill={dark} stroke={color} strokeWidth="0.5" />
          <ellipse cx="24" cy="12" rx="9" ry="6.5" fill="none" stroke={color} strokeWidth="0.7" opacity="0.85" />
          <rect x="18" y="8.5" width="12" height="7" rx="2" fill={hull} />
          <rect x="21" y="10.5" width="6" height="3" rx="1" fill={dark} />
          <circle className="sat-beacon" cx="24" cy="6" r="0.9" fill={color} />
        </svg>
      );
  }
};

export const SatelliteLayer: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  // Pre-compute heading so each craft faces the way it flies.
  const crafts = useMemo(
    () =>
      CRAFTS.map((c) => {
        const dx = c.to[0] - c.from[0];
        const dy = c.to[1] - c.from[1];
        // vw/vh are close enough to equal for a heading; keeps this CSS-only.
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return { ...c, angle };
      }),
    []
  );

  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="sat-layer"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 2, // behind ParticleLayer (3) and HeroContent
      }}
    >
      <style>{CSS}</style>
      {crafts.map((c) => (
        <div
          key={c.id}
          className="sat-mover"
          style={
            {
              width: `${c.size}px`,
              '--sat-x0': `${c.from[0]}vw`,
              '--sat-y0': `${c.from[1]}vh`,
              '--sat-x1': `${c.to[0]}vw`,
              '--sat-y1': `${c.to[1]}vh`,
              '--sat-duration': `${c.duration}s`,
              '--sat-delay': `${c.delay}s`,
              '--sat-opacity': c.opacity,
              '--sat-angle': `${c.angle}deg`,
              '--sat-blink-delay': `${c.blinkDelay}s`,
              filter: `drop-shadow(0 0 ${Math.max(3, c.size / 5)}px ${c.color}) drop-shadow(0 0 ${c.size / 2}px ${c.color}55)`,
            } as React.CSSProperties
          }
        >
          <span className="sat-body">
            <CraftSvg kind={c.kind} color={c.color} />
          </span>
        </div>
      ))}
    </div>
  );
};
