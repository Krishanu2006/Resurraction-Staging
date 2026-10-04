export type ThemeId =
  | 'tau-ceti'
  | 'miller'
  | 'pandora'
  | 'kepler';

export type ThemePalette = {
  primary: string;
  secondary: string;
  accent: string;
  cta: string;
  ctaHover: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  gradient: string;
  glow: string;
  glowColor: string;
  cardBg: string;
  cardBorder: string;
};

export const themePalettes: Record<
  ThemeId,
  ThemePalette
> = {
  'tau-ceti': {
    primary: '#e5a93c',
    secondary: '#9e681c',
    accent: '#ffd778',
    cta: '#e5a93c',
    ctaHover: '#f5ba4e',
    background: '#0c0a06',
    surface: '#18130a',
    text: '#fdf8eb',
    muted: '#c2b193',
    border: '#5e4823',
    gradient: 'linear-gradient(135deg, #e5a93c 0%, #9e681c 100%)',
    glow: '0 0 35px rgba(229, 169, 60, 0.35)',
    glowColor: 'rgba(229, 169, 60, 0.4)',
    cardBg: 'rgba(24, 19, 10, 0.75)',
    cardBorder: 'rgba(229, 169, 60, 0.25)',
  },

  miller: {
    primary: '#e2e8f0',
    secondary: '#475569',
    accent: '#ffffff',
    cta: '#e2e8f0',
    ctaHover: '#ffffff',
    background: '#07090e',
    surface: '#111622',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: '#334155',
    gradient: 'linear-gradient(135deg, #e2e8f0 0%, #475569 100%)',
    glow: '0 0 35px rgba(226, 232, 240, 0.3)',
    glowColor: 'rgba(226, 232, 240, 0.35)',
    cardBg: 'rgba(17, 22, 34, 0.75)',
    cardBorder: 'rgba(226, 232, 240, 0.25)',
  },

  pandora: {
    primary: '#00d2ff',
    secondary: '#0052cc',
    accent: '#38bdf8',
    cta: '#00d2ff',
    ctaHover: '#38d9ff',
    background: '#030a14',
    surface: '#071526',
    text: '#e0f7ff',
    muted: '#8cb8d0',
    border: '#1c4570',
    gradient: 'linear-gradient(135deg, #00d2ff 0%, #0052cc 100%)',
    glow: '0 0 35px rgba(0, 210, 255, 0.35)',
    glowColor: 'rgba(0, 210, 255, 0.4)',
    cardBg: 'rgba(7, 21, 38, 0.75)',
    cardBorder: 'rgba(0, 210, 255, 0.25)',
  },

  kepler: {
    primary: '#ff3344',
    secondary: '#8a1825',
    accent: '#ff7a59',
    cta: '#ff3344',
    ctaHover: '#ff5262',
    background: '#0e0305',
    surface: '#1a080c',
    text: '#fff0f2',
    muted: '#c99b9f',
    border: '#6e2028',
    gradient: 'linear-gradient(135deg, #ff3344 0%, #8a1825 100%)',
    glow: '0 0 35px rgba(255, 51, 68, 0.35)',
    glowColor: 'rgba(255, 51, 68, 0.4)',
    cardBg: 'rgba(26, 8, 12, 0.75)',
    cardBorder: 'rgba(255, 51, 68, 0.25)',
  },
};