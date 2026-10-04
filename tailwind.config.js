/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--theme-border, rgba(255, 255, 255, 0.1))',
        input: 'var(--theme-border, rgba(255, 255, 255, 0.15))',
        ring: 'var(--theme-accent, #00d2ff)',
        background: 'var(--theme-background, #050816)',
        foreground: 'var(--theme-text, #f8fafc)',
        primary: {
          DEFAULT: 'var(--theme-primary, #3b82f6)',
          foreground: 'var(--theme-text, #ffffff)',
        },
        secondary: {
          DEFAULT: 'var(--theme-secondary, #1e293b)',
          foreground: 'var(--theme-text, #f8fafc)',
        },
        accent: {
          DEFAULT: 'var(--theme-accent, #38bdf8)',
          foreground: 'var(--theme-text, #ffffff)',
        },
        muted: {
          DEFAULT: 'var(--theme-surface, #0f172a)',
          foreground: 'var(--theme-muted, #94a3b8)',
        },
        card: {
          DEFAULT: 'var(--theme-card-bg, rgba(15, 23, 42, 0.75))',
          foreground: 'var(--theme-text, #f8fafc)',
        },
        popover: {
          DEFAULT: 'var(--theme-card-bg, rgba(15, 23, 42, 0.9))',
          foreground: 'var(--theme-text, #f8fafc)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg, 12px)',
        md: 'var(--radius-md, 8px)',
        sm: 'var(--radius-sm, 6px)',
      },
      fontFamily: {
        sans: ["'Neue Stance'", 'sans-serif'],
        mono: ["'Space Mono'", 'monospace'],
        nasalization: ["'Nasalization'", 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
