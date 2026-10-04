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
          />

          {timelineData.map((item, index) => (
            <Reveal
              key={item.id}
              delay={index * 55}
            >
              <article
                className="timeline-item"
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '70px 30px 230px 1fr',
                  gap: 18,
                  alignItems: 'start',
                  padding: '30px 0',
                  position: 'relative',
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
                  style={{
                    width: 10,
                    height: 10,
                    marginTop: 4,
                    borderRadius: '50%',
                    background:
                      'var(--theme-accent)',
                    boxShadow:
                      '0 0 0 5px var(--theme-background), 0 0 18px var(--theme-glow-color)',
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
          width: 1px;
          background:
            linear-gradient(
              180deg,
              rgba(34,211,238,.42),
              rgba(96,165,250,.08)
            );
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
      `}</style>
    </section>
  );
};