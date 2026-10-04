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

export const themePalettes: Record<
  ThemeId,
  ThemePalette
> = {
  'tau-ceti': {
    primary: '#9adf68',
    secondary: '#d6a43a',
    accent: '#ff8b38',
    background: '#020604',
    surface: '#09120c',
    text: '#f4f7e7',
    muted: '#a6b09c',
    border: '#425a3a',
  },

  miller: {
    primary: '#78c9c0',
    secondary: '#9fb9c9',
    accent: '#d9edf0',
    background: '#02080a',
    surface: '#071418',
    text: '#e9f7f5',
    muted: '#9ab4b2',
    border: '#315552',
  },

  pandora: {
    primary: '#78d8b1',
    secondary: '#6ea4d8',
    accent: '#b7f1d2',
    background: '#020709',
    surface: '#071512',
    text: '#edf8f0',
    muted: '#9db9aa',
    border: '#2f5d4b',
  },

  kepler: {
    primary: '#ffb45e',
    secondary: '#d66a3d',
    accent: '#ffd48b',
    background: '#090402',
    surface: '#160b07',
    text: '#fff2e6',
    muted: '#b9a296',
    border: '#633b2b',
  },
};