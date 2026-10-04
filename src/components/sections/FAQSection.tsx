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
                  className="faq-item"
                  style={{
                    borderBottom:
                      '1px solid var(--border-subtle)',
                    marginBottom: 0,
                    padding: '0 8px',
                    background: 'transparent',
                    transition: 'background 250ms ease, border-color 250ms ease',
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
                        ? 'var(--theme-accent)'
                        : 'var(--text)',
                      background:
                        'transparent',
                      border: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        color:
                          'var(--theme-accent)',
                        fontFamily:
                          'var(--font-mono)',
                        fontSize: 9,
                        opacity: active ? 1 : 0.6,
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
                          ? 'var(--theme-accent)'
                          : 'var(--muted)'
                      }
                      style={{
                        transform: active
                          ? 'rotate(180deg)'
                          : 'none',
                        transition:
                          'transform 250ms ease, color 250ms ease',
                      }}
                    />
                  </button>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateRows: active ? '1fr' : '0fr',
                      transition: 'grid-template-rows 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ minHeight: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          padding: '0 42px 25px 68px',
                          opacity: active ? 1 : 0,
                          transform: active ? 'translateY(0)' : 'translateY(-6px)',
                          transition: 'opacity 250ms ease 50ms, transform 280ms cubic-bezier(0.16, 1, 0.3, 1) 50ms',
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 1,
                            marginBottom: 14,
                            background:
                              'var(--theme-accent)',
                            boxShadow: '0 0 10px var(--theme-accent)',
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
                    </div>
                  </div>
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