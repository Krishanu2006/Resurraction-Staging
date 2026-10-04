import React from 'react';

interface SectionHeadingProps {
  code: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  code,
  title,
  subtitle,
  align = 'left',
  className = '',
}) => {
  const isCentered = align === 'center';

  /*
   * Example:
   *
   * code = "01 — ABOUT"
   *
   * This is intentionally treated as editorial metadata rather
   * than a futuristic HUD label.
   */

  const parts = code.split('—');

  const number = parts[0]?.trim() || '';
  const label = parts.slice(1).join('—').trim();

  return (
    <header
      className={`section-heading ${className}`}
      style={{
        width: '100%',
        maxWidth: '1100px',
        marginLeft: isCentered ? 'auto' : undefined,
        marginRight: isCentered ? 'auto' : undefined,
        marginBottom: '5rem',
        textAlign: isCentered ? 'center' : 'left',
      }}
    >
      {/* =====================================================
          SECTION META
          ===================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCentered
            ? 'center'
            : 'flex-start',

          gap: '0.75rem',

          marginBottom: '1.5rem',

          color: 'var(--muted)',

          fontFamily: 'var(--font-mono)',

          fontSize: '0.68rem',

          fontWeight: 500,

          letterSpacing: '0.12em',

          textTransform: 'uppercase',
        }}
      >
        {/* Number */}

        <span
          style={{
            color: 'var(--stellar-cyan)',
          }}
        >
          {number}
        </span>

        {/* Thin divider */}

        <span
          aria-hidden="true"
          style={{
            width: '36px',
            height: '1px',

            background:
              'rgba(96, 165, 250, 0.35)',
          }}
        />

        {/* Section name */}

        {label && (
          <span
            style={{
              color: 'var(--muted)',
            }}
          >
            {label}
          </span>
        )}
      </div>


      {/* =====================================================
          MAIN TITLE
          ===================================================== */}

      <h2
        style={{
          maxWidth: isCentered
            ? '900px'
            : '950px',

          margin:
            isCentered
              ? '0 auto'
              : '0',

          color: 'var(--text)',

          fontFamily:
            "'Nasalization', var(--font-display), sans-serif",

          fontSize:
            'clamp(2.5rem, 5.5vw, 5.4rem)',

          fontWeight: 600,

          lineHeight: 0.98,

          letterSpacing: '-0.055em',
        }}
      >
        {title}
      </h2>


      {/* =====================================================
          SUBTITLE
          ===================================================== */}

      {subtitle && (
        <p
          style={{
            maxWidth: '680px',

            marginTop: '1.5rem',

            marginLeft:
              isCentered
                ? 'auto'
                : undefined,

            marginRight:
              isCentered
                ? 'auto'
                : undefined,

            color: 'var(--muted)',

            fontFamily:
              'var(--font-body)',

            fontSize:
              'clamp(0.95rem, 1.4vw, 1.05rem)',

            lineHeight: 1.75,

            fontWeight: 400,
          }}
        >
          {subtitle}
        </p>
      )}


      {/* =====================================================
          BOTTOM INFORMATION LINE
          ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          width: isCentered
            ? '100%'
            : '100%',

          height: '1px',

          marginTop: '2.5rem',

          background:
            'linear-gradient(90deg, rgba(96,165,250,0.28), rgba(96,165,250,0.08), transparent)',
        }}
      />
    </header>
  );
};