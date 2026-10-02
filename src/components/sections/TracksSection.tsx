import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Leaf,
  Shield,
  Boxes,
  Orbit,
  Sparkles,
} from 'lucide-react';
import { tracksData } from '../../data/tracks';

type TrackTheme = {
  icon: React.ElementType;
  planetClass: string;
  atmosphereClass: string;
  accent: string;
  code: string;
  eyebrow: string;
  fallbackTitle: string;
  description: string;
};

const trackThemes: TrackTheme[] = [
  {
    icon: Brain,
    planetClass: 'track-planet-ai',
    atmosphereClass: 'track-atmosphere-ai',
    accent: '#67e8f9',
    code: 'SECTOR 01',
    eyebrow: 'INTELLIGENCE SYSTEMS',
    fallbackTitle: 'ARTIFICIAL INTELLIGENCE',
    description:
      'Build intelligent systems that understand, adapt and create.',
  },
  {
    icon: Shield,
    planetClass: 'track-planet-cyber',
    atmosphereClass: 'track-atmosphere-cyber',
    accent: '#fb7185',
    code: 'SECTOR 02',
    eyebrow: 'DEFENSE SYSTEMS',
    fallbackTitle: 'CYBERSECURITY',
    description:
      'Find vulnerabilities and build stronger, more resilient systems.',
  },
  {
    icon: Leaf,
    planetClass: 'track-planet-green',
    atmosphereClass: 'track-atmosphere-green',
    accent: '#86efac',
    code: 'SECTOR 03',
    eyebrow: 'PLANETARY SYSTEMS',
    fallbackTitle: 'SUSTAINABILITY',
    description:
      'Create solutions for a cleaner, healthier and more sustainable future.',
  },
  {
    icon: Boxes,
    planetClass: 'track-planet-purple',
    atmosphereClass: 'track-atmosphere-purple',
    accent: '#c4b5fd',
    code: 'SECTOR 04',
    eyebrow: 'EXPERIMENTAL SYSTEMS',
    fallbackTitle: 'OPEN INNOVATION',
    description:
      'Explore emerging technologies and unconventional ideas.',
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const TracksSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const tracks = useMemo(() => {
    if (tracksData && tracksData.length > 0) {
      return tracksData;
    }

    return trackThemes.map((theme, index) => ({
      id: String(index + 1),
      title: theme.fallbackTitle,
      description: theme.description,
      status: 'classified',
    }));
  }, []);

  const total = Math.min(tracks.length, trackThemes.length);

  const goTo = (index: number) => {
    if (!total) return;

    setActiveIndex(
      ((index % total) + total) % total
    );
  };

  const next = () => goTo(activeIndex + 1);
  const previous = () => goTo(activeIndex - 1);

  useEffect(() => {
    if (isPaused || total <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [isPaused, total]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        next();
      }

      if (event.key === 'ArrowLeft') {
        previous();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <section
      id="tracks"
      className="planet-tracks-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Atmospheric background */}
      <div className="planet-tracks-background">
        <div className="planet-stars planet-stars-one" />
        <div className="planet-stars planet-stars-two" />
        <div className="planet-nebula planet-nebula-one" />
        <div className="planet-nebula planet-nebula-two" />

        <div className="planet-grid" />

        <div className="planet-background-orbit planet-background-orbit-one" />
        <div className="planet-background-orbit planet-background-orbit-two" />
      </div>

      <div className="planet-tracks-container">
        {/* Header */}
        <header className="planet-tracks-header">
          <div className="planet-section-label">
            <span>02</span>
            <span className="planet-section-line" />
            <span>TRACKS</span>
          </div>

          <div className="planet-heading-layout">
            <div className="planet-heading-copy">
              <h2>
                EXPLORE
                <br />
                <span>YOUR FRONTIER</span>
              </h2>

              <p>
                Choose a challenge area, bring your perspective,
                and build something that matters.
              </p>

              <div className="planet-heading-meta">
                <span>
                  <Orbit size={13} />
                  FOUR DESTINATIONS
                </span>

                <span>
                  <Sparkles size={13} />
                  ONE UNIVERSE OF IDEAS
                </span>
              </div>
            </div>

            <div className="planet-header-status">
              <span className="status-dot" />
              MISSION AREAS
              <strong>04</strong>
            </div>
          </div>
        </header>

        {/* Carousel */}
        <div className="planet-carousel-wrapper">
          <button
            type="button"
            className="planet-carousel-arrow planet-carousel-arrow-left"
            onClick={previous}
            aria-label="Previous track"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="planet-carousel">
            {Array.from({ length: total }).map((_, index) => {
              const track = tracks[index];
              const theme = trackThemes[index % trackThemes.length];
              const Icon = theme.icon;

              const offset =
                index - activeIndex;

              const wrappedOffset =
                Math.abs(offset) > total / 2
                  ? offset > 0
                    ? offset - total
                    : offset + total
                  : offset;

              const isActive = wrappedOffset === 0;

              const distance = clamp(
                Math.abs(wrappedOffset),
                0,
                2
              );

              const rotation =
                wrappedOffset * -2.5;

              const scale =
                isActive
                  ? 1
                  : 0.88 - (distance - 1) * 0.03;

              const opacity =
                isActive
                  ? 1
                  : distance === 1
                    ? 0.65
                    : 0.3;

              return (
                <article
                  key={track.id}
                  className={`planet-track-card ${
                    isActive
                      ? 'planet-track-card-active'
                      : ''
                  }`}
                  style={{
                    transform: `
                      translateX(calc(${wrappedOffset} * 104%))
                      rotateY(${rotation}deg)
                      scale(${scale})
                    `,
                    opacity,
                    zIndex: 20 - distance,
                  }}
                  onClick={() => goTo(index)}
                >
                  {/* Card atmosphere */}
                  <div
                    className={`planet-card-atmosphere ${theme.atmosphereClass}`}
                  />

                  {/* Stars */}
                  <div className="planet-card-stars" />

                  {/* Top navigation */}
                  <div className="planet-card-top">
                    <span
                      className="planet-card-number"
                      style={{
                        color: theme.accent,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="planet-card-sector">
                      {theme.code}
                    </span>

                    <Icon
                      size={19}
                      strokeWidth={1.4}
                      style={{
                        color: theme.accent,
                      }}
                    />
                  </div>

                  {/* Vertical title */}
                  <div className="planet-card-vertical-title">
                    {(
                      track.title ||
                      theme.fallbackTitle
                    )
                      .split(' ')
                      .map((word: string, wordIndex: number) => (
                        <span key={wordIndex}>
                          {word}
                        </span>
                      ))}
                  </div>

                  {/* Mission text */}
                  <div className="planet-card-copy">
                    <div
                      className="planet-card-eyebrow"
                      style={{
                        color: theme.accent,
                      }}
                    >
                      {theme.eyebrow}
                    </div>

                    <p>
                      {track.status === 'classified'
                        ? theme.description
                        : track.description}
                    </p>
                  </div>

                  {/* Planet */}
                  <div className="planet-visual">
                    <div
                      className={`planet-glow ${theme.atmosphereClass}`}
                    />

                    <div
                      className={`planet-sphere ${theme.planetClass}`}
                    >
                      <div className="planet-surface" />
                      <div className="planet-clouds" />
                      <div className="planet-highlight" />
                    </div>

                    {index === 3 && (
                      <div className="planet-ring planet-ring-one" />
                    )}

                    {index === 3 && (
                      <div className="planet-ring planet-ring-two" />
                    )}
                  </div>

                  {/* Bottom CTA */}
                  <div className="planet-card-bottom">
                    <span>
                      {track.status === 'classified'
                        ? 'MISSION CLASSIFIED'
                        : track.status?.toUpperCase() ||
                          'ACTIVE'}
                    </span>

                    <button
                      type="button"
                      style={{
                        borderColor: theme.accent,
                        color: theme.accent,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      EXPLORE TRACK
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Corner HUD */}
                  <span className="planet-corner planet-corner-tl" />
                  <span className="planet-corner planet-corner-tr" />
                  <span className="planet-corner planet-corner-bl" />
                  <span className="planet-corner planet-corner-br" />
                </article>
              );
            })}
          </div>

          <button
            type="button"
            className="planet-carousel-arrow planet-carousel-arrow-right"
            onClick={next}
            aria-label="Next track"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Bottom information */}
        <div className="planet-tracks-footer">
          <div className="planet-footer-message">
            <span>DIFFERENT PROBLEMS.</span>
            <span>SAME UNIVERSE OF POSSIBILITIES.</span>
          </div>

          <div className="planet-carousel-dots">
            {Array.from({ length: total }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  index === activeIndex
                    ? 'active'
                    : ''
                }
                onClick={() => goTo(index)}
                aria-label={`Go to track ${index + 1}`}
              />
            ))}
          </div>

          <div className="planet-footer-coordinate">
            <span>RA 14h 29m</span>
            <span>DEC +62° 40'</span>
            <span>SECTOR 07</span>
          </div>
        </div>
      </div>

      <style>{`
        .planet-tracks-section {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 72% 42%,
              rgba(37, 99, 235, 0.10),
              transparent 30%
            ),
            radial-gradient(
              circle at 18% 70%,
              rgba(124, 58, 237, 0.08),
              transparent 32%
            ),
            #030510;
          color: var(--text-primary, #f8fbff);
          isolation: isolate;
        }

        .planet-tracks-background {
          position: absolute;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          overflow: hidden;
        }

        .planet-grid {
          position: absolute;
          inset: 0;
          opacity: 0.14;
          background-image:
            linear-gradient(
              rgba(103, 232, 249, 0.06) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(103, 232, 249, 0.06) 1px,
              transparent 1px
            );
          background-size: 80px 80px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 20%,
            black 80%,
            transparent
          );
        }

        .planet-stars {
          position: absolute;
          inset: 0;
          opacity: 0.5;
          background-image:
            radial-gradient(
              circle,
              rgba(255,255,255,.9) 0 1px,
              transparent 1.5px
            ),
            radial-gradient(
              circle,
              rgba(103,232,249,.5) 0 1px,
              transparent 1.5px
            );
          background-size:
            130px 130px,
            210px 210px;
          background-position:
            20px 30px,
            80px 120px;
        }

        .planet-stars-one {
          animation: planetStarDrift 30s linear infinite;
        }

        .planet-stars-two {
          opacity: 0.22;
          transform: scale(1.2);
          animation: planetStarDrift 50s linear infinite reverse;
        }

        .planet-nebula {
          position: absolute;
          width: 55vw;
          height: 55vw;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.14;
        }

        .planet-nebula-one {
          top: -25%;
          right: -15%;
          background: #2563eb;
        }

        .planet-nebula-two {
          bottom: -30%;
          left: -20%;
          background: #7c3aed;
        }

        .planet-background-orbit {
          position: absolute;
          left: 55%;
          top: 50%;
          width: 80vw;
          height: 28vw;
          border: 1px solid rgba(103,232,249,.08);
          border-radius: 50%;
          transform: translate(-50%, -50%) rotate(-18deg);
        }

        .planet-background-orbit-two {
          width: 95vw;
          height: 38vw;
          transform: translate(-50%, -50%) rotate(12deg);
          opacity: 0.45;
        }

        .planet-tracks-container {
          position: relative;
          width: min(1440px, calc(100% - 64px));
          min-height: 100vh;
          margin: 0 auto;
          padding:
            clamp(70px, 8vw, 110px)
            0
            48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .planet-tracks-header {
          position: relative;
          z-index: 10;
          margin-bottom: 38px;
        }

        .planet-section-label {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--stellar-cyan, #22d3ee);
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        .planet-section-line {
          width: 54px;
          height: 1px;
          background: rgba(103,232,249,.5);
        }

        .planet-heading-layout {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-top: 20px;
        }

        .planet-heading-copy h2 {
          margin: 0;
          font-family: var(--font-display, sans-serif);
          font-size: clamp(3rem, 6.2vw, 7rem);
          line-height: .82;
          letter-spacing: -.055em;
          font-weight: 650;
        }

        .planet-heading-copy h2 span {
          color: transparent;
          -webkit-text-stroke: 1px rgba(248,251,255,.7);
          text-stroke: 1px rgba(248,251,255,.7);
        }

        .planet-heading-copy p {
          max-width: 510px;
          margin: 25px 0 0;
          color: var(--muted, #aab5d6);
          font-size: 15px;
          line-height: 1.8;
        }

        .planet-heading-meta {
          display: flex;
          gap: 24px;
          margin-top: 20px;
          color: var(--muted-dark, #68749a);
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          letter-spacing: .13em;
        }

        .planet-heading-meta span {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .planet-header-status {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--muted-dark, #68749a);
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          letter-spacing: .16em;
          white-space: nowrap;
        }

        .planet-header-status strong {
          color: var(--text-primary, #f8fbff);
          font-size: 20px;
          font-weight: 500;
          margin-left: 5px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 12px rgba(34,211,238,.8);
          animation: statusPulse 2s ease-in-out infinite;
        }

        .planet-carousel-wrapper {
          position: relative;
          height: 570px;
          perspective: 1400px;
        }

        .planet-carousel {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          overflow: visible;
        }

        .planet-track-card {
          position: absolute;
          top: 0;
          left: 50%;
          width: min(360px, 31vw);
          height: 540px;
          transform-origin: center center;
          margin-left: min(-180px, -15.5vw);
          border: 1px solid rgba(255,255,255,.12);
          background: #05070d;
          overflow: hidden;
          cursor: pointer;
          transform-style: preserve-3d;
          transition:
            transform .8s cubic-bezier(.22, .61, .36, 1),
            opacity .8s ease,
            border-color .5s ease,
            box-shadow .5s ease;
          box-shadow:
            0 30px 80px rgba(0,0,0,.35);
          user-select: none;
        }

        .planet-track-card-active {
          border-color: rgba(103,232,249,.35);
          box-shadow:
            0 35px 100px rgba(0,0,0,.55),
            0 0 55px rgba(34,211,238,.07);
        }

        .planet-card-atmosphere {
          position: absolute;
          inset: 0;
          opacity: .22;
          pointer-events: none;
        }

        .track-atmosphere-ai {
          background:
            radial-gradient(
              circle at 65% 45%,
              rgba(34,211,238,.28),
              transparent 34%
            );
        }

        .track-atmosphere-cyber {
          background:
            radial-gradient(
              circle at 60% 48%,
              rgba(239,68,68,.26),
              transparent 35%
            );
        }

        .track-atmosphere-green {
          background:
            radial-gradient(
              circle at 60% 44%,
              rgba(34,197,94,.24),
              transparent 36%
            );
        }

        .track-atmosphere-purple {
          background:
            radial-gradient(
              circle at 62% 46%,
              rgba(139,92,246,.28),
              transparent 36%
            );
        }

        .planet-card-stars {
          position: absolute;
          inset: 0;
          opacity: .4;
          background-image:
            radial-gradient(
              circle,
              rgba(255,255,255,.85) 0 1px,
              transparent 1.4px
            );
          background-size: 55px 55px;
          background-position: 15px 20px;
          mask-image: linear-gradient(
            to bottom,
            black 0%,
            black 60%,
            transparent 78%
          );
        }

        .planet-card-top {
          position: absolute;
          top: 19px;
          left: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 10;
        }

        .planet-card-number {
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          letter-spacing: .15em;
        }

        .planet-card-sector {
          flex: 1;
          color: var(--muted-dark, #68749a);
          font-family: var(--font-mono, monospace);
          font-size: 8px;
          letter-spacing: .15em;
        }

        .planet-card-vertical-title {
          position: absolute;
          left: 18px;
          top: 82px;
          z-index: 8;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          pointer-events: none;
        }

        .planet-card-vertical-title span {
          color: rgba(248,251,255,.94);
          font-family: var(--font-display, sans-serif);
          font-size: clamp(27px, 2.5vw, 39px);
          font-weight: 700;
          line-height: .86;
          letter-spacing: -.06em;
          text-transform: uppercase;
        }

        .planet-card-copy {
          position: absolute;
          left: 78px;
          right: 20px;
          top: 86px;
          z-index: 9;
          padding-left: 14px;
          border-left: 1px solid rgba(255,255,255,.12);
        }

        .planet-card-eyebrow {
          font-family: var(--font-mono, monospace);
          font-size: 8px;
          letter-spacing: .16em;
        }

        .planet-card-copy p {
          margin: 10px 0 0;
          color: rgba(217,226,244,.72);
          font-size: 10px;
          line-height: 1.65;
          max-width: 190px;
        }

        .planet-visual {
          position: absolute;
          left: 50%;
          bottom: 62px;
          width: 360px;
          height: 330px;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .planet-glow {
          position: absolute;
          left: 50%;
          bottom: 20px;
          width: 280px;
          height: 280px;
          transform: translateX(-50%);
          border-radius: 50%;
          filter: blur(40px);
          opacity: .32;
        }

        .planet-sphere {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 300px;
          height: 300px;
          transform: translateX(-50%);
          border-radius: 50%;
          overflow: hidden;
          box-shadow:
            inset -45px -30px 65px rgba(0,0,0,.75),
            inset 22px 18px 35px rgba(255,255,255,.09),
            0 -5px 30px rgba(255,255,255,.06);
        }

        .planet-surface {
          position: absolute;
          inset: -15%;
          border-radius: 50%;
          opacity: .8;
          transform: rotate(-18deg);
        }

        .track-planet-ai {
          background:
            radial-gradient(
              circle at 34% 28%,
              rgba(255,255,255,.45),
              transparent 8%
            ),
            radial-gradient(
              ellipse at 65% 60%,
              rgba(34,211,238,.8),
              transparent 35%
            ),
            radial-gradient(
              ellipse at 35% 75%,
              #164e63,
              transparent 44%
            ),
            linear-gradient(
              145deg,
              #e0f2fe,
              #0891b2 25%,
              #155e75 52%,
              #082f49 78%,
              #020617
            );
        }

        .track-planet-cyber {
          background:
            radial-gradient(
              circle at 30% 28%,
              rgba(255,208,160,.28),
              transparent 7%
            ),
            radial-gradient(
              ellipse at 50% 50%,
              rgba(248,113,113,.72),
              transparent 42%
            ),
            radial-gradient(
              ellipse at 65% 70%,
              #7f1d1d,
              transparent 50%
            ),
            linear-gradient(
              145deg,
              #fed7aa,
              #c2410c 26%,
              #7f1d1d 56%,
              #450a0a 80%,
              #09090b
            );
        }

        .track-planet-green {
          background:
            radial-gradient(
              circle at 28% 26%,
              rgba(255,255,255,.42),
              transparent 7%
            ),
            radial-gradient(
              ellipse at 55% 45%,
              rgba(96,165,250,.9),
              transparent 34%
            ),
            radial-gradient(
              ellipse at 35% 62%,
              rgba(74,222,128,.9),
              transparent 28%
            ),
            radial-gradient(
              ellipse at 68% 70%,
              #14532d,
              transparent 48%
            ),
            linear-gradient(
              145deg,
              #bfdbfe,
              #2563eb 25%,
              #166534 55%,
              #052e16 80%,
              #020617
            );
        }

        .track-planet-purple {
          background:
            radial-gradient(
              circle at 28% 25%,
              rgba(255,255,255,.35),
              transparent 7%
            ),
            radial-gradient(
              ellipse at 60% 45%,
              rgba(196,181,253,.7),
              transparent 34%
            ),
            radial-gradient(
              ellipse at 35% 70%,
              #6d28d9,
              transparent 45%
            ),
            linear-gradient(
              145deg,
              #ddd6fe,
              #8b5cf6 27%,
              #4c1d95 57%,
              #1e1b4b 82%,
              #020617
            );
        }

        .planet-clouds {
          position: absolute;
          inset: -15%;
          border-radius: 50%;
          opacity: .28;
          background:
            repeating-linear-gradient(
              165deg,
              transparent 0 17px,
              rgba(255,255,255,.12) 18px 24px,
              transparent 25px 42px
            );
          filter: blur(4px);
          mix-blend-mode: screen;
        }

        .planet-highlight {
          position: absolute;
          left: 14%;
          top: 9%;
          width: 45%;
          height: 35%;
          border-radius: 50%;
          background:
            radial-gradient(
              ellipse,
              rgba(255,255,255,.22),
              transparent 70%
            );
          filter: blur(5px);
        }

        .planet-ring {
          position: absolute;
          left: 50%;
          top: 54%;
          width: 360px;
          height: 80px;
          border: 8px solid rgba(196,181,253,.38);
          border-radius: 50%;
          transform:
            translate(-50%, -50%)
            rotate(-18deg);
          box-shadow:
            0 0 20px rgba(139,92,246,.15);
        }

        .planet-ring-two {
          width: 390px;
          height: 58px;
          border-width: 2px;
          opacity: .65;
        }

        .planet-card-bottom {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 18px;
          z-index: 12;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,.10);
        }

        .planet-card-bottom > span {
          color: var(--muted-dark, #68749a);
          font-family: var(--font-mono, monospace);
          font-size: 7px;
          letter-spacing: .14em;
        }

        .planet-card-bottom button {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid;
          background: rgba(3,5,16,.65);
          color: inherit;
          font-family: var(--font-mono, monospace);
          font-size: 7px;
          letter-spacing: .08em;
          cursor: pointer;
          transition:
            background .25s ease,
            transform .25s ease;
        }

        .planet-card-bottom button:hover {
          background: rgba(255,255,255,.06);
          transform: translateY(-1px);
        }

        .planet-corner {
          position: absolute;
          width: 15px;
          height: 15px;
          z-index: 20;
          opacity: .55;
        }

        .planet-corner-tl {
          top: 10px;
          left: 10px;
          border-top: 1px solid #67e8f9;
          border-left: 1px solid #67e8f9;
        }

        .planet-corner-tr {
          top: 10px;
          right: 10px;
          border-top: 1px solid #67e8f9;
          border-right: 1px solid #67e8f9;
        }

        .planet-corner-bl {
          bottom: 10px;
          left: 10px;
          border-bottom: 1px solid #67e8f9;
          border-left: 1px solid #67e8f9;
        }

        .planet-corner-br {
          bottom: 10px;
          right: 10px;
          border-bottom: 1px solid #67e8f9;
          border-right: 1px solid #67e8f9;
        }

        .planet-carousel-arrow {
          position: absolute;
          top: 50%;
          z-index: 50;
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(103,232,249,.25);
          background: rgba(3,5,16,.72);
          color: #d9e2f4;
          cursor: pointer;
          transform: translateY(-50%);
          backdrop-filter: blur(12px);
          transition:
            border-color .25s ease,
            background .25s ease,
            color .25s ease;
        }

        .planet-carousel-arrow:hover {
          border-color: rgba(103,232,249,.7);
          background: rgba(34,211,238,.08);
          color: #67e8f9;
        }

        .planet-carousel-arrow-left {
          left: 0;
        }

        .planet-carousel-arrow-right {
          right: 0;
        }

        .planet-tracks-footer {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 4px;
        }

        .planet-footer-message {
          display: flex;
          flex-direction: column;
          color: var(--muted-dark, #68749a);
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          line-height: 1.7;
          letter-spacing: .13em;
        }

        .planet-footer-message span:last-child {
          color: rgba(217,226,244,.6);
        }

        .planet-carousel-dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .planet-carousel-dots button {
          width: 5px;
          height: 5px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.22);
          cursor: pointer;
          transition:
            width .3s ease,
            border-radius .3s ease,
            background .3s ease;
        }

        .planet-carousel-dots button.active {
          width: 22px;
          border-radius: 3px;
          background: #67e8f9;
          box-shadow: 0 0 12px rgba(103,232,249,.5);
        }

        .planet-footer-coordinate {
          display: flex;
          gap: 15px;
          color: rgba(104,116,154,.7);
          font-family: var(--font-mono, monospace);
          font-size: 8px;
          letter-spacing: .1em;
        }

        @keyframes planetStarDrift {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(-35px, 25px, 0);
          }
        }

        @keyframes statusPulse {
          0%, 100% {
            opacity: .45;
            transform: scale(.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @media (max-width: 1000px) {
          .planet-tracks-container {
            width: min(920px, calc(100% - 36px));
          }

          .planet-heading-layout {
            align-items: flex-start;
          }

          .planet-header-status {
            display: none;
          }

          .planet-track-card {
            width: min(330px, 38vw);
            margin-left: min(-165px, -19vw);
          }

          .planet-visual {
            transform: translateX(-50%) scale(.88);
          }
        }

        @media (max-width: 700px) {
          .planet-tracks-section {
            min-height: auto;
          }

          .planet-tracks-container {
            width: calc(100% - 28px);
            min-height: auto;
            padding:
              80px
              0
              34px;
          }

          .planet-heading-layout {
            display: block;
          }

          .planet-heading-copy h2 {
            font-size: clamp(3rem, 15vw, 5.2rem);
          }

          .planet-heading-copy p {
            max-width: 90%;
            font-size: 13px;
          }

          .planet-heading-meta {
            flex-direction: column;
            gap: 8px;
          }

          .planet-carousel-wrapper {
            height: 520px;
            margin-top: 20px;
            overflow: hidden;
          }

          .planet-carousel {
            overflow: visible;
          }

          .planet-track-card {
            width: min(320px, calc(100vw - 72px));
            height: 500px;
            margin-left:
              min(
                -160px,
                calc((100vw - 72px) / -2)
              );
          }

          .planet-carousel-arrow {
            width: 40px;
            height: 40px;
          }

          .planet-carousel-arrow-left {
            left: 2px;
          }

          .planet-carousel-arrow-right {
            right: 2px;
          }

          .planet-visual {
            transform:
              translateX(-50%)
              scale(.8);
            bottom: 54px;
          }

          .planet-card-vertical-title span {
            font-size: 29px;
          }

          .planet-card-copy {
            left: 74px;
          }

          .planet-tracks-footer {
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          .planet-footer-coordinate {
            display: none;
          }

          .planet-footer-message {
            font-size: 8px;
          }

          .planet-carousel-dots {
            margin-left: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .planet-stars-one,
          .planet-stars-two,
          .status-dot {
            animation: none;
          }

          .planet-track-card {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
};