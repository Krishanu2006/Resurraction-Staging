import React from 'react';
import {
  Handshake,
  ArrowUpRight,
} from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import {
  sponsorTiers,
  sponsorsOverview,
} from '../../data/sponsors';

export const SponsorsSection: React.FC = () => {
  return (
    <section id="sponsors" className="section">
      <div className="container">
        <Reveal>
          <SectionHeading
            code="05 — Partners"
            title="Built with people who back good ideas."
            subtitle={sponsorsOverview.description}
          />
        </Reveal>

        <div
          style={{
            display: 'grid',
            gap: 18,
          }}
        >
          {sponsorTiers.map((tier, index) => (
            <Reveal
              key={tier.id}
              delay={index * 60}
            >
              <article
                className="sponsor-panel"
                style={{
                  padding: 30,
                  border:
                    '1px solid var(--border-subtle)',
                  borderRadius:
                    'var(--radius-lg)',
                  background:
                    'linear-gradient(145deg, #0d1530, #090f22)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: 20,
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color:
                          'var(--stellar-cyan)',
                        fontFamily:
                          'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '.13em',
                      }}
                    >
                      {tier.badge}
                    </div>

                    <h3
                      style={{
                        marginTop: 8,
                        color: 'var(--text)',
                        fontFamily:
                          'var(--font-display)',
                        fontSize: 23,
                        fontWeight: 550,
                      }}
                    >
                      {tier.tierName}
                    </h3>
                  </div>

                  <Handshake
                    size={23}
                    strokeWidth={1.3}
                    color="var(--cosmic-blue-bright)"
                  />
                </div>

                <div
                  className="sponsor-slots"
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      `repeat(${Math.min(
                        tier.slots.length,
                        3
                      )}, 1fr)`,
                    gap: 10,
                  }}
                >
                  {tier.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="sponsor-slot"
                      style={{
                        minHeight: 110,
                        padding: 18,
                        display: 'flex',
                        flexDirection:
                          'column',
                        justifyContent:
                          'space-between',
                        border:
                          '1px solid var(--hairline)',
                        background:
                          'rgba(5,8,22,.55)',
                        transition:
                          'border-color var(--transition-fast), background var(--transition-fast)',
                      }}
                    >
                      <span
                        style={{
                          color:
                            'var(--text-dim)',
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {slot.label.replace(
                          ' // INCOMING',
                          ''
                        )}
                      </span>

                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          color:
                            'var(--muted-dark)',
                          fontFamily:
                            'var(--font-mono)',
                          fontSize: 8,
                          letterSpacing: '.08em',
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background:
                              'var(--stellar-cyan)',
                            boxShadow:
                              '0 0 8px rgba(34,211,238,.4)',
                          }}
                        />

                        {slot.note.replace(
                          'CLEARANCE IN PROGRESS',
                          'COMING SOON'
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={220}>
          <a
            href="#faq"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 26,
              color: 'var(--stellar-cyan)',
              fontSize: 13,
            }}
          >
            Partnership information
            <ArrowUpRight size={15} />
          </a>
        </Reveal>
      </div>

      <style>{`
        .sponsor-slot:hover {
          border-color: var(--border-cyan) !important;
          background: rgba(17,25,54,.72) !important;
        }

        @media (max-width: 650px) {
          .sponsor-slots {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};