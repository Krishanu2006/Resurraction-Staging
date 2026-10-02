import React, { useMemo } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ParticleLayerProps { mouseX?: number; mouseY?: number; scrollY?: number; }
interface Particle { id: number; top: string; left: string; size: number; opacity: number; color: string; delay: string; duration: string; layer: 'bg'|'mid'|'fg'; }

export const ParticleLayer: React.FC<ParticleLayerProps> = ({ mouseX = 0, mouseY = 0, scrollY = 0 }) => {
  const prefersReducedMotion = useReducedMotion();
  const particles = useMemo<Particle[]>(() => {
    const colors = ['#F2B18A', '#FFF4ED', '#E51B32', '#FFD0B3', '#FFFFFF'];
    return Array.from({ length: 42 }, (_, i) => {
      const layer: Particle['layer'] = i % 3 === 0 ? 'fg' : i % 3 === 1 ? 'mid' : 'bg';
      return {
        id: i,
        top: `${(i * 17 + 7) % 92 + 4}%`,
        left: `${(i * 29 + 11) % 94 + 3}%`,
        size: layer === 'fg' ? 3 : layer === 'mid' ? 2 : 1.2,
        opacity: layer === 'fg' ? 0.9 : layer === 'mid' ? 0.62 : 0.38,
        color: colors[i % colors.length],
        delay: `${-((i * 0.61) % 9)}s`,
        duration: `${7 + (i % 7)}s`,
        layer,
      };
    });
  }, []);

  return (
    <div aria-hidden="true" style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:3 }}>
      {particles.map((p) => {
        const factor = p.layer === 'fg' ? 38 : p.layer === 'mid' ? 22 : 10;
        const x = prefersReducedMotion ? 0 : mouseX * -factor;
        const y = prefersReducedMotion ? 0 : mouseY * -factor + scrollY * 0.004 * factor;
        return (
          <span key={p.id} style={{ position:'absolute', top:p.top, left:p.left, transform:`translate3d(${x}px, ${y}px, 0)`, transition:prefersReducedMotion?'none':'transform .35s ease-out', willChange:'transform' }}>
            <span
              style={{ display:'block', width:`${p.size}px`, height:`${p.size}px`, borderRadius:'50%', background:p.color, opacity:p.opacity, boxShadow:`0 0 ${p.size*4}px ${p.color}`, animation:prefersReducedMotion?'none':`particleDrift ${p.duration} ease-in-out infinite alternate ${p.delay}`, willChange:'transform, opacity' }}
            />
          </span>
        );
      })}
    </div>
  );
};
