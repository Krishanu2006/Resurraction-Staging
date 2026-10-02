import React from 'react';

export interface StatusBadgeProps {
  status: 'classified' | 'coming-soon' | 'incoming' | 'confirmed' | 'announced' | string;
  label?: string;
  variant?: 'peach' | 'crimson' | 'muted' | 'red';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  variant,
  size = 'md',
}) => {
  // Determine display label and styling variant if not provided
  let computedLabel = label;
  let computedVariant = variant;

  switch (status.toLowerCase()) {
    case 'classified':
      computedLabel = computedLabel || 'CLASSIFIED';
      computedVariant = computedVariant || 'red';
      break;
    case 'coming-soon':
      computedLabel = computedLabel || 'COMING SOON';
      computedVariant = computedVariant || 'peach';
      break;
    case 'incoming':
      computedLabel = computedLabel || 'INCOMING';
      computedVariant = computedVariant || 'peach';
      break;
    case 'confirmed':
      computedLabel = computedLabel || 'CONFIRMED';
      computedVariant = computedVariant || 'crimson';
      break;
    case 'announced':
      computedLabel = computedLabel || 'ANNOUNCED';
      computedVariant = computedVariant || 'peach';
      break;
    default:
      computedLabel = computedLabel || status.toUpperCase();
      computedVariant = computedVariant || 'peach';
  }

  const colorStyles: Record<string, { bg: string; border: string; text: string; dot: string; glow: string }> = {
    peach: {
      bg: 'rgba(242, 177, 138, 0.08)',
      border: 'rgba(242, 177, 138, 0.28)',
      text: 'var(--brand-peach)',
      dot: 'var(--brand-peach)',
      glow: '0 0 8px rgba(242, 177, 138, 0.6)',
    },
    crimson: {
      bg: 'rgba(142, 6, 23, 0.16)',
      border: 'rgba(142, 6, 23, 0.45)',
      text: '#FF8A9B',
      dot: '#E51B32',
      glow: '0 0 8px rgba(229, 27, 50, 0.6)',
    },
    red: {
      bg: 'rgba(229, 27, 50, 0.12)',
      border: 'rgba(229, 27, 50, 0.4)',
      text: '#FF7D8C',
      dot: 'var(--red-hot)',
      glow: '0 0 10px rgba(229, 27, 50, 0.7)',
    },
    muted: {
      bg: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.12)',
      text: 'var(--muted)',
      dot: 'var(--muted)',
      glow: 'none',
    },
  };

  const style = colorStyles[computedVariant || 'peach'];
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? '0.375rem' : '0.5rem',
        padding: isSm ? '0.2rem 0.625rem' : '0.35rem 0.875rem',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-sm)',
        color: style.text,
        fontFamily: 'var(--font-mono)',
        fontSize: isSm ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      <span
        className="animate-status-beacon"
        style={{
          width: isSm ? '5px' : '7px',
          height: isSm ? '5px' : '7px',
          borderRadius: '50%',
          backgroundColor: style.dot,
          boxShadow: style.glow,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      {computedLabel}
    </span>
  );
};
