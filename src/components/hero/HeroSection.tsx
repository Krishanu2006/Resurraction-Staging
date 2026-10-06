import React, {
  useEffect,
  useState,
} from 'react';

import { HeroContent } from './HeroContent';

/* ============================================================
   Theme-specific Three.js scenes
   ------------------------------------------------------------
   Each scene draws the background for a specific theme.
   Adjust the import paths so they point at the folders where
   the components actually live in your project.
   ============================================================ */

import SpaceScene from './SpaceScene';
import ThemeHeroScene from './ThemeHeroScene';
import PandoraHeroScene from './PandoraHeroScene';
import KeplerHeroScene from './KeplerHeroScene';

import {
  type ThemeId,
} from '../../config/theme';

/* ============================================================
   PROPS
   ============================================================ */

interface HeroSectionProps {
  onHeroComplete?: () => void;
  handoff?: boolean;
  themeId?: ThemeId;
}

/* ============================================================
   COMPONENT
   ============================================================ */

export const HeroSection: React.FC<HeroSectionProps> = ({
  onHeroComplete,
  handoff = false,
  themeId = 'tau-ceti' as ThemeId,
}) => {
  const [scrollProgress, setScrollProgress] =
    useState(0);

  const [completeFired, setCompleteFired] =
    useState(false);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const hero = document.getElementById(
        'hero-section'
      );

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

      const clamped = Math.min(
        Math.max(progress, 0),
        1
      );

      setScrollProgress(clamped);

      if (clamped >= 1 && !completeFired) {
        setCompleteFired(true);
        onHeroComplete?.();
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(
          updateProgress
        );
        ticking = true;
      }
    };

    const handleResize = () => {
      updateProgress();
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      handleResize
    );

    updateProgress();

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, [onHeroComplete, completeFired]);

  /* ============================================================
     THEME-SPECIFIC BACKGROUND SCENE
     ------------------------------------------------------------
     tau-ceti  → SpaceScene          (green Adrian world)
     miller    → ThemeHeroScene      (Gargantua black hole)
     pandora   → PandoraHeroScene    (blue gas giant + Earth moon)
     kepler    → KeplerHeroScene     (molten red world)
     ============================================================ */

  const renderBackground = () => {
    switch (themeId) {
      case 'miller':
        return (
          <ThemeHeroScene
            themeId="miller"
            scrollProgress={scrollProgress}
          />
        );

      case 'pandora':
        return (
          <PandoraHeroScene
            scrollProgress={scrollProgress}
          />
        );

      case 'kepler':
        return (
          <KeplerHeroScene
            scrollProgress={scrollProgress}
          />
        );

      case 'tau-ceti':
      default:
        return (
          <SpaceScene
            scrollProgress={scrollProgress}
            themeId={themeId}
          />
        );
    }
  };

  return (
    <section
      id="hero-section"
      style={{
        position: 'relative',
        height: '300vh',
        width: '100%',
        background:
          'var(--theme-background, #02040a)',
      }}
    >
      {/* =====================================================
          STICKY HERO VIEWPORT
          ===================================================== */}

      <div
        className={`hero-sticky${
          handoff
            ? ' hero-sticky--fading'
            : ''
        }`}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 50,
          isolation: 'isolate',
          willChange:
            'opacity, transform, filter',
          transform:
            'translate3d(0, 0, 0)',
          background:
            'var(--theme-background)',
        }}
      >
        {/* =================================================
            LAYER 1 — THEME-SPECIFIC THREE.JS WORLD
            -------------------------------------------------
            Sits at the bottom of the stack. Paints the
            background. Reacts to scroll via scrollProgress.
            ================================================= */}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          {renderBackground()}
        </div>

        {/* =================================================
            LAYER 2 — CINEMATIC VIGNETTE (darkening edges)
            ================================================= */}

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

        {/* =================================================
            LAYER 3 — TOP VIGNETTE
            ================================================= */}

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

        {/* =================================================
            LAYER 4 — BOTTOM VIGNETTE
            ================================================= */}

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

        {/* =================================================
            LAYER 5 — HERO CONTENT
            -------------------------------------------------
            THIS is where the title, subtitle, buttons,
            etc. render. It sits ABOVE the background and
            all vignettes (z-index 20), and BELOW the
            progress indicator and cinematic bridge.

            pointerEvents: 'none' on the wrapper so clicks
            pass through to anything clickable inside
            HeroContent — set pointerEvents: 'auto' on
            the actual interactive elements inside
            HeroContent.
            ================================================= */}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <HeroContent
            scrollProgress={scrollProgress}
          />
        </div>

        {/* =================================================
            LAYER 6 — HERO PROGRESS INDICATOR
            ================================================= */}

        <div
          aria-hidden="true"
          className="hero-progress-indicator"
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 140,
            zIndex: 40,
            pointerEvents: 'none',
            opacity: handoff ? 0 : 1,
            transition: 'opacity 420ms ease',
          }}
        >
          <div
            style={{
              height: 1,
              width: '100%',
              background:
                'rgba(255,255,255,0.16)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${scrollProgress * 100}%`,
                background:
                  'linear-gradient(90deg, var(--theme-accent), var(--theme-primary), var(--theme-cta))',
                boxShadow:
                  '0 0 14px var(--theme-accent)',
                transition:
                  'width 80ms linear',
              }}
            />
          </div>
        </div>

        {/* =================================================
            LAYER 7 — HERO → ABOUT ATMOSPHERIC BRIDGE
            ================================================= */}

        <div
          className="hero-about-bridge"
          aria-hidden="true"
        />

        {/* =================================================
            LAYER 8 — LIGHT TRACE
            ================================================= */}

        <div
          className="hero-about-light-trace"
          aria-hidden="true"
        />

        {/* =================================================
            LAYER 9 — SOFT BOTTOM EDGE
            ================================================= */}

        <div
          className="hero-about-soft-edge"
          aria-hidden="true"
        />
      </div>

      {/* =====================================================
          HERO TRANSITION STYLES
          ===================================================== */}

      <style>
        {`
          .hero-sticky {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);

            transition:
              opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 1100ms cubic-bezier(0.22, 1, 0.36, 1),
              filter 900ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .hero-sticky.hero-sticky--fading {
            opacity: 0;

            transform:
              scale(1.018)
              translate3d(0, -0.35vh, 0);

            filter: blur(2px);
            pointer-events: none;
          }

          /* ===============================================
             ATMOSPHERIC BRIDGE
             =============================================== */

          .hero-about-bridge {
            position: absolute;
            left: 0;
            right: 0;
            bottom: -1px;
            height: 34vh;
            z-index: 55;
            pointer-events: none;
            opacity: 0;

            background:
              radial-gradient(
                ellipse at 50% 100%,
                rgba(34, 211, 238, 0.12) 0%,
                rgba(59, 130, 246, 0.07) 20%,
                rgba(5, 8, 22, 0.55) 52%,
                rgba(3, 5, 16, 0.96) 100%
              ),
              linear-gradient(
                to bottom,
                transparent 0%,
                rgba(3, 5, 16, 0.25) 35%,
                rgba(3, 5, 16, 0.88) 82%,
                #030510 100%
              );

            transform: translate3d(0, 12%, 0);
            will-change: opacity, transform;

            transition:
              opacity 850ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 1100ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .hero-sticky.hero-sticky--fading
            .hero-about-bridge {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          /* ===============================================
             CYAN LIGHT TRACE
             =============================================== */

          .hero-about-light-trace {
            position: absolute;
            left: 50%;
            bottom: -1px;
            width: min(180px, 22vw);
            height: 1px;
            z-index: 58;
            pointer-events: none;
            opacity: 0;
            transform: translateX(-50%) scaleX(0.35);

            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(34, 211, 238, 0.95),
                transparent
              );

            box-shadow:
              0 0 12px rgba(34, 211, 238, 0.65),
              0 0 35px rgba(59, 130, 246, 0.35);

            transition:
              opacity 500ms ease,
              transform 1000ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .hero-sticky.hero-sticky--fading
            .hero-about-light-trace {
            opacity: 1;
            transform: translateX(-50%) scaleX(1);
          }

          /* ===============================================
             SOFT EDGE
             =============================================== */

          .hero-about-soft-edge {
            position: absolute;
            left: 0;
            right: 0;
            bottom: -1px;
            height: 90px;
            z-index: 57;
            pointer-events: none;
            opacity: 0;

            background:
              linear-gradient(
                to bottom,
                transparent,
                rgba(3, 5, 16, 0.42) 42%,
                rgba(3, 5, 16, 0.92) 100%
              );

            transition:
              opacity 700ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .hero-sticky.hero-sticky--fading
            .hero-about-soft-edge {
            opacity: 1;
          }

          /* ===============================================
             REDUCED MOTION
             =============================================== */

          @media (prefers-reduced-motion: reduce) {
            .hero-sticky,
            .hero-about-bridge,
            .hero-about-light-trace,
            .hero-about-soft-edge {
              transition: none;
            }

            .hero-sticky.hero-sticky--fading {
              opacity: 0;
              transform: none;
              filter: none;
            }
          }

          /* ===============================================
             MOBILE
             =============================================== */

          @media (max-width: 700px) {
            .hero-about-bridge { height: 27vh; }
            .hero-about-soft-edge { height: 70px; }

            .hero-about-light-trace {
              width: 110px !important;
              bottom: 22px !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default HeroSection;