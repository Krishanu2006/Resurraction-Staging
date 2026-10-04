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
            className="prize-feature"
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1.2fr .8fr',
              minHeight: 390,
              border:
                '1px solid var(--border-cosmic)',
              borderRadius:
                'var(--radius-xl)',
              background:
                'linear-gradient(135deg, #0b1229, #0a1025 55%, #101b3b)',
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
                  color: 'var(--stellar-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '.13em',
                }}
              >
                <Trophy
                  size={17}
                  strokeWidth={1.4}
                />
                {prizePoolOverview.title}
              </div>

              <div
                style={{
                  marginTop: 28,
                  color: 'var(--text)',
                  fontFamily:
                    'var(--font-display)',
                  fontSize:
                    'clamp(3.2rem, 8vw, 7rem)',
                  fontWeight: 600,
                  lineHeight: .88,
                  letterSpacing: '-.065em',
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
                  'radial-gradient(circle at 50% 50%, rgba(34,211,238,.14), transparent 23%), radial-gradient(circle at 50% 50%, rgba(59,130,246,.08), transparent 52%)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 270,
                  height: 100,
                  left: '50%',
                  top: '50%',
                  transform:
                    'translate(-50%, -50%) rotate(-18deg)',
                  border:
                    '1px solid rgba(34,211,238,.24)',
                  borderRadius: '50%',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  width: 220,
                  height: 80,
                  left: '50%',
                  top: '50%',
                  transform:
                    'translate(-50%, -50%) rotate(25deg)',
                  border:
                    '1px solid rgba(139,92,246,.18)',
                  borderRadius: '50%',
                }}
              />

              <div
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
                    'radial-gradient(circle at 35% 28%, #b8f4ff, #2775b7 38%, #07142d 78%)',
                  boxShadow:
                    '0 0 45px rgba(34,211,238,.22)',
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
                className="prize-card"
                style={{
                  minHeight: 250,
                  padding: 28,
                  border:
                    '1px solid var(--border-subtle)',
                  borderRadius:
                    'var(--radius-lg)',
                  background:
                    'var(--surface-1)',
                  transition:
                    'border-color var(--transition-normal), transform var(--transition-normal)',
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
                        'var(--stellar-cyan)',
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
                    color="var(--muted-dark)"
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
                      'var(--cosmic-blue-bright)',
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
          transform: translateY(-3px);
          border-color: var(--border-cyan) !important;
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