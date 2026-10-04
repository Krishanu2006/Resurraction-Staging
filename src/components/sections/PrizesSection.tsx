import React from 'react';
import {
  Trophy,
  ArrowUpRight,
} from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import {
  prizePoolOverview,
  prizesData,
} from '../../data/prizes';

export const PrizesSection: React.FC = () => {
  return (
    <section id="prize" className="section">
      <div className="container">
        <Reveal>
          <SectionHeading
            code="03 — Prizes"
            title="Good ideas should travel further."
            subtitle="The final prize structure is being prepared with our partners. Official amounts will be published before registration."
          />
        </Reveal>

        {/* Featured prize panel */}

        <Reveal delay={80}>
          <div
            className="prize-feature interactive-card"
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1.2fr .8fr',
              minHeight: 390,
              border:
                '1px solid var(--theme-border)',
              borderRadius:
                'var(--radius-xl)',
              background:
                'var(--theme-card-bg, color-mix(in srgb, var(--theme-surface) 85%, transparent))',
              boxShadow: 'var(--theme-shadow)',
            }}
          >
            <div
              style={{
                padding:
                  'clamp(30px, 6vw, 65px)',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  color: 'var(--theme-accent)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '.13em',
                }}
              >
                <Trophy
                  size={17}
                  strokeWidth={1.4}
                  className="animate-energy-pulse"
                />
                {prizePoolOverview.title}
              </div>

              <div
                style={{
                  marginTop: 28,
                  color: 'var(--theme-accent)',
                  fontFamily:
                    'var(--font-display)',
                  fontSize:
                    'clamp(2.2rem, 7vw, 6.5rem)',
                  fontWeight: 600,
                  lineHeight: .92,
                  letterSpacing: '-.055em',
                  textShadow: '0 0 35px var(--theme-glow-color, rgba(255, 255, 255, 0.2))',
                }}
              >
                {prizePoolOverview.highlight}
              </div>

              <p
                style={{
                  maxWidth: 600,
                  marginTop: 28,
                  color: 'var(--muted)',
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                {prizePoolOverview.description}
              </p>
            </div>

            {/* Orbital prize visual */}

            <div
              aria-hidden="true"
              style={{
                position: 'relative',
                minHeight: 300,
                overflow: 'hidden',
                background:
                  'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--theme-accent) 20%, transparent), transparent 55%)',
              }}
            >
              <div
                className="animate-spin-orbit"
                style={{
                  position: 'absolute',
                  width: 270,
                  height: 100,
                  left: '50%',
                  top: '50%',
                  border:
                    '1px dashed var(--theme-accent)',
                  opacity: 0.5,
                  borderRadius: '50%',
                }}
              />

              <div
                className="animate-spin-orbit-reverse"
                style={{
                  position: 'absolute',
                  width: 220,
                  height: 80,
                  left: '50%',
                  top: '50%',
                  border:
                    '1px solid var(--theme-cta)',
                  opacity: 0.4,
                  borderRadius: '50%',
                }}
              />

              <div
                className="animate-logo-breath"
                style={{
                  position: 'absolute',
                  width: 95,
                  height: 95,
                  left: '50%',
                  top: '50%',
                  transform:
                    'translate(-50%, -50%)',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 35% 28%, var(--theme-accent), var(--theme-primary) 50%, var(--theme-background) 90%)',
                  boxShadow:
                    '0 0 45px var(--theme-glow-color, rgba(255, 255, 255, 0.3))',
                }}
              />
            </div>
          </div>
        </Reveal>

        {/* Prize cards */}

        <div
          className="prize-grid"
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, 1fr)',
            gap: 18,
            marginTop: 18,
          }}
        >
          {prizesData.map((prize, index) => (
            <Reveal
              key={prize.id}
              delay={130 + index * 60}
            >
              <article
                className="prize-card interactive-card"
                style={{
                  minHeight: 250,
                  padding: 28,
                  border:
                    '1px solid var(--theme-border)',
                  borderRadius:
                    'var(--radius-lg)',
                  background:
                    'var(--theme-card-bg, color-mix(in srgb, var(--theme-surface) 85%, transparent))',
                  transition:
                    'border-color var(--transition-normal), transform var(--transition-normal), box-shadow var(--transition-normal)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                  }}
                >
                  <span
                    style={{
                      color:
                        'var(--theme-accent)',
                      fontFamily:
                        'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '.12em',
                    }}
                  >
                    {prize.tier}
                  </span>

                  <ArrowUpRight
                    size={16}
                    color="var(--theme-accent)"
                  />
                </div>

                <h3
                  style={{
                    marginTop: 35,
                    color: 'var(--text)',
                    fontFamily:
                      'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 550,
                  }}
                >
                  {prize.title}
                </h3>

                <div
                  style={{
                    marginTop: 10,
                    color:
                      'var(--theme-accent)',
                    fontFamily:
                      'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  {prize.amount}
                </div>

                <p
                  style={{
                    marginTop: 12,
                    color: 'var(--muted)',
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  {prize.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        .prize-card:hover {
          transform: translateY(-4px);
          border-color: var(--theme-accent) !important;
          background: color-mix(in srgb, var(--theme-surface) 85%, var(--theme-accent) 12%) !important;
          box-shadow: 0 0 25px var(--theme-glow-color, rgba(255, 255, 255, 0.2)) !important;
        }

        @media (max-width: 800px) {
          .prize-feature {
            grid-template-columns: 1fr !important;
          }

          .prize-feature > div:last-child {
            min-height: 260px;
          }

          .prize-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};