import React from 'react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { timelineData } from '../../data/timeline';

export const TimelineSection: React.FC = () => {
  return (
    <section id="timeline" className="section">
      <div className="container">
        <Reveal>
          <SectionHeading
            code="04 — Timeline"
            title="From first signal to final demo."
            subtitle="The dates are still being confirmed. The journey itself is simple: discover, register, build, present and celebrate."
          />
        </Reveal>

        <div
          className="timeline-wrapper"
          style={{
            maxWidth: 1050,
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <div
            className="timeline-line"
            aria-hidden="true"
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '40px',
                background: 'linear-gradient(180deg, transparent, var(--theme-accent), transparent)',
                boxShadow: '0 0 15px var(--theme-accent)',
                animation: 'beamMove 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          </div>

          {timelineData.map((item, index) => (
            <Reveal
              key={item.id}
              delay={index * 55}
            >
              <article
                className="timeline-item interactive-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '70px 30px 230px 1fr',
                  gap: 18,
                  alignItems: 'start',
                  padding: '24px 20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 12,
                  position: 'relative',
                  border: '1px solid transparent',
                }}
              >
                <div
                  style={{
                    color:
                      'var(--theme-accent)',
                    fontFamily:
                      'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '.1em',
                  }}
                >
                  {String(index + 1).padStart(
                    2,
                    '0'
                  )}
                </div>

                <div
                  className="animate-status-beacon"
                  style={{
                    width: 12,
                    height: 12,
                    marginTop: 4,
                    borderRadius: '50%',
                    background:
                      'var(--theme-accent)',
                    boxShadow:
                      '0 0 0 4px var(--theme-background), 0 0 18px var(--theme-accent)',
                    position: 'relative',
                    zIndex: 2,
                  }}
                />

                <div>
                  <h3
                    style={{
                      color: 'var(--text)',
                      fontFamily:
                        'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 550,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </h3>

                  <div
                    style={{
                      marginTop: 8,
                      color:
                        'var(--theme-accent)',
                      fontFamily:
                        'var(--font-mono)',
                      fontSize: 9,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.date}
                  </div>
                </div>

                <p
                  style={{
                    color: 'var(--muted)',
                    fontSize: 14,
                    lineHeight: 1.75,
                  }}
                >
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        .timeline-line {
          position: absolute;
          left: 84px;
          top: 25px;
          bottom: 25px;
          width: 2px;
          overflow: hidden;
          background:
            linear-gradient(
              180deg,
              var(--theme-accent),
              color-mix(in srgb, var(--theme-primary) 30%, transparent)
            );
          box-shadow: 0 0 10px var(--theme-glow-color, rgba(255,255,255,0.2));
        }

        .timeline-item {
          transition: background 250ms ease, border-color 250ms ease, transform 250ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 250ms ease;
        }

        .timeline-item:hover {
          background: var(--theme-card-bg, color-mix(in srgb, var(--theme-surface) 80%, transparent)) !important;
          border-color: var(--theme-accent) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
        }

        @media (max-width: 800px) {
          .timeline-item {
            grid-template-columns:
              38px 25px 1fr !important;
          }

          .timeline-item > p {
            grid-column: 3;
            margin-top: -5px;
          }

          .timeline-line {
            left: 51px;
          }
        }

        @media (max-width: 500px) {
          .timeline-item {
            padding: 16px 10px !important;
            gap: 10px !important;
          }

          .timeline-line {
            left: 45px;
          }
        }
      `}</style>
    </section>
  );
};