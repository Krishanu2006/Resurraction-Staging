import React from 'react';
import { ChevronDown } from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import {
  rulesData,
  rulesOverview,
} from '../../data/rules';

export const RulesSection: React.FC = () => {
  return (
    <section id="rules" className="section">
      <div className="container">
        <Reveal>
          <SectionHeading
            code="07 — Rules"
            title="A few things worth knowing."
            subtitle={rulesOverview.description}
          />
        </Reveal>

        <div
          className="rules-panel"
          style={{
            maxWidth: 1050,
            margin: '0 auto',
            borderTop:
              '1px solid var(--border-subtle)',
          }}
        >
          {rulesData.map(
            (category, index) => (
              <Reveal
                key={category.id}
                delay={index * 40}
              >
                <details
                  className="rule-item"
                  style={{
                    borderBottom:
                      '1px solid var(--hairline)',
                  }}
                >
                  <summary
                    style={{
                      listStyle: 'none',
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateColumns:
                        '70px 1fr 25px',
                      gap: 16,
                      alignItems: 'center',
                      padding: '24px 0',
                    }}
                  >
                    <span
                      style={{
                        color:
                          'var(--stellar-cyan)',
                        fontFamily:
                          'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '.08em',
                      }}
                    >
                      {category.code}
                    </span>

                    <span>
                      <strong
                        style={{
                          display: 'block',
                          color:
                            'var(--text)',
                          fontFamily:
                            'var(--font-display)',
                          fontSize: 17,
                          fontWeight: 550,
                        }}
                      >
                        {category.category}
                      </strong>

                      <small
                        style={{
                          display: 'block',
                          marginTop: 5,
                          color:
                            'var(--muted)',
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        {category.summary}
                      </small>
                    </span>

                    <ChevronDown
                      className="rule-chevron"
                      size={17}
                      color="var(--muted)"
                    />
                  </summary>

                  <div
                    style={{
                      padding:
                        '0 0 22px 70px',
                      maxWidth: 850,
                    }}
                  >
                    {category.rules.map(
                      (rule) => (
                        <div
                          key={rule.id}
                          style={{
                            padding:
                              '15px 0',
                            borderTop:
                              '1px solid var(--hairline-soft)',
                          }}
                        >
                          <strong
                            style={{
                              color:
                                'var(--text)',
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {rule.title}
                          </strong>

                          <p
                            style={{
                              marginTop: 6,
                              color:
                                'var(--muted)',
                              fontSize: 13,
                              lineHeight: 1.75,
                            }}
                          >
                            {rule.description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </details>
              </Reveal>
            )
          )}
        </div>
      </div>

      <style>{`
        .rule-item summary::-webkit-details-marker {
          display: none;
        }

        .rule-item[open] .rule-chevron {
          transform: rotate(180deg);
          color: var(--stellar-cyan);
        }

        .rule-chevron {
          transition:
            transform 180ms ease,
            color 180ms ease;
        }

        @media (max-width: 650px) {
          .rule-item summary {
            grid-template-columns:
              45px 1fr 20px !important;
          }

          .rule-item summary > span:nth-child(2) {
            padding-right: 5px;
          }

          .rule-item > div {
            padding-left: 45px !important;
          }
        }
      `}</style>
    </section>
  );
};