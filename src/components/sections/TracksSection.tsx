import React, { useEffect, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import tauCetiImage from './track_images/taucetie.png';
import millerImage from './track_images/miller.png';
import pandoraImage from './track_images/pandora.png';
import keplerImage from './track_images/kepler.png';

import { SectionHeading } from '../ui/SectionHeading';


type PlanetCard = {
  id: string;
  image: string;
  name: string;
  accent: string;

  /* Added content only */
  event: string;
  title: string;
  description: string;
  format: string;
  skills: string;
  status: string;
};


const planetCards: PlanetCard[] = [
  {
    id: 'tau-ceti-e',
    image: tauCetiImage,
    name: 'Tau Ceti e',
    accent: '#58d68d',

    event: 'BUILDATHON',
    title: 'Build. Break. Rebuild.',
    description:
      'Turn an idea into a working prototype. Solve a real problem, build fast, and present what you create.',
    format: 'TEAM • 12–24 HRS',
    skills: 'WEB • AI • IOT',
    status: 'BUILD SOMETHING REAL',
  },

  {
    id: 'millers-planet',
    image: millerImage,
    name: "Miller's Planet",
    accent: '#94a3b8',

    event: 'HACKBOX',
    title: 'Enter. Hack. Escape.',
    description:
      'Face unexpected challenges, experiment rapidly, and ship a solution before the clock reaches zero.',
    format: 'SOLO / TEAM',
    skills: 'AI • WEB • CYBER',
    status: 'SYSTEMS UNLOCKED',
  },

  {
    id: 'pandora',
    image: pandoraImage,
    name: 'Pandora',
    accent: '#00d2ff',

    event: 'COMPETITIVE PROGRAMMING',
    title: 'Think Beyond O(n).',
    description:
      'Solve algorithmic problems where every millisecond matters. Logic, DSA and optimization decide the outcome.',
    format: 'INDIVIDUAL / TEAM',
    skills: 'DSA • DP • GRAPHS',
    status: 'RUNTIME IS EVERYTHING',
  },

  {
    id: 'kepler-186f',
    image: keplerImage,
    name: 'Kepler-186f',
    accent: '#ff7043',

    event: 'WORKSHOPS',
    title: 'Learn. Build. Evolve.',
    description:
      'Hands-on technical sessions taking you from concepts to practical experiments with modern technologies.',
    format: 'BEGINNER → ADVANCED',
    skills: 'AI • CLOUD • QUANTUM',
    status: 'KNOWLEDGE TRANSMISSION',
  },
];


const clamp = (
  value: number,
  min: number,
  max: number,
) => Math.min(Math.max(value, min), max);


export const TracksSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalCards = planetCards.length;


  const goNext = () => {
    if (totalCards <= 1) return;

    setActiveIndex(
      (current) => (current + 1) % totalCards,
    );
  };


  const goPrevious = () => {
    if (totalCards <= 1) return;

    setActiveIndex((current) =>
      current === 0
        ? totalCards - 1
        : current - 1,
    );
  };


  const goTo = (index: number) => {
    setActiveIndex(
      clamp(
        index,
        0,
        Math.max(totalCards - 1, 0),
      ),
    );
  };


  /*
   * Automatic carousel
   */

  useEffect(() => {
    if (isPaused || totalCards <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % totalCards,
      );
    }, 6500);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPaused, totalCards]);


  /*
   * Touch swipe handling for mobile & tablet
   */

  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);


  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };


  const handleTouchEnd = (e: React.TouchEvent) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX.current;
    const dy = touchEndY - touchStartY.current;

    // Check if horizontal swipe is dominant and exceeds threshold
    if (
      Math.abs(dx) > Math.abs(dy) &&
      Math.abs(dx) > 36
    ) {
      if (dx < 0) {
        goNext();
      } else {
        goPrevious();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsPaused(false);
  };


  /*
   * Keyboard navigation
   */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'ArrowLeft') {
        goPrevious();
      }

      if (event.key === 'ArrowRight') {
        goNext();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [totalCards, activeIndex]);


  if (totalCards === 0) {
    return (
      <section
        id="tracks"
        className="section-tracks-section"
      >
        <div className="container">
          <div className="tracks-empty">
            <span>02 — TRACKS</span>

            <h2 className="tracks-empty-title">
              Explore your frontier.
            </h2>

            <p>
              Challenge areas will be announced
              soon.
            </p>
          </div>
        </div>

        <style>{`

          .tracks-empty {
            max-width: 650px;
            margin-inline: auto;
            text-align: center;
          }

          .tracks-empty > span {
            color: var(--stellar-cyan);
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.16em;
          }

          .tracks-empty h2 {
            margin: 14px 0;
            color: var(--text);
            font-family: var(--font-display);
            font-size: 42px;
            font-weight: 500;
          }

          .tracks-empty p {
            color: var(--muted);
            line-height: 1.7;
          }

        `}</style>
      </section>
    );
  }


  return (
    <section
      id="tracks"
      className="section tracks-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >

      <div className="container">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="tracks-header">

          <div className="tracks-heading-wrapper">

            <SectionHeading
              code="02 — Tracks"
              title="Explore your frontier."
              subtitle="Navigate through the challenge domains and discover the frontiers where technology meets imagination."
            />

          </div>


          {/* Navigation */}

          <div className="tracks-controls">

            <button
              type="button"
              className="tracks-arrow interactive-button"
              onClick={goPrevious}
              aria-label="Previous planet"
            >
              <ArrowLeft
                size={18}
                strokeWidth={1.5}
              />
            </button>


            <button
              type="button"
              className="tracks-arrow interactive-button"
              onClick={goNext}
              aria-label="Next planet"
            >
              <ArrowRight
                size={18}
                strokeWidth={1.5}
              />
            </button>

          </div>

        </div>


        {/* =====================================================
            CAROUSEL WITH TOUCH SWIPE & 3D PERSPECTIVE
            ===================================================== */}

        <div
          className="tracks-carousel"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          <div
            className="tracks-track"
            style={{ perspective: 1200 }}
          >

            {planetCards.map(
              (planet, index) => {

                const offset =
                  index - activeIndex;


                /*
                 * Circular carousel positioning.
                 */

                const normalizedOffset =
                  offset > totalCards / 2
                    ? offset - totalCards
                    : offset < -totalCards / 2
                      ? offset + totalCards
                      : offset;


                const isActive =
                  normalizedOffset === 0;


                const isNear =
                  Math.abs(
                    normalizedOffset,
                  ) <= 1;


                /*
                 * Active card:
                 * center + full size
                 *
                 * Side cards:
                 * smaller + partially visible with 3D tilt
                 */

                let transform = `
                  translateX(
                    ${normalizedOffset * 76}%
                  )
                  scale(0.84)
                  rotateY(${normalizedOffset * -10}deg)
                `;


                if (isActive) {
                  transform =
                    'translateX(0) scale(1) rotateY(0deg)';
                }


                const opacity = isActive
                  ? 1
                  : isNear
                    ? 0.48
                    : 0;


                const zIndex = isActive
                  ? 10
                  : Math.max(
                      1,
                      8 -
                        Math.abs(
                          normalizedOffset,
                        ),
                    );


                return (
                  <article
                    key={planet.id}
                    className={`
                      planet-card
                      ${
                        isActive
                          ? 'planet-card-active'
                          : ''
                      }
                    `}
                    style={{
                      transform,
                      opacity,
                      zIndex,

                      '--planet-accent':
                        planet.accent,

                      '--planet-image':
                        `url("${planet.image}")`,
                    } as React.CSSProperties}
                    onClick={() =>
                      goTo(index)
                    }
                    aria-current={
                      isActive
                        ? 'true'
                        : undefined
                    }
                  >

                    {/* =================================================
                        REAL IMAGE BACKGROUND
                        ================================================= */}

                    <div
                      className="planet-card-image"
                      aria-hidden="true"
                    />


                    {/* =================================================
                        ORIGINAL IMAGE OVERLAY
                        ================================================= */}

                    <div
                      className="planet-card-overlay"
                      aria-hidden="true"
                    />


                    {/* =================================================
                        ACTIVE CARD GLOW
                        ================================================= */}

                    <div
                      className="planet-card-glow"
                      aria-hidden="true"
                    />


                    {/* =================================================
                        INTERACTION HIGHLIGHT
                        ================================================= */}

                    <div
                      className="planet-card-highlight"
                      aria-hidden="true"
                    />


                    {/* =================================================
                        NEW:
                        CONTENT EMBEDDED INSIDE CARD
                        ================================================= */}

                    <div
                      className="
                        planet-card-content
                      "
                    >

                      <div
                        className="
                          planet-card-event
                        "
                      >
                        {planet.event}
                      </div>


                      <h3>
                        {planet.title}
                      </h3>


                      <p>
                        {planet.description}
                      </p>


                      <div
                        className="
                          planet-card-meta
                        "
                      >

                        <span>
                          {planet.format}
                        </span>

                        <span>
                          {planet.skills}
                        </span>

                      </div>


                      <div
                        className="
                          planet-card-status
                        "
                      >

                        <span />

                        <span>
                          {planet.status}
                        </span>

                      </div>

                    </div>

                  </article>
                );
              },
            )}

          </div>


          {/* =====================================================
              EDGE MASKS
              ===================================================== */}

          <div
            className="
              carousel-edge
              carousel-edge-left
            "
            aria-hidden="true"
          />

          <div
            className="
              carousel-edge
              carousel-edge-right
            "
            aria-hidden="true"
          />

        </div>


        {/* =====================================================
            BOTTOM CONTROLS
            ===================================================== */}

        <div className="tracks-bottom">

          <div className="tracks-pagination">

            {planetCards.map(
              (planet, index) => (

                <button
                  key={planet.id}
                  type="button"
                  className={`
                    pagination-dot
                    ${
                      index === activeIndex
                        ? 'pagination-dot-active'
                        : ''
                    }
                  `}
                  onClick={() =>
                    goTo(index)
                  }
                  aria-label={`Go to ${planet.name}`}
                  aria-current={
                    index === activeIndex
                      ? 'true'
                      : undefined
                  }
                  style={
                    index === activeIndex
                      ? ({
                          '--dot-color':
                            planet.accent,
                        } as React.CSSProperties)
                      : undefined
                  }
                />

              ),
            )}

          </div>


          <div className="tracks-status">

            <Sparkles
              size={13}
              strokeWidth={1.4}
            />

            <span>
              {String(
                activeIndex + 1,
              ).padStart(2, '0')}

              {' / '}

              {String(
                totalCards,
              ).padStart(2, '0')}
            </span>

          </div>

        </div>

      </div>


      {/* =========================================================
          COMPLETE TRACKS STYLING
          ========================================================= */}

      <style>{`

        /* =======================================================
           SECTION
           ======================================================= */

        .tracks-section {
          position: relative;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 50% 45%,
              rgba(
                59,
                130,
                246,
                0.075
              ),
              transparent 34%
            ),
            var(--theme-background);
        }


        /* =======================================================
           SUBTLE TECH GRID
           ======================================================= */

        .tracks-section::before {
          content: "";

          position: absolute;

          inset: 0;

          pointer-events: none;

          opacity: 0.16;

          background-image:
            linear-gradient(
              rgba(
                103,
                232,
                249,
                0.025
              ) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(
                103,
                232,
                249,
                0.025
              ) 1px,
              transparent 1px
            );

          background-size:
            70px 70px;
        }


        /* =======================================================
           HEADER
           ======================================================= */

        .tracks-header {
          position: relative;

          z-index: 2;

          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-end;

          gap: 30px;

          margin-bottom: 55px;
        }


        .tracks-kicker {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 15px;

          color:
            var(--stellar-cyan);

          font-family:
            var(--font-mono);

          font-size: 10px;

          letter-spacing:
            0.18em;

          text-transform:
            uppercase;
        }


        .tracks-kicker-line {
          display: block;

          width: 32px;

          height: 1px;

          background:
            var(--stellar-cyan);

          box-shadow:
            0 0 12px
            rgba(
              34,
              211,
              238,
              0.6
            );
        }


        .tracks-title {
          margin: 0;

          font-family:
            var(--font-display);

          font-size:
            clamp(
              38px,
              5vw,
              70px
            );

          font-weight: 500;

          line-height: 0.98;

          letter-spacing:
            -0.055em;

          color:
            var(--text);
        }


        .tracks-title span {
          color:
            var(--stellar-cyan);
        }


        .tracks-subtitle {
          max-width: 590px;

          margin:
            19px 0 0;

          color:
            var(--muted);

          font-family:
            var(--font-body);

          font-size: 14px;

          line-height: 1.75;
        }


        /* =======================================================
           ARROWS
           ======================================================= */

        .tracks-controls {
          display: flex;

          gap: 8px;

          flex-shrink: 0;
        }


        .tracks-arrow {
          display: grid;

          place-items: center;

          width: 44px;

          height: 44px;

          padding: 0;

          border:
            1px solid
            rgba(
              103,
              232,
              249,
              0.16
            );

          border-radius: 50%;

          background:
            rgba(
              7,
              16,
              39,
              0.72
            );

          color:
            var(--muted);

          cursor: pointer;

          transition:
            transform 180ms ease,
            color 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }


        .tracks-arrow:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(
              34,
              211,
              238,
              0.5
            );

          background:
            rgba(
              34,
              211,
              238,
              0.08
            );

          color:
            var(--stellar-cyan);
        }


        .tracks-arrow:active {
          transform:
            translateY(0)
            scale(0.94);
        }


        /* =======================================================
           CAROUSEL
           ======================================================= */

        .tracks-carousel {
          position: relative;

          height: 590px;

          overflow: hidden;

          margin-inline: -30px;
        }


        .tracks-track {
          position: absolute;

          inset: 0;

          display: flex;

          justify-content: center;

          align-items: center;
        }


        /* =======================================================
           REAL IMAGE CARD
           ======================================================= */

        .planet-card {
          position: absolute;

          left: 50%;

          top: 50%;

          width:
            min(
              370px,
              72vw
            );

          height: 530px;

          margin-left: -185px;

          margin-top: -265px;

          overflow: hidden;

          border:
            1px solid
            rgba(
              148,
              163,
              184,
              0.14
            );

          border-radius: 22px;

          background:
            #030510;

          box-shadow:
            0 25px 80px
            rgba(
              0,
              0,
              0,
              0.48
            );

          cursor: pointer;

          transform-origin:
            center center;

          transition:
            transform 650ms
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              ),
            opacity 650ms ease,
            border-color 400ms ease,
            box-shadow 400ms ease;

          will-change:
            transform,
            opacity;

          user-select: none;

          isolation: isolate;
        }


        /* =======================================================
           THE ACTUAL IMAGE
           ======================================================= */

        .planet-card-image {
          position: absolute;

          inset: 0;

          z-index: 1;

          background-image:
            var(--planet-image);

          background-size:
            cover;

          background-position:
            center;

          background-repeat:
            no-repeat;

          transform:
            scale(1.001);

          transition:
            transform 900ms
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              ),
            filter 650ms ease;
        }


        .planet-card-active
          .planet-card-image {
          transform:
            scale(1.015);

          filter:
            brightness(1.02)
            saturate(1.03);
        }


        .planet-card:not(
          .planet-card-active
        )
          .planet-card-image {
          filter:
            brightness(0.72)
            saturate(0.82);
        }


        /* =======================================================
           VERY SUBTLE ORIGINAL OVERLAY
           ======================================================= */

        .planet-card-overlay {
          position: absolute;

          inset: 0;

          z-index: 2;

          pointer-events: none;

          background:
            linear-gradient(
              180deg,
              rgba(
                3,
                5,
                16,
                0.04
              ) 0%,
              rgba(
                3,
                5,
                16,
                0
              ) 38%,
              rgba(
                3,
                5,
                16,
                0.05
              ) 100%
            );
        }


        /* =======================================================
           ACTIVE CARD EDGE GLOW
           ======================================================= */

        .planet-card-glow {
          position: absolute;

          inset: -1px;

          z-index: 3;

          pointer-events: none;

          border-radius:
            inherit;

          opacity: 0;

          box-shadow:
            inset
            0 0 0 1px
            color-mix(
              in srgb,
              var(--planet-accent)
              42%,
              transparent
            ),
            0 0 65px
            color-mix(
              in srgb,
              var(--planet-accent)
              16%,
              transparent
            );

          transition:
            opacity 450ms ease;
        }


        .planet-card-active
          .planet-card-glow {
          opacity: 1;
        }


        /* =======================================================
           GLASS HIGHLIGHT
           ======================================================= */

        .planet-card-highlight {
          position: absolute;

          inset: 0;

          z-index: 4;

          pointer-events: none;

          border-radius:
            inherit;

          opacity: 0;

          background:
            linear-gradient(
              120deg,
              rgba(
                255,
                255,
                255,
                0.08
              ),
              transparent 24%,
              transparent 72%,
              rgba(
                255,
                255,
                255,
                0.025
              )
            );

          transition:
            opacity 450ms ease;
        }


        .planet-card-active
          .planet-card-highlight {
          opacity: 1;
        }


        /* =======================================================
           CARD EDGE
           ======================================================= */

        .planet-card-active {
          border-color:
            color-mix(
              in srgb,
              var(--planet-accent)
              46%,
              rgba(
                148,
                163,
                184,
                0.18
              )
            );

          box-shadow:
            0 30px 100px
              rgba(
                0,
                0,
                0,
                0.55
              ),
            0 0 75px
              color-mix(
                in srgb,
                var(--planet-accent)
                13%,
                transparent
              );
        }


        /* =======================================================
           NEW CONTENT
           ONLY ADDED INSIDE EXISTING CARD
           ======================================================= */

        .planet-card-content {
          position: absolute;

          left: 18px;

          right: 18px;

          bottom: 17px;

          z-index: 8;

          padding:
            13px 14px 12px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );

          border-radius:
            11px;

          background:
            linear-gradient(
              180deg,
              rgba(
                3,
                5,
                16,
                0.28
              ),
              rgba(
                3,
                5,
                16,
                0.72
              )
            );

          backdrop-filter:
            blur(5px);

          -webkit-backdrop-filter:
            blur(5px);

          box-shadow:
            0 10px 30px
            rgba(
              0,
              0,
              0,
              0.18
            );
        }


        .planet-card-event {
          display: inline-block;

          margin-bottom: 5px;

          color:
            var(--planet-accent);

          font-family:
            var(--font-mono);

          font-size: 7px;

          font-weight: 600;

          line-height: 1.2;

          letter-spacing:
            0.14em;

          text-transform:
            uppercase;
        }


        .planet-card-content h3 {
          margin: 0;

          color:
            #ffffff;

          font-family:
            var(--font-display);

          font-size: 21px;

          font-weight: 500;

          line-height: 1.05;

          letter-spacing:
            -0.025em;

          text-shadow:
            0 2px 12px
            rgba(
              0,
              0,
              0,
              0.65
            );
        }


        .planet-card-content p {
          max-width: 295px;

          margin:
            6px 0 8px;

          color:
            rgba(
              241,
              245,
              255,
              0.76
            );

          font-family:
            var(--font-body);

          font-size: 9px;

          line-height: 1.45;

          text-shadow:
            0 2px 8px
            rgba(
              0,
              0,
              0,
              0.75
            );
        }


        .planet-card-meta {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;

          padding-top: 7px;

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );

          color:
            rgba(
              255,
              255,
              255,
              0.62
            );

          font-family:
            var(--font-mono);

          font-size: 6.5px;

          line-height: 1.2;

          letter-spacing:
            0.07em;

          white-space:
            nowrap;
        }


        .planet-card-meta span:last-child {
          color:
            var(--planet-accent);
        }


        .planet-card-status {
          display: flex;

          align-items: center;

          gap: 5px;

          margin-top: 7px;

          color:
            var(--planet-accent);

          font-family:
            var(--font-mono);

          font-size: 6px;

          line-height: 1;

          letter-spacing:
            0.12em;
        }


        .planet-card-status span:first-child {
          width: 4px;

          height: 4px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            var(--planet-accent);

          box-shadow:
            0 0 7px
            var(--planet-accent);
        }


        /* =======================================================
           EDGE MASKS
           ======================================================= */

        .carousel-edge {
          position: absolute;

          top: 0;

          bottom: 0;

          z-index: 20;

          width: 16%;

          pointer-events: none;
        }


        .carousel-edge-left {
          left: 0;

          background:
            linear-gradient(
              90deg,
              var(--theme-background) 0%,
              color-mix(
                in srgb,
                var(--theme-background) 88%,
                transparent
              ) 22%,
              transparent 100%
            );
        }


        .carousel-edge-right {
          right: 0;

          background:
            linear-gradient(
              270deg,
              var(--theme-background) 0%,
              color-mix(
                in srgb,
                var(--theme-background) 88%,
                transparent
              ) 22%,
              transparent 100%
            );
        }


        /* =======================================================
           BOTTOM
           ======================================================= */

        .tracks-bottom {
          position: relative;

          z-index: 30;

          display: flex;

          justify-content:
            space-between;

          align-items:
            center;

          margin-top: 2px;
        }


        .tracks-pagination {
          display: flex;

          align-items: center;

          gap: 7px;
        }


        .pagination-dot {
          width: 22px;

          height: 2px;

          padding: 0;

          border: 0;

          border-radius: 999px;

          background:
            rgba(
              148,
              163,
              184,
              0.18
            );

          cursor: pointer;

          transition:
            width 250ms ease,
            background 250ms ease,
            box-shadow 250ms ease;
        }


        .pagination-dot:hover {
          background:
            rgba(
              148,
              163,
              184,
              0.45
            );
        }


        .pagination-dot-active {
          width: 42px;

          background:
            var(--dot-color);

          box-shadow:
            0 0 12px
            var(--dot-color);
        }


        .tracks-status {
          display: flex;

          align-items: center;

          gap: 8px;

          color:
            var(--muted-dark);

          font-family:
            var(--font-mono);

          font-size: 9px;

          letter-spacing:
            0.13em;
        }


        /* =======================================================
           TABLET
           ======================================================= */

        @media (max-width: 900px) {

          .tracks-header {
            align-items:
              flex-start;
          }


          .tracks-carousel {
            height: 560px;
          }


          .planet-card {
            width:
              min(
                350px,
                72vw
              );

            height: 510px;

            margin-left:
              -175px;

            margin-top:
              -255px;
          }

        }


        /* =======================================================
           MOBILE
           ======================================================= */

        @media (max-width: 700px) {

          .tracks-header {
            display: block;

            margin-bottom: 35px;
          }


          .tracks-title {
            font-size:
              clamp(
                39px,
                12vw,
                58px
              );
          }


          .tracks-subtitle {
            max-width:
              470px;

            font-size: 13px;
          }


          .tracks-controls {
            margin-top: 22px;
          }


          .tracks-carousel {
            height: 545px;

            margin-inline:
              -20px;
          }


          .planet-card {
            width:
              min(
                325px,
                78vw
              );

            height: 500px;

            margin-left:
              -162.5px;

            margin-top:
              -250px;
          }


          .tracks-bottom {
            padding-inline:
              4px;
          }


          .planet-card-content {
            left: 14px;

            right: 14px;

            bottom: 14px;

            padding:
              11px 12px 10px;
          }


          .planet-card-content h3 {
            font-size: 19px;
          }


          .planet-card-content p {
            font-size: 8px;

            margin-top: 5px;
          }

        }


        /* =======================================================
           SMALL MOBILE
           ======================================================= */

        @media (max-width: 480px) {

          .tracks-carousel {
            height: 525px;
          }


          .planet-card {
            width: 290px;

            height: 490px;

            margin-left: -145px;

            margin-top: -245px;
          }


          .carousel-edge {
            width: 9%;
          }


          .tracks-status {
            display: none;
          }


          .planet-card-content {
            left: 12px;

            right: 12px;

            bottom: 12px;

            padding:
              10px 11px 9px;
          }


          .planet-card-content h3 {
            font-size: 18px;
          }


          .planet-card-content p {
            font-size: 7.7px;

            line-height: 1.4;
          }


          .planet-card-meta {
            font-size: 6px;
          }

        }


        /* =======================================================
           REDUCED MOTION
           ======================================================= */

        @media (
          prefers-reduced-motion: reduce
        ) {

          .planet-card {
            transition:
              opacity 250ms ease;
          }


          .planet-card-image {
            transition: none;
          }


          .tracks-arrow,
          .pagination-dot {
            transition: none;
          }

        }

      `}</style>

    </section>
  );
};


export default TracksSection;