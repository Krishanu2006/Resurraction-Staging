import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Boxes,
  Leaf,
  Orbit,
  Shield,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { tracksData } from '../../data/tracks';

type TrackTheme = {
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  planet: string;
  planetGlow: string;
  atmosphere: string;
  eyebrow: string;
  title: string;
  description: string;
};

const trackThemes: TrackTheme[] = [
  {
    icon: Brain,
    accent: '#22d3ee',
    accentSoft: 'rgba(34, 211, 238, 0.16)',
    planet: 'ai',
    planetGlow: 'rgba(34, 211, 238, 0.55)',
    atmosphere: 'rgba(59, 130, 246, 0.18)',
    eyebrow: 'COGNITIVE SYSTEMS',
    title: 'Artificial Intelligence',
    description:
      'Build intelligent systems capable of understanding, predicting, learning and creating.',
  },
  {
    icon: Shield,
    accent: '#fb7185',
    accentSoft: 'rgba(251, 113, 133, 0.15)',
    planet: 'mars',
    planetGlow: 'rgba(239, 68, 68, 0.58)',
    atmosphere: 'rgba(239, 68, 68, 0.16)',
    eyebrow: 'DEFENSE PROTOCOL',
    title: 'Cybersecurity',
    description:
      'Design resilient systems that protect data, infrastructure and digital identities.',
  },
  {
    icon: Leaf,
    accent: '#4ade80',
    accentSoft: 'rgba(74, 222, 128, 0.15)',
    planet: 'earth',
    planetGlow: 'rgba(34, 197, 94, 0.5)',
    atmosphere: 'rgba(16, 185, 129, 0.16)',
    eyebrow: 'PLANETARY SYSTEMS',
    title: 'Sustainability',
    description:
      'Create technology that helps build efficient, resilient and sustainable environments.',
  },
  {
    icon: Boxes,
    accent: '#a78bfa',
    accentSoft: 'rgba(167, 139, 250, 0.16)',
    planet: 'nebula',
    planetGlow: 'rgba(139, 92, 246, 0.58)',
    atmosphere: 'rgba(124, 58, 237, 0.18)',
    eyebrow: 'OPEN FRONTIER',
    title: 'Open Innovation',
    description:
      'Explore unconventional ideas and turn ambitious concepts into working prototypes.',
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const TracksSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalTracks = tracksData.length;

  const visibleTracks = useMemo(() => {
    if (totalTracks === 0) {
      return [];
    }

    return tracksData.map((track, index) => ({
      track,
      index,
      theme: trackThemes[index % trackThemes.length],
    }));
  }, [totalTracks]);

  const goNext = () => {
    if (totalTracks === 0) return;

    setActiveIndex((current) => (current + 1) % totalTracks);
  };

  const goPrevious = () => {
    if (totalTracks === 0) return;

    setActiveIndex((current) =>
      current === 0 ? totalTracks - 1 : current - 1,
    );
  };

  const goTo = (index: number) => {
    setActiveIndex(clamp(index, 0, Math.max(totalTracks - 1, 0)));
  };

  useEffect(() => {
    if (isPaused || totalTracks <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalTracks);
    }, 6500);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPaused, totalTracks]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goPrevious();
      }

      if (event.key === 'ArrowRight') {
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  if (totalTracks === 0) {
    return (
      <section id="tracks" className="section tracks-section">
        <div className="container">
          <div className="tracks-empty">
            <span>02 — TRACKS</span>
            <h2>Explore your frontier.</h2>
            <p>
              Challenge areas will be announced soon. The visual system is
              ready for the final problem statements when they arrive.
            </p>
          </div>
        </div>
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
        {/* Header */}
        <div className="tracks-header">
          <div>
            <div className="tracks-kicker">
              <span className="tracks-kicker-line" />
              <span>02 — TRACKS</span>
            </div>

            <h2 className="tracks-title">
              Explore your
              <span> frontier.</span>
            </h2>

            <p className="tracks-subtitle">
              Navigate through the challenge domains and discover the
              frontiers where technology meets imagination.
            </p>
          </div>

          <div className="tracks-controls">
            <button
              type="button"
              className="tracks-arrow"
              onClick={goPrevious}
              aria-label="Previous track"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              className="tracks-arrow"
              onClick={goNext}
              aria-label="Next track"
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="tracks-carousel">
          <div className="tracks-track">
            {visibleTracks.map(({ track, index, theme }) => {
              const offset = index - activeIndex;

              const normalizedOffset =
                offset > totalTracks / 2
                  ? offset - totalTracks
                  : offset < -totalTracks / 2
                    ? offset + totalTracks
                    : offset;

              const isActive = normalizedOffset === 0;
              const isNear = Math.abs(normalizedOffset) <= 1;

              const Icon: LucideIcon = theme.icon;

              let transform = `translateX(${normalizedOffset * 76}%) scale(0.82)`;

              if (isActive) {
                transform = 'translateX(0) scale(1)';
              }

              const opacity = isActive
                ? 1
                : isNear
                  ? 0.48
                  : 0;

              const zIndex = isActive
                ? 10
                : Math.max(1, 8 - Math.abs(normalizedOffset));

              return (
                <article
                  key={track.id}
                  className={`planet-card ${
                    isActive ? 'planet-card-active' : ''
                  }`}
                  style={
                    {
                      '--track-accent': theme.accent,
                      '--track-accent-soft': theme.accentSoft,
                      '--planet-glow': theme.planetGlow,
                      '--planet-atmosphere': theme.atmosphere,
                      transform,
                      opacity,
                      zIndex,
                    } as React.CSSProperties
                  }
                  onClick={() => goTo(index)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {/* Background stars */}
                  <div className="planet-stars">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  {/* HUD corners */}
                  <div className="hud-corner hud-top-left" />
                  <div className="hud-corner hud-top-right" />
                  <div className="hud-corner hud-bottom-left" />
                  <div className="hud-corner hud-bottom-right" />

                  {/* Card header */}
                  <div className="planet-card-header">
                    <span className="planet-index">
                      0{index + 1}
                    </span>

                    <div className="planet-icon">
                      <Icon
                        size={19}
                        strokeWidth={1.4}
                        style={{ color: theme.accent }}
                      />
                    </div>
                  </div>

                  {/* Vertical title */}
                  <div className="planet-vertical-title">
                    {(
                      track.title ||
                      theme.title ||
                      'FRONTIER'
                    )
                      .toUpperCase()
                      .split('')
                      .map((letter, letterIndex) => (
                        <span key={`${letter}-${letterIndex}`}>
                          {letter === ' ' ? '\u00A0' : letter}
                        </span>
                      ))}
                  </div>

                  {/* Planet */}
                  <div
                    className={`planet-visual planet-${theme.planet}`}
                  >
                    <div className="planet-atmosphere" />

                    <div className="planet-body">
                      <div className="planet-surface" />

                      {theme.planet === 'earth' && (
                        <>
                          <div className="earth-land earth-land-one" />
                          <div className="earth-land earth-land-two" />
                          <div className="earth-land earth-land-three" />
                        </>
                      )}

                      {theme.planet === 'mars' && (
                        <>
                          <div className="mars-crater mars-crater-one" />
                          <div className="mars-crater mars-crater-two" />
                          <div className="mars-crater mars-crater-three" />
                        </>
                      )}

                      {theme.planet === 'ai' && (
                        <>
                          <div className="ai-grid" />
                          <div className="ai-core" />
                        </>
                      )}

                      {theme.planet === 'nebula' && (
                        <>
                          <div className="nebula-cloud nebula-cloud-one" />
                          <div className="nebula-cloud nebula-cloud-two" />
                          <div className="nebula-core" />
                        </>
                      )}
                    </div>

                    {theme.planet === 'nebula' && (
                      <div className="planet-ring">
                        <span />
                      </div>
                    )}

                    {theme.planet === 'ai' && (
                      <div className="ai-orbit">
                        <span />
                      </div>
                    )}
                  </div>

                  {/* Decorative orbit */}
                  <div className="card-orbit card-orbit-one" />
                  <div className="card-orbit card-orbit-two" />

                  {/* Content */}
                  <div className="planet-card-content">
                    <div
                      className="planet-eyebrow"
                      style={{ color: theme.accent }}
                    >
                      {theme.eyebrow}
                    </div>

                    <h3>{track.title || theme.title}</h3>

                    <p>
                      {track.description || theme.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="planet-card-footer">
                    <div>
                      <span className="planet-footer-label">
                        STATUS
                      </span>

                      <span className="planet-footer-value">
                        {track.status === 'classified'
                          ? 'COMING SOON'
                          : track.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="planet-footer-icon">
                      <Orbit
                        size={15}
                        strokeWidth={1.4}
                        style={{ color: theme.accent }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Gradient edges */}
          <div className="carousel-edge carousel-edge-left" />
          <div className="carousel-edge carousel-edge-right" />
        </div>

        {/* Bottom controls */}
        <div className="tracks-bottom">
          <div className="tracks-pagination">
            {visibleTracks.map(({ index, theme }) => (
              <button
                key={index}
                type="button"
                className={`pagination-dot ${
                  index === activeIndex
                    ? 'pagination-dot-active'
                    : ''
                }`}
                onClick={() => goTo(index)}
                aria-label={`Go to track ${index + 1}`}
                style={
                  index === activeIndex
                    ? ({
                        '--dot-color': theme.accent,
                      } as React.CSSProperties)
                    : undefined
                }
              />
            ))}
          </div>

          <div className="tracks-status">
            <Sparkles size={13} strokeWidth={1.4} />
            <span>
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(totalTracks).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .tracks-section {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 45%,
              rgba(59, 130, 246, 0.075),
              transparent 34%
            ),
            linear-gradient(
              180deg,
              #050816 0%,
              #060a18 50%,
              #050816 100%
            );
        }

        .tracks-section::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.24;
          background-image:
            linear-gradient(
              rgba(103, 232, 249, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(103, 232, 249, 0.025) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
        }

        .tracks-header {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 55px;
        }

        .tracks-kicker {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          color: var(--stellar-cyan);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .tracks-kicker-line {
          display: block;
          width: 32px;
          height: 1px;
          background: var(--stellar-cyan);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.6);
        }

        .tracks-title {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(38px, 5vw, 70px);
          font-weight: 500;
          line-height: 0.98;
          letter-spacing: -0.055em;
          color: var(--text);
        }

        .tracks-title span {
          color: var(--stellar-cyan);
        }

        .tracks-subtitle {
          max-width: 590px;
          margin: 19px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

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
          border: 1px solid rgba(103, 232, 249, 0.16);
          border-radius: 50%;
          background: rgba(7, 16, 39, 0.72);
          color: var(--muted);
          cursor: pointer;
          transition:
            transform 180ms ease,
            color 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .tracks-arrow:hover {
          transform: translateY(-2px);
          border-color: rgba(34, 211, 238, 0.5);
          background: rgba(34, 211, 238, 0.08);
          color: var(--stellar-cyan);
        }

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

        .planet-card {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(370px, 72vw);
          height: 530px;
          overflow: hidden;
          transform-origin: center center;
          margin-left: -185px;
          margin-top: -265px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 22px;
          background:
            radial-gradient(
              circle at 50% 43%,
              var(--planet-atmosphere),
              transparent 34%
            ),
            linear-gradient(
              150deg,
              rgba(17, 25, 54, 0.95),
              rgba(5, 8, 22, 0.98)
            );
          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.42),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
          cursor: pointer;
          transition:
            transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 650ms ease,
            border-color 400ms ease,
            box-shadow 400ms ease;
          will-change: transform, opacity;
          user-select: none;
        }

        .planet-card-active {
          border-color: color-mix(
            in srgb,
            var(--track-accent) 36%,
            transparent
          );
          box-shadow:
            0 30px 100px rgba(0, 0, 0, 0.48),
            0 0 80px var(--track-accent-soft),
            inset 0 1px 0 rgba(255, 255, 255, 0.055);
        }

        .planet-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .planet-stars span {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(226, 242, 255, 0.7);
          box-shadow: 0 0 5px rgba(186, 230, 253, 0.5);
        }

        .planet-stars span:nth-child(1) {
          top: 8%;
          left: 16%;
        }

        .planet-stars span:nth-child(2) {
          top: 17%;
          right: 17%;
          width: 1px;
          height: 1px;
        }

        .planet-stars span:nth-child(3) {
          top: 31%;
          left: 9%;
          width: 1px;
          height: 1px;
        }

        .planet-stars span:nth-child(4) {
          top: 43%;
          right: 10%;
        }

        .planet-stars span:nth-child(5) {
          top: 57%;
          left: 13%;
          width: 1px;
          height: 1px;
        }

        .planet-stars span:nth-child(6) {
          bottom: 27%;
          right: 19%;
        }

        .planet-stars span:nth-child(7) {
          bottom: 15%;
          left: 25%;
          width: 1px;
          height: 1px;
        }

        .planet-stars span:nth-child(8) {
          bottom: 9%;
          right: 33%;
          width: 1px;
          height: 1px;
        }

        .hud-corner {
          position: absolute;
          width: 17px;
          height: 17px;
          opacity: 0.7;
          border-color: var(--track-accent);
          pointer-events: none;
        }

        .hud-top-left {
          top: 15px;
          left: 15px;
          border-top: 1px solid;
          border-left: 1px solid;
        }

        .hud-top-right {
          top: 15px;
          right: 15px;
          border-top: 1px solid;
          border-right: 1px solid;
        }

        .hud-bottom-left {
          bottom: 15px;
          left: 15px;
          border-bottom: 1px solid;
          border-left: 1px solid;
        }

        .hud-bottom-right {
          right: 15px;
          bottom: 15px;
          border-right: 1px solid;
          border-bottom: 1px solid;
        }

        .planet-card-header {
          position: absolute;
          top: 24px;
          left: 26px;
          right: 26px;
          z-index: 8;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .planet-index {
          color: var(--muted-dark);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.15em;
        }

        .planet-icon {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--track-accent-soft);
          border-radius: 50%;
          background: rgba(5, 8, 22, 0.58);
        }

        .planet-vertical-title {
          position: absolute;
          top: 90px;
          left: 22px;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: rgba(248, 251, 255, 0.12);
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: 0.08em;
          pointer-events: none;
        }

        .planet-vertical-title span {
          display: block;
        }

        .planet-visual {
          position: absolute;
          top: 90px;
          left: 50%;
          width: 245px;
          height: 245px;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .planet-atmosphere {
          position: absolute;
          inset: -28px;
          border-radius: 50%;
          background: var(--planet-glow);
          opacity: 0.17;
          filter: blur(30px);
        }

        .planet-body {
          position: absolute;
          inset: 17px;
          overflow: hidden;
          border-radius: 50%;
          box-shadow:
            inset -34px -18px 48px rgba(0, 0, 0, 0.58),
            inset 18px 10px 28px rgba(255, 255, 255, 0.12),
            0 0 45px var(--planet-glow);
        }

        .planet-surface {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 30% 27%,
              rgba(255, 255, 255, 0.32),
              transparent 11%
            ),
            radial-gradient(
              circle at 62% 48%,
              var(--track-accent-soft),
              transparent 40%
            ),
            linear-gradient(
              140deg,
              rgba(255, 255, 255, 0.13),
              transparent 38%
            );
        }

        /* AI PLANET */

        .planet-ai .planet-body {
          background:
            radial-gradient(
              circle at 34% 29%,
              #67e8f9 0%,
              #0891b2 20%,
              #164e63 46%,
              #07111f 75%,
              #020617 100%
            );
        }

        .ai-grid {
          position: absolute;
          inset: 0;
          opacity: 0.48;
          background-image:
            linear-gradient(
              rgba(103, 232, 249, 0.35) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(103, 232, 249, 0.35) 1px,
              transparent 1px
            );
          background-size: 15px 15px;
          mask-image: radial-gradient(circle, black, transparent 72%);
        }

        .ai-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 34px;
          height: 34px;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(165, 243, 252, 0.75);
          border-radius: 50%;
          background: rgba(34, 211, 238, 0.2);
          box-shadow:
            0 0 20px rgba(34, 211, 238, 0.8),
            0 0 50px rgba(34, 211, 238, 0.3);
        }

        .ai-orbit {
          position: absolute;
          inset: 4px -24px;
          border: 1px solid rgba(103, 232, 249, 0.18);
          border-radius: 50%;
          transform: rotate(-22deg);
        }

        .ai-orbit span {
          position: absolute;
          top: -4px;
          left: 50%;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #67e8f9;
          box-shadow: 0 0 12px #22d3ee;
        }

        /* MARS */

        .planet-mars .planet-body {
          background:
            radial-gradient(
              circle at 30% 27%,
              #fca5a5 0%,
              #b91c1c 26%,
              #7f1d1d 52%,
              #450a0a 76%,
              #1c0505 100%
            );
        }

        .mars-crater {
          position: absolute;
          border-radius: 50%;
          border: 5px solid rgba(69, 10, 10, 0.4);
          background: rgba(248, 113, 113, 0.12);
          box-shadow:
            inset 4px 4px 9px rgba(0, 0, 0, 0.25),
            2px 2px 5px rgba(255, 255, 255, 0.05);
        }

        .mars-crater-one {
          top: 28%;
          left: 21%;
          width: 30px;
          height: 30px;
        }

        .mars-crater-two {
          top: 52%;
          right: 19%;
          width: 42px;
          height: 42px;
        }

        .mars-crater-three {
          bottom: 18%;
          left: 42%;
          width: 23px;
          height: 23px;
        }

        /* EARTH */

        .planet-earth .planet-body {
          background:
            radial-gradient(
              circle at 31% 27%,
              #93c5fd 0%,
              #2563eb 27%,
              #0f3b72 52%,
              #062b4d 74%,
              #020617 100%
            );
        }

        .earth-land {
          position: absolute;
          background:
            linear-gradient(
              135deg,
              #4ade80,
              #15803d
            );
          filter: saturate(0.85);
          opacity: 0.86;
        }

        .earth-land-one {
          top: 24%;
          left: 17%;
          width: 76px;
          height: 43px;
          border-radius: 64% 36% 58% 42%;
          transform: rotate(-19deg);
        }

        .earth-land-two {
          top: 53%;
          right: 14%;
          width: 70px;
          height: 52px;
          border-radius: 35% 65% 42% 58%;
          transform: rotate(21deg);
        }

        .earth-land-three {
          bottom: 15%;
          left: 28%;
          width: 53px;
          height: 30px;
          border-radius: 65% 35% 42% 58%;
          transform: rotate(12deg);
        }

        /* NEBULA */

        .planet-nebula .planet-body {
          background:
            radial-gradient(
              circle at 48% 44%,
              #c4b5fd 0%,
              #7c3aed 20%,
              #4c1d95 44%,
              #24104f 67%,
              #09051a 100%
            );
        }

        .nebula-cloud {
          position: absolute;
          border-radius: 50%;
          filter: blur(13px);
          mix-blend-mode: screen;
        }

        .nebula-cloud-one {
          top: 12%;
          left: 8%;
          width: 95px;
          height: 58px;
          background: rgba(236, 72, 153, 0.65);
          transform: rotate(-25deg);
        }

        .nebula-cloud-two {
          right: 2%;
          bottom: 16%;
          width: 110px;
          height: 65px;
          background: rgba(59, 130, 246, 0.62);
          transform: rotate(25deg);
        }

        .nebula-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 26px;
          height: 26px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: #f5f3ff;
          box-shadow:
            0 0 18px #c4b5fd,
            0 0 42px #8b5cf6;
        }

        .planet-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 290px;
          height: 72px;
          transform: translate(-50%, -50%) rotate(-19deg);
          border: 1px solid rgba(196, 181, 253, 0.48);
          border-radius: 50%;
          box-shadow:
            0 0 20px rgba(139, 92, 246, 0.16),
            inset 0 0 10px rgba(196, 181, 253, 0.08);
        }

        .planet-ring span {
          position: absolute;
          inset: 7px 28px;
          border: 1px solid rgba(236, 72, 153, 0.22);
          border-radius: 50%;
        }

        .card-orbit {
          position: absolute;
          border: 1px solid rgba(148, 163, 184, 0.065);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-orbit-one {
          width: 390px;
          height: 160px;
          left: -10px;
          top: 190px;
          transform: rotate(-16deg);
        }

        .card-orbit-two {
          width: 340px;
          height: 125px;
          left: 16px;
          top: 207px;
          transform: rotate(13deg);
        }

        .planet-card-content {
          position: absolute;
          right: 27px;
          bottom: 76px;
          left: 27px;
          z-index: 7;
        }

        .planet-eyebrow {
          margin-bottom: 9px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.17em;
        }

        .planet-card-content h3 {
          margin: 0;
          max-width: 275px;
          color: var(--text);
          font-family: var(--font-display);
          font-size: 25px;
          font-weight: 500;
          line-height: 1.08;
          letter-spacing: -0.025em;
        }

        .planet-card-content p {
          max-width: 275px;
          margin: 11px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.65;
        }

        .planet-card-footer {
          position: absolute;
          right: 27px;
          bottom: 25px;
          left: 27px;
          z-index: 8;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .planet-footer-label {
          display: block;
          margin-bottom: 4px;
          color: var(--muted-dark);
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.15em;
        }

        .planet-footer-value {
          display: block;
          color: var(--muted);
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        .planet-footer-icon {
          display: grid;
          place-items: center;
          width: 27px;
          height: 27px;
          border: 1px solid var(--track-accent-soft);
          border-radius: 50%;
        }

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
          background: linear-gradient(
            90deg,
            #050816,
            transparent
          );
        }

        .carousel-edge-right {
          right: 0;
          background: linear-gradient(
            270deg,
            #050816,
            transparent
          );
        }

        .tracks-bottom {
          position: relative;
          z-index: 30;
          display: flex;
          justify-content: space-between;
          align-items: center;
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
          background: rgba(148, 163, 184, 0.18);
          cursor: pointer;
          transition:
            width 250ms ease,
            background 250ms ease,
            box-shadow 250ms ease;
        }

        .pagination-dot:hover {
          background: rgba(148, 163, 184, 0.45);
        }

        .pagination-dot-active {
          width: 42px;
          background: var(--dot-color);
          box-shadow: 0 0 12px var(--dot-color);
        }

        .tracks-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted-dark);
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.13em;
        }

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

        @media (max-width: 900px) {
          .tracks-header {
            align-items: flex-start;
          }

          .tracks-carousel {
            height: 560px;
          }

          .planet-card {
            width: min(350px, 72vw);
            height: 510px;
            margin-left: -175px;
            margin-top: -255px;
          }

          .planet-visual {
            top: 82px;
            transform: translateX(-50%) scale(0.94);
          }
        }

        @media (max-width: 700px) {
          .tracks-header {
            display: block;
            margin-bottom: 35px;
          }

          .tracks-title {
            font-size: clamp(39px, 12vw, 58px);
          }

          .tracks-subtitle {
            max-width: 470px;
            font-size: 13px;
          }

          .tracks-controls {
            margin-top: 22px;
          }

          .tracks-carousel {
            height: 545px;
            margin-inline: -20px;
          }

          .planet-card {
            width: min(325px, 78vw);
            height: 500px;
            margin-left: -162.5px;
            margin-top: -250px;
          }

          .planet-visual {
            top: 82px;
            transform: translateX(-50%) scale(0.88);
          }

          .planet-card-content {
            bottom: 73px;
          }

          .planet-card-content h3 {
            font-size: 23px;
          }

          .planet-card-content p {
            font-size: 11px;
          }

          .tracks-bottom {
            padding-inline: 4px;
          }
        }

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

          .planet-visual {
            top: 76px;
            transform: translateX(-50%) scale(0.79);
          }

          .planet-vertical-title {
            left: 17px;
            font-size: 9px;
          }

          .planet-card-content {
            right: 22px;
            bottom: 68px;
            left: 22px;
          }

          .planet-card-content h3 {
            font-size: 21px;
          }

          .planet-card-content p {
            max-width: 245px;
            font-size: 10.5px;
          }

          .planet-card-footer {
            right: 22px;
            left: 22px;
            bottom: 21px;
          }

          .carousel-edge {
            width: 9%;
          }

          .tracks-status {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .planet-card {
            transition: opacity 250ms ease;
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

export { TracksSection };