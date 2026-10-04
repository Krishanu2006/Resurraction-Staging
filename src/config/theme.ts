export type ThemeId =
  | 'tau-ceti'
  | 'miller'
  | 'pandora'
  | 'kepler';

export type ThemePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

export const themePalettes: Record<ThemeId, ThemePalette> = {
  'tau-ceti': {
    primary: '#6B8E23',
    secondary: '#D97706',
    accent: '#E6E67A',
    background: '#10140A',
    surface: '#1A1F0E',
    text: '#F4F1D0',
    muted: '#A9A77A',
    border: '#66752A',
  },

  miller: {
    primary: '#64748B',
    secondary: '#3B82F6',
    accent: '#BFDBFE',
    background: '#080D16',
    surface: '#111827',
    text: '#E5EEF8',
    muted: '#94A3B8',
    border: '#334155',
  },

  pandora: {
    primary: '#2563EB',
    secondary: '#60A5FA',
    accent: '#E0F2FE',
    background: '#07111F',
    surface: '#0C1D32',
    text: '#F0F9FF',
    muted: '#93C5FD',
    border: '#2563EB',
  },

  kepler: {
    primary: '#991B1B',
    secondary: '#DC2626',
    accent: '#F97316',
    background: '#160706',
    surface: '#2A0D0B',
    text: '#FFF1EC',
    muted: '#FCA5A5',
    border: '#7F1D1D',
  },
};