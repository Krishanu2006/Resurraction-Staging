import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { faqData } from '../../data/faq';

export const FAQSection: React.FC = () => {
  const [open, setOpen] =
    useState<string | null>(null);

  return (
    <section id="faq" className="section">
      <div className="container">
        <Reveal>
          <SectionHeading
            code="08 — FAQ"
            title="Questions, answered."
            subtitle="A few things people usually want to know before joining. More information will be added as the event gets closer."
          />
        </Reveal>

        <div
          style={{
            maxWidth: 950,
            margin: '0 auto',
            borderTop:
              '1px solid var(--border-subtle)',
          }}
        >
          {faqData.map((item, index) => {
            const active =
              open === item.id;

            return (
              <Reveal
                key={item.id}
                delay={index * 35}
              >
                <article
                  style={{
                    borderBottom:
                      '1px solid var(--hairline)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpen(
                        active
                          ? null
                          : item.id
                      )
                    }
                    aria-expanded={active}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns:
                        '50px 1fr 22px',
                      gap: 18,
                      alignItems: 'center',
                      padding: '23px 0',
                      textAlign: 'left',
                      color: active
                        ? 'var(--stellar-cyan)'
                        : 'var(--text)',
                      background:
                        'transparent',
                      border: 0,
                    }}
                  >
                    <span
                      style={{
                        color:
                          'var(--muted-dark)',
                        fontFamily:
                          'var(--font-mono)',
                        fontSize: 9,
                      }}
                    >
                      {String(
                        index + 1
                      ).padStart(2, '0')}
                    </span>

                    <span
                      style={{
                        fontFamily:
                          'var(--font-display)',
                        fontSize:
                          'clamp(1rem, 1.8vw, 1.2rem)',
                        fontWeight: 550,
                      }}
                    >
                      {item.question}
                    </span>

                    <ChevronDown
                      size={17}
                      color={
                        active
                          ? 'var(--stellar-cyan)'
                          : 'var(--muted)'
                      }
                      style={{
                        transform: active
                          ? 'rotate(180deg)'
                          : 'none',
                        transition:
                          'transform 180ms ease',
                      }}
                    />
                  </button>

                  {active && (
                    <div
                      style={{
                        padding:
                          '0 42px 25px 68px',
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 1,
                          marginBottom: 14,
                          background:
                            'var(--stellar-cyan)',
                        }}
                      />

                      <p
                        style={{
                          maxWidth: 760,
                          color:
                            'var(--muted)',
                          fontSize: 14,
                          lineHeight: 1.85,
                        }}
                      >
                        {item.answer}
                      </p>
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          #faq button {
            grid-template-columns:
              38px 1fr 20px !important;
            gap: 12px !important;
          }

          #faq article > div {
            padding-left: 50px !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
    </section>
  );
};