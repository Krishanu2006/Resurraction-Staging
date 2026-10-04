import React, {
  useEffect,
  useState,
} from 'react';

import {
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useScrollSection } from '../../hooks/useScrollSection';

const NAV = [
  ['about', 'About', '#about'],
  ['tracks', 'Tracks', '#tracks'],
  ['prize', 'Prizes', '#prize'],
  ['timeline', 'Timeline', '#timeline'],
  ['sponsors', 'Partners', '#sponsors'],
  ['organizers', 'Jury', '#organizers'],
  ['rules', 'Rules', '#rules'],
  ['faq', 'FAQ', '#faq'],
];

export const Header: React.FC = () => {
  const [open, setOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const active = useScrollSection(
    NAV.map(([id]) => id),
    120
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 30
      );
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      );
  }, []);

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,

        background: scrolled
          ? 'color-mix(in srgb, var(--theme-background) 88%, transparent)'
          : 'color-mix(in srgb, var(--theme-background) 65%, transparent)',

        borderBottom:
          '1px solid var(--theme-border)',

        backdropFilter:
          'blur(18px)',

        WebkitBackdropFilter:
          'blur(18px)',

        transition:
          'background 220ms ease',
      }}
    >
      <div
        className="container"
        style={{
          height:
            'var(--header-height)',

          display: 'flex',

          alignItems: 'center',

          gap: 30,
        }}
      >
        {/* Logo */}

        <a
          href="#hero"
          aria-label="RESURRACTION home"
          style={{
            flexShrink: 0,
          }}
        >
          <img
            src="/assets/brand/resurraction-logo.png"
            alt="RESURRACTION"
            style={{
              height: 27,
              width: 'auto',
            }}
          />
        </a>

        {/* Desktop navigation */}

        <nav
          className="desktop-nav"
          style={{
            flex: 1,
          }}
          aria-label="Main navigation"
        >
          <ul
            style={{
              display: 'flex',
              justifyContent:
                'center',
              alignItems: 'center',
              gap:
                'clamp(14px, 2vw, 28px)',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {NAV.map(
              ([id, label, href]) => {
                const isActive =
                  active === id;

                return (
                  <li key={id}>
                    <a
                      href={href}
                      className="nav-link"
                      style={{
                        position:
                          'relative',
                        display:
                          'inline-flex',
                        alignItems:
                          'center',
                        height: 68,
                        color:
                          isActive
                            ? 'var(--text)'
                            : 'var(--muted)',
                        fontSize: 11,
                        letterSpacing:
                          '.04em',
                        transition:
                          'color 180ms ease',
                      }}
                    >
                      {label}

                      {isActive && (
                        <span
                          aria-hidden="true"
                          style={{
                            position:
                              'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 2,
                            background:
                              'var(--theme-accent)',
                            boxShadow:
                              '0 0 10px var(--theme-glow-color)',
                          }}
                        />
                      )}
                    </a>
                  </li>
                );
              }
            )}
          </ul>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <Button
            asChild
            variant="default"
            size="sm"
            className="font-mono text-[11px] uppercase tracking-wider font-bold shadow-[var(--theme-glow)]"
          >
            <a href="#about" className="inline-flex items-center gap-1.5">
              Explore
              <ArrowUpRight size={14} />
            </a>
          </Button>
        </div>

        {/* Mobile */}
        <Button
          variant="outline"
          size="icon"
          className="mobile-toggle flex md:hidden items-center justify-center border-[var(--theme-card-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] hover:text-[var(--theme-accent)]"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {open && (
        <nav
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {NAV.map(
            ([id, label, href]) => (
              <a
                key={id}
                href={href}
                onClick={() =>
                  setOpen(false)
                }
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  padding:
                    '15px 0',
                  borderBottom:
                    '1px solid var(--theme-border)',
                  color:
                    active === id
                      ? 'var(--theme-accent)'
                      : 'var(--text)',
                  fontSize: 15,
                }}
              >
                <span>{label}</span>

                {active === id && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius:
                        '50%',
                      background:
                        'var(--theme-accent)',
                      boxShadow:
                        '0 0 10px var(--theme-glow-color)',
                    }}
                  />
                )}
              </a>
            )
          )}
        </nav>
      )}

      <style>{`
        .nav-link:hover {
          color: var(--theme-accent) !important;
        }

        .mobile-nav {
          display: none;
          padding: 8px 22px 22px;
          background: color-mix(in srgb, var(--theme-background) 95%, transparent);
          border-top: 1px solid var(--theme-border);
        }

        @media (max-width: 900px) {
          .desktop-nav,
          .header-launch {
            display: none !important;
          }

          .mobile-toggle {
            display: flex !important;
            margin-left: auto;
          }

          .mobile-nav {
            display: grid;
          }
        }
      `}</style>
    </header>
  );
};