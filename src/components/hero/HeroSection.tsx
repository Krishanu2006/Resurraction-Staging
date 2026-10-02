import React, { useEffect, useState } from 'react';
import { ScrollVideoBackground } from './ScrollVideoBackground';
import { HeroContent } from './HeroContent';

interface HeroSectionProps {
  /**
   * Fired once, the instant hero progress reaches 1.0.
   */
  onHeroComplete?: () => void;

  /**
   * When true, the hero begins its slow fade-out.
   * The fade duration matches the About section's fade-in.
   */
  handoff?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onHeroComplete,
  handoff = false,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [completeFired, setCompleteFired] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const hero = document.getElementById('hero-section');

      if (!hero) {
        ticking = false;
        return;
      }

      const rect = hero.getBoundingClientRect();
      const heroHeight = hero.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrollDistance = heroHeight - viewportHeight;

      if (scrollDistance <= 0) {
        setScrollProgress(0);
        ticking = false;
        return;
      }

      const travelled = Math.min(
        Math.max(-rect.top, 0),
        scrollDistance
      );

      const progress = travelled / scrollDistance;
      const clamped = Math.min(Math.max(progress, 0), 1);

      setScrollProgress(clamped);

      /*
       * Fire the crossfade trigger exactly once, the moment
       * progress reaches 1.0. Do NOT reset when scrolling
       * back up — the fade is a one-way handoff.
       */
      if (clamped >= 1 && !completeFired) {
        setCompleteFired(true);
        onHeroComplete?.();
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    const handleResize = () => {
      updateProgress();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [onHeroComplete, completeFired]);

  return (
    <section
      id="hero-section"
      style={{
        position: 'relative',
        height: '300vh',
        width: '100%',
      }}
    >
      {/* =====================================================
          STICKY CINEMATIC VIEWPORT
          ===================================================== */}

      <div
        className={`hero-sticky${handoff ? ' hero-sticky--fading' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          willChange: 'opacity',
        }}
      >
        <ScrollVideoBackground progress={scrollProgress} />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <HeroContent scrollProgress={scrollProgress} />
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            pointerEvents: 'none',
            background: `
              radial-gradient(
                circle at center,
                transparent 0%,
                rgba(5, 8, 22, 0.03) 35%,
                rgba(5, 8, 22, 0.25) 72%,
                rgba(5, 8, 22, 0.58) 100%
              )
            `,
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '20%',
            zIndex: 11,
            pointerEvents: 'none',
            background:
              'linear-gradient(to bottom, rgba(3,5,16,.55), transparent)',
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '24%',
            zIndex: 11,
            pointerEvents: 'none',
            background:
              'linear-gradient(to top, rgba(3,5,16,.75), transparent)',
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 140,
            zIndex: 40,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              height: 1,
              width: '100%',
              background: 'rgba(255,255,255,.16)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${scrollProgress * 100}%`,
                background:
                  'linear-gradient(90deg, var(--stellar-cyan), var(--nebula-purple))',
                boxShadow: '0 0 12px rgba(34,211,238,.6)',
              }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          HERO FADE-OUT STYLE

          Applied only when `.hero-sticky--fading` is present,
          which happens the moment `handoff` flips to true.

          Duration and easing MUST match the About section's
          fade-in, so the crossfade is symmetric.
          ===================================================== */}

      <style>
        {`
          .hero-sticky {
            opacity: 1;
          }

          .hero-sticky.hero-sticky--fading {
            animation: heroFadeOut 900ms cubic-bezier(0.4, 0, 0.2, 1)
              forwards;
          }

          @keyframes heroFadeOut {
            from { opacity: 1; }
            to   { opacity: 0; }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-sticky.hero-sticky--fading {
              animation: none;
              opacity: 0;
            }
          }
        `}
      </style>
    </section>
  );
};