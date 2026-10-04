import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { eventData } from '../../data/event';

const links = [
  ['About', '#about'],
  ['Tracks', '#tracks'],
  ['Prizes', '#prize'],
  ['Timeline', '#timeline'],
  ['Partners', '#sponsors'],
  ['Jury', '#organizers'],
  ['Rules', '#rules'],
  ['FAQ', '#faq'],
];

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '90px 0 25px',
        background:
          'linear-gradient(180deg, #050816, #030510)',
        borderTop:
          '1px solid var(--border-subtle)',
      }}
    >
      {/* Atmospheric glow */}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 500,
          height: 300,
          right: -150,
          bottom: -150,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59,130,246,.08), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container">
        <div
          className="footer-grid"
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns:
              '1.4fr .6fr .8fr',
            gap: 60,
            paddingBottom: 70,
          }}
        >
          {/* Brand */}

          <div>
            <img
              src="/assets/brand/resurraction-logo.png"
              alt="RESURRACTION"
              style={{
                width: 190,
                height: 'auto',
              }}
            />

            <p
              style={{
                maxWidth: 520,
                marginTop: 22,
                color: 'var(--muted)',
                fontSize: 14,
                lineHeight: 1.85,
              }}
            >
              A student hackathon organised
              by the Department of Computer
              Science & Engineering at{' '}
              {eventData.institution}.
            </p>

            <a
              href="#hero"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                marginTop: 25,
                color:
                  'var(--stellar-cyan)',
                fontSize: 11,
                fontFamily:
                  'var(--font-mono)',
                letterSpacing: '.08em',
                textTransform:
                  'uppercase',
              }}
            >
              Back to top
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Navigation */}

          <div>
            <h4
              style={{
                color: 'var(--text)',
                fontSize: 11,
                fontWeight: 650,
                letterSpacing: '.1em',
                textTransform:
                  'uppercase',
              }}
            >
              Explore
            </h4>

            <div
              style={{
                display: 'grid',
                gap: 11,
                marginTop: 18,
              }}
            >
              {links.map(
                ([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    style={{
                      color:
                        'var(--muted)',
                      fontSize: 13,
                      transition:
                        'color 180ms ease',
                    }}
                  >
                    {label}
                  </a>
                )
              )}
            </div>
          </div>

          {/* Event */}

          <div>
            <h4
              style={{
                color: 'var(--text)',
                fontSize: 11,
                fontWeight: 650,
                letterSpacing: '.1em',
                textTransform:
                  'uppercase',
              }}
            >
              Event
            </h4>

            <p
              style={{
                marginTop: 18,
                color: 'var(--muted)',
                fontSize: 13,
                lineHeight: 1.9,
              }}
            >
              {eventData.edition}
              <br />
              {eventData.venue}
              <br />
              More details coming soon.
            </p>

            <div
              style={{
                marginTop: 25,
                color:
                  'var(--muted-dark)',
                fontFamily:
                  'var(--font-mono)',
                fontSize: 9,
                lineHeight: 1.8,
              }}
            >
              SECTOR 01
              <br />
              RESURRECTION
            </div>
          </div>
        </div>

        {/* Bottom */}

        <div
          style={{
            borderTop:
              '1px solid var(--hairline)',
            paddingTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: 20,
            color:
              'var(--muted-dark)',
            fontFamily:
              'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '.04em',
          }}
        >
          <span>
            © {new Date().getFullYear()}{' '}
            RESURRECTION
          </span>

          <span>
            {eventData.department}
          </span>
        </div>
      </div>

      <style>{`
        footer a:hover {
          color: var(--stellar-cyan) !important;
        }

        @media (max-width: 750px) {
          .footer-grid {
            grid-template-columns:
              1fr 1fr !important;
            gap: 35px !important;
          }

          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 500px) {
          .footer-grid {
            grid-template-columns:
              1fr !important;
          }

          .footer-grid > div:first-child {
            grid-column: auto;
          }

          footer .container > div:last-child {
            align-items: flex-start !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </footer>
  );
};