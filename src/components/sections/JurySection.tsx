import React from 'react';
import { UsersRound } from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import {
  juryMembersData,
  juryOverview,
} from '../../data/jury';

export const JurySection: React.FC = () => {
  return (
    <section id="organizers" className="section">
      <div className="container">
        <Reveal>
          <SectionHeading
            code="06 — Jury"
            title="The people who will look at the work."
            subtitle={juryOverview.description}
          />
        </Reveal>

        <div
          className="jury-grid"
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4, 1fr)',
            gap: 1,
            background: 'var(--theme-card-border, var(--hairline))',
          }}
        >
          {juryMembersData.map(
            (member, index) => (
              <Reveal
                key={member.id}
                delay={index * 60}
              >
                <article
                  className="jury-card"
                  style={{
                    minHeight: 300,
                    padding: 28,
                    background:
                      'var(--theme-card-bg, var(--surface-1))',
                    backdropFilter:
                      'blur(12px)',
                    transition:
                      'background var(--transition-normal)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <UsersRound
                      size={21}
                      strokeWidth={1.3}
                      color="var(--theme-accent)"
                    />

                    <span
                      style={{
                        color:
                          'var(--muted-dark)',
                        fontFamily:
                          'var(--font-mono)',
                        fontSize: 9,
                      }}
                    >
                      {String(index + 1).padStart(
                        2,
                        '0'
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 50,
                      color:
                        'var(--muted-dark)',
                      fontFamily:
                        'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '.1em',
                    }}
                  >
                    {member.seatCode}
                  </div>

                  <h3
                    style={{
                      marginTop: 14,
                      color: 'var(--text)',
                      fontFamily:
                        'var(--font-display)',
                      fontSize: 20,
                      fontWeight: 550,
                    }}
                  >
                    {member.name}
                  </h3>

                  <p
                    style={{
                      marginTop: 8,
                      color: 'var(--muted)',
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    {member.role}
                  </p>

                  <p
                    style={{
                      marginTop: 5,
                      color:
                        'var(--muted-dark)',
                      fontSize: 11,
                    }}
                  >
                    {member.organization}
                  </p>
                </article>
              </Reveal>
            )
          )}
        </div>
      </div>

      <style>{`
        .jury-card:hover {
          background: var(--surface-2) !important;
        }

        @media (max-width: 900px) {
          .jury-grid {
            grid-template-columns:
              repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 520px) {
          .jury-grid {
            grid-template-columns:
              1fr !important;
          }
        }
      `}</style>
    </section>
  );
};