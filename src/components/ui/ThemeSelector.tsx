import React from 'react';

import tauCetiImage from '../sections/track_images/taucetie.png';
import millerImage from '../sections/track_images/miller.png';
import pandoraImage from '../sections/track_images/pandora.png';
import keplerImage from '../sections/track_images/kepler.png';
import { ThemeId } from '../../config/theme';

type ThemeSelectorProps = {
  onSelect: (themeId: ThemeId) => void;
};

type Theme = {
  id: ThemeId;
  number: string;
  name: string;
  subtitle: string;
  image: string;
  available: boolean;
  accent: string;
};

const themes: Theme[] = [
  {
    id: 'tau-ceti',
    number: '01',
    name: 'TAU CETI e',
    subtitle: 'PRIMARY WORLD',
    image: tauCetiImage,
    available: true,

    // CHANGED:
    // Old: #e5a93c
    // New vibrant orange
    accent: '#ff6a00',
  },
  {
    id: 'miller',
    number: '02',
    name: "MILLER'S PLANET",
    subtitle: 'OCEAN WORLD',
    image: millerImage,
    available: true,
    accent: '#e2e8f0',
  },
  {
    id: 'pandora',
    number: '03',
    name: 'PANDORA',
    subtitle: 'ALIEN FRONTIER',
    image: pandoraImage,
    available: true,
    accent: '#00d2ff',
  },
  {
    id: 'kepler',
    number: '04',
    name: 'KEPLER-186f',
    subtitle: 'DISTANT WORLD',
    image: keplerImage,
    available: true,
    accent: '#ff3344',
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onSelect,
}) => {
  const [selectedTheme, setSelectedTheme] =
    React.useState<ThemeId>('tau-ceti');

  const handleThemeClick = (theme: Theme) => {
    if (!theme.available) return;

    setSelectedTheme(theme.id);
    onSelect(theme.id);
  };

  return (
    <div className="theme-selector">
      {/* Background */}
      <div className="theme-selector__background" />

      <div className="theme-selector__stars" />

      {/* Main content */}
      <main className="theme-selector__content">
        {/* Header */}
        <header className="theme-selector__header">
          <div className="theme-selector__eyebrow">
            <span className="theme-selector__eyebrow-line" />
            RESURRACTION / WORLD SELECT
            <span className="theme-selector__eyebrow-line" />
          </div>

          <h1 className="theme-selector__title">
            CHOOSE YOUR
            <span>WORLD</span>
          </h1>

          <p className="theme-selector__description">
            Select your destination.
            <br />
            Your journey begins here.
          </p>
        </header>

        {/* Theme grid */}
        <section
          className="theme-selector__grid"
          aria-label="Theme selection"
        >
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={[
                'theme-selector__card',
                theme.available
                  ? 'theme-selector__card--available'
                  : 'theme-selector__card--disabled',
              ].join(' ')}
              onClick={() => handleThemeClick(theme)}
              disabled={!theme.available}
              style={
                {
                  '--theme-accent': theme.accent,
                  '--theme-image': `url("${theme.image}")`,
                } as React.CSSProperties
              }
              aria-label={
                theme.available
                  ? `Enter ${theme.name}`
                  : `${theme.name} coming soon`
              }
            >
              {/* Planet image */}
              <div className="theme-selector__image" />

              {/* Dark image gradient */}
              <div className="theme-selector__image-overlay" />

              {/* Border glow */}
              <div className="theme-selector__glow" />

              {/* Card top HUD */}
              <div className="theme-selector__card-top">
                <span className="theme-selector__number">
                  {theme.number}
                </span>

                <span
                  className={
                    theme.available
                      ? 'theme-selector__status theme-selector__status--available'
                      : 'theme-selector__status'
                  }
                >
                  <span className="theme-selector__status-dot" />

                  {theme.available
                    ? 'AVAILABLE'
                    : 'COMING SOON'}
                </span>
              </div>

              {/* Card bottom content */}
              <div className="theme-selector__card-content">
                <span className="theme-selector__subtitle">
                  {theme.subtitle}
                </span>

                <h2 className="theme-selector__card-title">
                  {theme.name}
                </h2>

                <div className="theme-selector__card-line" />

                <span className="theme-selector__action">
                  {theme.available
                    ? 'ENTER WORLD'
                    : 'LOCKED'}
                </span>
              </div>

              {/* Corner decorations */}
              <span className="theme-selector__corner theme-selector__corner--tl" />
              <span className="theme-selector__corner theme-selector__corner--tr" />
              <span className="theme-selector__corner theme-selector__corner--bl" />
              <span className="theme-selector__corner theme-selector__corner--br" />

              {/* Disabled overlay */}
              {!theme.available && (
                <div className="theme-selector__locked-overlay">
                  <span>ACCESS RESTRICTED</span>
                </div>
              )}
            </button>
          ))}
        </section>

        {/* Bottom action */}
        <footer className="theme-selector__footer">
          <button
            type="button"
            className="theme-selector__enter"
            onClick={() => onSelect(selectedTheme)}
          >
            <span>
              ENTER{' '}
              {
                themes.find(
                  (theme) =>
                    theme.id === selectedTheme
                )?.name
              }
            </span>

            <span className="theme-selector__enter-arrow">
              →
            </span>
          </button>

          <div className="theme-selector__footer-meta">
            <span>04 WORLDS</span>
            <span className="theme-selector__footer-divider" />
            <span>01 AVAILABLE</span>
          </div>
        </footer>
      </main>

      <style>{`
        /* =========================================================
           THEME SELECTOR
           Full-screen / no-scroll / 2 × 2 layout
           ========================================================= */

        .theme-selector {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100svh;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 50% 35%,
              rgba(31, 70, 130, 0.12),
              transparent 42%
            ),
            #030510;

          color: #f8fbff;
          isolation: isolate;
          z-index: 1000;
        }

        /* ---------------------------------------------------------
           BACKGROUND
           --------------------------------------------------------- */

        .theme-selector__background {
          position: absolute;
          inset: 0;
          z-index: -3;

          background:
            linear-gradient(
              180deg,
              rgba(3, 5, 16, 0.1) 0%,
              rgba(3, 5, 16, 0.38) 100%
            ),
            radial-gradient(
              ellipse at center,
              #0b1429 0%,
              #050918 48%,
              #02030a 100%
            );
        }

        .theme-selector__stars {
          position: absolute;
          inset: 0;
          z-index: -2;
          pointer-events: none;

          opacity: 0.45;

          background-image:
            radial-gradient(
              circle at 12% 18%,
              rgba(255,255,255,0.8) 0 1px,
              transparent 1.5px
            ),
            radial-gradient(
              circle at 82% 14%,
              rgba(255,255,255,0.65) 0 1px,
              transparent 1.5px
            ),
            radial-gradient(
              circle at 68% 77%,
              rgba(103,232,249,0.7) 0 1px,
              transparent 1.5px
            ),
            radial-gradient(
              circle at 25% 82%,
              rgba(255,255,255,0.55) 0 1px,
              transparent 1.5px
            ),
            radial-gradient(
              circle at 91% 61%,
              rgba(255,255,255,0.5) 0 1px,
              transparent 1.5px
            );

          background-size:
            240px 240px,
            310px 310px,
            380px 380px,
            290px 290px,
            420px 420px;
        }

        /* ---------------------------------------------------------
           CONTENT
           --------------------------------------------------------- */

        .theme-selector__content {
          position: relative;
          z-index: 2;

          width: min(1040px, 94vw);
          height: 100%;

          margin: 0 auto;

          display: grid;
          grid-template-rows:
            auto
            minmax(0, 1fr)
            auto;

          align-items: center;

          padding:
            clamp(18px, 3vh, 34px)
            0
            clamp(16px, 2.5vh, 26px);
        }

        /* ---------------------------------------------------------
           HEADER
           --------------------------------------------------------- */

        .theme-selector__header {
          text-align: center;
          margin-bottom: clamp(10px, 1.7vh, 18px);
        }

        .theme-selector__eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          color: #67e8f9;

          font-family:
            'Space Mono',
            monospace;

          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .theme-selector__eyebrow-line {
          width: 30px;
          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #67e8f9
            );
        }

        .theme-selector__eyebrow-line:last-child {
          background:
            linear-gradient(
              90deg,
              #67e8f9,
              transparent
            );
        }

        .theme-selector__title {
          margin:
            clamp(8px, 1.2vh, 12px)
            0
            5px;

          font-family:
            'Nasalization',
            sans-serif;

          font-size:
            clamp(27px, 4.2vh, 43px);

          font-weight: 400;
          letter-spacing: 0.045em;
          line-height: 0.95;
        }

        .theme-selector__title span {
          display: block;

          color: #67e8f9;

          text-shadow:
            0 0 22px
            rgba(103,232,249,0.28);
        }

        .theme-selector__description {
          margin: 0;

          color:
            rgba(255,255,255,0.52);

          font-family:
            'Space Mono',
            monospace;

          font-size: 9px;
          line-height: 1.5;
          letter-spacing: 0.06em;
        }

        /* ---------------------------------------------------------
           GRID
           --------------------------------------------------------- */

        .theme-selector__grid {
          min-height: 0;

          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          grid-template-rows:
            repeat(2, minmax(0, 1fr));

          gap: clamp(10px, 1.4vh, 16px);

          align-self: stretch;
        }

        /* ---------------------------------------------------------
           CARD
           --------------------------------------------------------- */

        .theme-selector__card {
          position: relative;

          min-height: 0;

          padding: 0;

          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,0.12);

          border-radius: 5px;

          color: #fff;

          background:
            #07101f;

          cursor: pointer;

          text-align: left;

          isolation: isolate;

          transition:
            transform 280ms ease,
            border-color 280ms ease,
            box-shadow 280ms ease;
        }

        .theme-selector__card:hover {
          transform:
            translateY(-2px);

          border-color:
            var(--theme-accent);

          box-shadow:
            0 0 0 1px
            rgba(255,255,255,0.04),
            0 12px 32px
            rgba(0,0,0,0.35),
            0 0 28px
            color-mix(
              in srgb,
              var(--theme-accent) 22%,
              transparent
            );
        }

        .theme-selector__card:focus-visible {
          outline:
            2px solid
            var(--theme-accent);

          outline-offset: 3px;
        }

        .theme-selector__card--disabled {
          cursor: not-allowed;
          filter: saturate(0.45);
        }

        /* ---------------------------------------------------------
           IMAGE
           --------------------------------------------------------- */

        .theme-selector__image {
          position: absolute;
          inset: 0;

          z-index: -3;

          background:
            var(--theme-image)
            center / cover
            no-repeat;

          transform: scale(1.01);

          transition:
            transform 500ms ease;
        }

        .theme-selector__card:hover
        .theme-selector__image {
          transform:
            scale(1.045);
        }

        /* ---------------------------------------------------------
           IMAGE OVERLAY
           --------------------------------------------------------- */

        .theme-selector__image-overlay {
          position: absolute;
          inset: 0;

          z-index: -2;

          background:
            linear-gradient(
              180deg,
              rgba(2,5,14,0.18) 0%,
              rgba(2,5,14,0.12) 34%,
              rgba(2,5,14,0.82) 100%
            );
        }

        /* ---------------------------------------------------------
           GLOW
           --------------------------------------------------------- */

        .theme-selector__glow {
          position: absolute;
          inset: 0;

          z-index: -1;

          pointer-events: none;

          opacity: 0;

          background:
            radial-gradient(
              circle at 50% 50%,
              color-mix(
                in srgb,
                var(--theme-accent) 16%,
                transparent
              ),
              transparent 64%
            );

          transition:
            opacity 280ms ease;
        }

        .theme-selector__card:hover
        .theme-selector__glow {
          opacity: 1;
        }

        /* ---------------------------------------------------------
           CARD TOP
           --------------------------------------------------------- */

        .theme-selector__card-top {
          position: absolute;

          top: 12px;
          left: 12px;
          right: 12px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          z-index: 3;
        }

        .theme-selector__number {
          color:
            rgba(255,255,255,0.72);

          font-family:
            'Space Mono',
            monospace;

          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .theme-selector__status {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          padding:
            4px 7px;

          border:
            1px solid
            rgba(255,255,255,0.12);

          border-radius: 3px;

          color:
            rgba(255,255,255,0.45);

          background:
            rgba(0,0,0,0.2);

          font-family:
            'Space Mono',
            monospace;

          font-size: 6px;
          letter-spacing: 0.12em;
        }

        .theme-selector__status--available {
          color:
            var(--theme-accent);

          border-color:
            color-mix(
              in srgb,
              var(--theme-accent) 40%,
              transparent
            );
        }

        .theme-selector__status-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: currentColor;

          box-shadow:
            0 0 8px currentColor;
        }

        /* ---------------------------------------------------------
           CARD CONTENT
           --------------------------------------------------------- */

        .theme-selector__card-content {
          position: absolute;

          left: 14px;
          right: 14px;
          bottom: 13px;
        }

        .theme-selector__subtitle {
          display: block;

          margin-bottom: 3px;

          color:
            var(--theme-accent);

          font-family:
            'Space Mono',
            monospace;

          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .theme-selector__card-title {
          margin: 0;

          color: #fff;

          font-family:
            'Nasalization',
            sans-serif;

          font-size:
            clamp(17px, 2.5vh, 25px);

          font-weight: 400;
          letter-spacing: 0.035em;
          line-height: 1;
        }

        .theme-selector__card-line {
          width: 100%;
          height: 1px;

          margin: 8px 0 6px;

          background:
            linear-gradient(
              90deg,
              var(--theme-accent),
              rgba(255,255,255,0.08),
              transparent
            );
        }

        .theme-selector__action {
          color:
            rgba(255,255,255,0.66);

          font-family:
            'Space Mono',
            monospace;

          font-size: 7px;
          letter-spacing: 0.16em;
        }

        .theme-selector__card--available
        .theme-selector__action {
          color: #f8fbff;
        }

        /* ---------------------------------------------------------
           CORNERS
           --------------------------------------------------------- */

        .theme-selector__corner {
          position: absolute;

          width: 10px;
          height: 10px;

          opacity: 0.65;

          border-color:
            var(--theme-accent);

          pointer-events: none;
        }

        .theme-selector__corner--tl {
          top: 7px;
          left: 7px;

          border-top: 1px solid;
          border-left: 1px solid;
        }

        .theme-selector__corner--tr {
          top: 7px;
          right: 7px;

          border-top: 1px solid;
          border-right: 1px solid;
        }

        .theme-selector__corner--bl {
          bottom: 7px;
          left: 7px;

          border-bottom: 1px solid;
          border-left: 1px solid;
        }

        .theme-selector__corner--br {
          bottom: 7px;
          right: 7px;

          border-bottom: 1px solid;
          border-right: 1px solid;
        }

        /* ---------------------------------------------------------
           LOCKED
           --------------------------------------------------------- */

        .theme-selector__locked-overlay {
          position: absolute;
          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          pointer-events: none;
        }

        .theme-selector__locked-overlay span {
          padding: 6px 9px;

          border:
            1px solid
            rgba(255,255,255,0.13);

          border-radius: 3px;

          color:
            rgba(255,255,255,0.55);

          background:
            rgba(2,5,14,0.48);

          backdrop-filter: blur(7px);

          font-family:
            'Space Mono',
            monospace;

          font-size: 7px;
          letter-spacing: 0.16em;
        }

        /* ---------------------------------------------------------
           FOOTER
           --------------------------------------------------------- */

        .theme-selector__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-top:
            clamp(9px, 1.5vh, 15px);
        }

        .theme-selector__enter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 18px;

          min-width: 220px;
          height: 36px;

          padding: 0 14px;

          border:
            1px solid
            rgba(103,232,249,0.42);

          border-radius: 4px;

          color: #f8fbff;

          background:
            linear-gradient(
              135deg,
              rgba(34,211,238,0.12),
              rgba(59,130,246,0.06)
            );

          font-family:
            'Space Mono',
            monospace;

          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.13em;

          cursor: pointer;

          transition:
            background 250ms ease,
            border-color 250ms ease,
            transform 250ms ease;
        }

        .theme-selector__enter:hover {
          background:
            rgba(34,211,238,0.18);

          border-color:
            rgba(103,232,249,0.82);

          transform:
            translateY(-1px);
        }

        .theme-selector__enter:focus-visible {
          outline:
            2px solid #67e8f9;

          outline-offset: 3px;
        }

        .theme-selector__enter-arrow {
          color: #67e8f9;
          font-size: 15px;
        }

        .theme-selector__footer-meta {
          display: flex;
          align-items: center;
          gap: 9px;

          color:
            rgba(255,255,255,0.4);

          font-family:
            'Space Mono',
            monospace;

          font-size: 7px;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .theme-selector__footer-divider {
          width: 18px;
          height: 1px;

          background:
            rgba(255,255,255,0.18);
        }

        /* =========================================================
           MEDIUM SCREENS
           ========================================================= */

        @media (max-height: 760px) and (min-width: 701px) {
          .theme-selector__content {
            padding-top: 14px;
            padding-bottom: 12px;
          }

          .theme-selector__header {
            margin-bottom: 8px;
          }

          .theme-selector__title {
            font-size: 29px;
          }

          .theme-selector__description {
            font-size: 9px;
          }

          .theme-selector__grid {
            gap: 8px;
          }

          .theme-selector__card-top {
            top: 9px;
          }

          .theme-selector__card-content {
            bottom: 10px;
          }

          .theme-selector__footer {
            margin-top: 8px;
          }

          .theme-selector__enter {
            height: 32px;
          }
        }

        /* =========================================================
           MOBILE
           ========================================================= */

        @media (max-width: 700px) {
          .theme-selector__content {
            width: min(94vw, 560px);

            padding:
              14px
              0
              12px;
          }

          .theme-selector__eyebrow {
            font-size: 7px;
            gap: 7px;
          }

          .theme-selector__eyebrow-line {
            width: 18px;
          }

          .theme-selector__title {
            font-size:
              clamp(24px, 5.5vw, 31px);

            margin-top: 7px;
          }

          .theme-selector__description {
            font-size: 9px;
          }

          .theme-selector__grid {
            gap: 8px;
          }

          .theme-selector__card-top {
            left: 9px;
            right: 9px;
            top: 9px;
          }

          .theme-selector__card-content {
            left: 10px;
            right: 10px;
            bottom: 9px;
          }

          .theme-selector__status {
            padding: 4px 6px;
            font-size: 6px;
          }

          .theme-selector__number {
            font-size: 7px;
          }

          .theme-selector__subtitle {
            font-size: 6px;
          }

          .theme-selector__card-title {
            font-size:
              clamp(12px, 3.5vw, 18px);
          }

          .theme-selector__card-line {
            margin: 5px 0 4px;
          }

          .theme-selector__action {
            font-size: 5px;
          }

          .theme-selector__footer {
            margin-top: 8px;
          }

          .theme-selector__enter {
            min-width: 0;
            width: 100%;
            height: 32px;
            gap: 10px;
            font-size: 7px;
          }

          .theme-selector__footer-meta {
            display: none;
          }
        }

        /* ---------------------------------------------------------
           VERY SHORT PHONES
           --------------------------------------------------------- */

        @media (max-height: 650px) and (max-width: 700px) {
          .theme-selector__content {
            padding-top: 8px;
            padding-bottom: 7px;
          }

          .theme-selector__header {
            margin-bottom: 5px;
          }

          .theme-selector__title {
            font-size: 22px;
          }

          .theme-selector__description {
            display: none;
          }

          .theme-selector__grid {
            gap: 6px;
          }

          .theme-selector__footer {
            margin-top: 5px;
          }

          .theme-selector__enter {
            height: 28px;
          }
        }

        /* ---------------------------------------------------------
           REDUCED MOTION
           --------------------------------------------------------- */

        @media (prefers-reduced-motion: reduce) {
          .theme-selector__card,
          .theme-selector__image,
          .theme-selector__glow,
          .theme-selector__enter {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeSelector;