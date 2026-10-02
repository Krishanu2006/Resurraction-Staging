import React from 'react';

export const MissionIntro: React.FC = () => {
  return (
    <div
      role="banner"
      aria-label="Mission Telemetry"
      style={{
        backgroundColor: 'rgba(9, 3, 5, 0.85)',
        borderBottom: '1px solid var(--border-panel)',
        padding: '0.4rem 1.5rem',
        fontSize: '0.6875rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--muted)',
        letterSpacing: '0.08em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          className="animate-status-beacon"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-peach)',
            display: 'inline-block',
          }}
          aria-hidden="true"
        />
        <span>TELEMETRY: CSE-IEM-KOLKATA // ACTIVE</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <span className="telemetry-frequency">
          COSMIC FREQUENCY: 1420.405 MHz
        </span>
        <span style={{ color: 'var(--brand-peach)', fontWeight: 600 }}>
          PHASE: PRE-ANNOUNCEMENT
        </span>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .telemetry-frequency {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
