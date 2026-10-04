import React, {
  useEffect,
  useState,
} from 'react';

import {
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const active = useScrollSection(
    NAV.map(([id]) => id),
    120
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,

        background: scrolled
          ? 'color-mix(in srgb, var(--theme-background) 94%, transparent)'
          : 'color-mix(in srgb, var(--theme-background) 75%, transparent)',

        borderBottom: '1px solid var(--theme-border)',

        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',

        transition: 'background 400ms ease, border-color 500ms ease',
      }}
    >
      <div
        className="container"
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Logo */}
        <a
          href="#hero"
          aria-label="RESURRACTION home"
          style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}
        >
          <img
            src="/assets/brand/resurraction-logo.png"
            alt="RESURRACTION"
            className="theme-logo"
            style={{ height: 27, width: 'auto', transition: 'transform 300ms ease, filter 300ms ease' }}
          />
        </a>

        {/* Desktop navigation */}
        <nav
          className="desktop-nav"
          style={{ flex: 1 }}
          aria-label="Main navigation"
        >
          <ul
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(10px, 1.6vw, 22px)',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {NAV.map(([id, label, href]) => {
              const isActive = active === id;

              return (
                <li key={id}>
                  <a
                    href={href}
                    className="nav-link"
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: 68,
                      color: isActive ? 'var(--theme-text)' : 'var(--theme-muted)',
                      fontSize: 11,
                      fontWeight: isActive ? 600 : 500,
                      letterSpacing: '.05em',
                      transition: 'color 220ms ease, transform 200ms ease',
                    }}
                  >
                    {label}

                    {isActive && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: 2,
                          background: 'var(--theme-accent)',
                          boxShadow: '0 0 12px var(--theme-accent)',
                          borderRadius: '2px 2px 0 0',
                          transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop CTA */}
        <a
          href="#about"
          className="header-launch interactive-button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--theme-background)',
            background: 'var(--theme-cta)',
            border: '1px solid var(--theme-cta)',
            padding: '9px 16px',
            borderRadius: 'var(--radius-xs)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            boxShadow: '0 0 15px color-mix(in srgb, var(--theme-cta) 35%, transparent)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--theme-cta-hover)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--theme-cta-hover)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 22px var(--theme-cta-hover)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--theme-cta)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--theme-cta)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px color-mix(in srgb, var(--theme-cta) 35%, transparent)';
          }}
        >
          Explore
          <ArrowUpRight size={14} />
        </a>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle interactive-button"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          style={{
            display: 'none',
            color: 'var(--theme-text)',
            background: 'color-mix(in srgb, var(--theme-surface) 60%, transparent)',
            border: '1px solid var(--theme-border)',
            borderRadius: 'var(--radius-sm)',
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 200ms ease, border-color 200ms ease, background 200ms ease',
          }}
        >
          <span style={{ display: 'flex', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </span>
        </button>
      </div>

      {open && (
        <nav
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {NAV.map(([id, label, href], index) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={href}
                onClick={() => setOpen(false)}
                className="mobile-nav-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 4px',
                  borderBottom: '1px solid var(--hairline)',
                  color: isActive ? 'var(--theme-accent)' : 'var(--theme-text)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '.03em',
                  animationDelay: `${index * 30}ms`,
                  transition: 'color 180ms ease, padding-left 200ms ease',
                }}
              >
                <span>{label}</span>

                {isActive ? (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--theme-accent)',
                      boxShadow: '0 0 10px var(--theme-accent)',
                    }}
                  />
                ) : (
                  <ArrowUpRight size={13} style={{ opacity: 0.35 }} />
                )}
              </a>
            );
          })}

          <div style={{ paddingTop: 18, paddingBottom: 6 }}>
            <a
              href="#about"
              onClick={() => setOpen(false)}
              className="interactive-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 18px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--theme-cta)',
                color: 'var(--theme-background)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                boxShadow: '0 0 18px color-mix(in srgb, var(--theme-cta) 40%, transparent)',
              }}
            >
              Explore Mission
              <ArrowUpRight size={15} />
            </a>
          </div>
        </nav>
      )}

      <style>{`
        .nav-link:hover {
          color: var(--theme-accent) !important;
          transform: translateY(-1px);
        }

        .mobile-nav {
          display: none;
          padding: 8px 24px 24px;
          background: color-mix(in srgb, var(--theme-background) 95%, var(--theme-surface) 5%);
          border-top: 1px solid var(--theme-border);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          animation: mobileDrawerSlideDown 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .mobile-nav-item:hover {
          padding-left: 6px !important;
          color: var(--theme-accent) !important;
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