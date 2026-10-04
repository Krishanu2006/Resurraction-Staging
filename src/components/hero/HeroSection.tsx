import React, {
  useEffect,
  useState,
} from 'react';

import { HeroContent } from './HeroContent';
import SpaceScene from './SpaceScene';
import { type ThemeId } from '../../config/theme';

interface HeroSectionProps {
  /**
   * Fired once when Hero reaches its absolute end.
   */
  onHeroComplete?: () => void;

  /**
   * Starts the cinematic handoff into About.
   */
  handoff?: boolean;

  /**
   * Active world theme to align the video grading & mood.
   */
  themeId?: ThemeId;
}

export const HeroSection: React.FC<
  HeroSectionProps
> = ({
  onHeroComplete,
  handoff = false,
  themeId,
}) => {
  const [
    scrollProgress,
    setScrollProgress,
  ] = useState(0);

  const [
    completeFired,
    setCompleteFired,
  ] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const hero =
        document.getElementById(
          'hero-section'
        );

      if (!hero) {
        ticking = false;
        return;
      }

      const rect =
        hero.getBoundingClientRect();

      const heroHeight =
        hero.offsetHeight;

      const viewportHeight =
        window.innerHeight;

      const scrollDistance =
        heroHeight -
        viewportHeight;

      if (
        scrollDistance <= 0
      ) {
        setScrollProgress(0);
        ticking = false;
        return;
      }

      const travelled =
        Math.min(
          Math.max(
            -rect.top,
            0
          ),
          scrollDistance
        );

      const progress =
        travelled /
        scrollDistance;

      const clamped =
        Math.min(
          Math.max(
            progress,
            0
          ),
          1
        );

      setScrollProgress(
        clamped
      );

      if (
        clamped >= 1 &&
        !completeFired
      ) {
        setCompleteFired(
          true
        );

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
      {
        passive: true,
      }
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
  }, [
    onHeroComplete,
    completeFired,
  ]);

  return (
    <section
      id="hero-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '300vh',
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
            INTERACTIVE THREE.JS SPACE SCENE (THEME MATCHED)
            ================================================= */}

        <SpaceScene
          scrollProgress={scrollProgress}
          themeId={themeId}
        />

        {/* =================================================
            HERO CONTENT
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
            scrollProgress={
              scrollProgress
            }
          />
        </div>

        {/* =================================================
            SCROLL PROGRESS
            ================================================= */}

        <div
          aria-hidden="true"
          className="hero-progress-indicator"
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform:
              'translateX(-50%)',
            width: 140,
            zIndex: 40,
            pointerEvents: 'none',
            opacity:
              handoff ? 0 : 1,
            transition:
              'opacity 420ms ease',
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
                width: `${
                  scrollProgress * 100
                }%`,
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
      </div>

      {/* =====================================================
          HERO TRANSITION
          ===================================================== */}

      <style>
        {`
          .hero-sticky {
            opacity: 1;

            transform:
              translate3d(
                0,
                0,
                0
              );

            filter:
              blur(0);

            transition:
              opacity 900ms
                cubic-bezier(
                  0.22,
                  1,
                  0.36,
                  1
                ),

              transform 1100ms
                cubic-bezier(
                  0.22,
                  1,
                  0.36,
                  1
                ),

              filter 900ms
                cubic-bezier(
                  0.22,
                  1,
                  0.36,
                  1
                );
          }

          .hero-sticky.hero-sticky--fading {
            opacity: 0;

            transform:
              scale(1.018)
              translate3d(
                0,
                -0.35vh,
                0
              );

            filter:
              blur(2px);

            pointer-events:
              none;
          }

          /* ===============================================
             REDUCED MOTION
             =============================================== */

          @media (
            prefers-reduced-motion: reduce
          ) {
            .hero-sticky {
              transition:
                none;
            }

            .hero-sticky.hero-sticky--fading {
              opacity: 0;

              transform:
                none;

              filter:
                none;
            }
          }

          /* ===============================================
             MOBILE
             =============================================== */

          @media (
            max-width: 700px
          ) {
            .hero-progress-indicator {
              width:
                110px !important;

              bottom:
                22px !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default HeroSection;