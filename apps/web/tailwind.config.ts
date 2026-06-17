import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        psl: {
          /* ── Brand primaries ── */
          navy:      '#1b3a6b',   // Primary navy
          midnight:  '#0d1b2e',   // Deep immersive header
          gold:      '#ffd700',   // Action gold
          'gold-dk': '#c9a800',   // Darker gold for text on light
          green:     '#00843d',   // PSL green
          red:       '#e63946',   // Alert / danger
          dark:      '#0f1117',   // True dark surface

          /* ── Surfaces ── */
          surface:   '#f5f7fb',   // Off-white content surface
          card:      '#ffffff',   // Card white
          'card-dk': '#141929',   // Dark card

          /* ── Text ── */
          muted:     '#6b7280',   // Muted body text

          /* ── States ── */
          live:      '#ef4444',   // Live red
          'live-dk': '#b91c1c',
          success:   '#16a34a',
          warning:   '#d97706',
          disabled:  '#9ca3af',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        /* Display — match headlines, scores */
        'display-2xl': ['4rem',   { lineHeight: '1',    fontWeight: '900', letterSpacing: '-0.02em' }],
        'display-xl':  ['3rem',   { lineHeight: '1.05', fontWeight: '900', letterSpacing: '-0.02em' }],
        'display-lg':  ['2.25rem',{ lineHeight: '1.1',  fontWeight: '800', letterSpacing: '-0.015em' }],
        'display-md':  ['1.75rem',{ lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.01em' }],
        'display-sm':  ['1.375rem',{ lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.005em' }],
        /* Body */
        'body-lg':     ['1.0625rem',{ lineHeight: '1.6', fontWeight: '400' }],
        'body-md':     ['0.9375rem',{ lineHeight: '1.55', fontWeight: '400' }],
        'body-sm':     ['0.8125rem',{ lineHeight: '1.5',  fontWeight: '400' }],
        /* Label / meta */
        'label-lg':    ['0.8125rem',{ lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.04em' }],
        'label-md':    ['0.6875rem',{ lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.06em' }],
        'label-sm':    ['0.625rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.08em' }],
        /* Stat numbers */
        'stat-xl':     ['3.5rem',  { lineHeight: '1',    fontWeight: '900' }],
        'stat-lg':     ['2.25rem', { lineHeight: '1',    fontWeight: '900' }],
        'stat-md':     ['1.5rem',  { lineHeight: '1',    fontWeight: '800' }],
      },
      borderRadius: {
        'card':  '16px',
        'card-sm': '12px',
        'pill':  '100px',
      },
      boxShadow: {
        'card':     '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md':  '0 4px 12px 0 rgb(0 0 0 / 0.08)',
        'card-lg':  '0 8px 24px 0 rgb(0 0 0 / 0.12)',
        'card-xl':  '0 16px 48px 0 rgb(0 0 0 / 0.16)',
        'glow-gold': '0 0 24px rgb(255 215 0 / 0.35)',
        'glow-green': '0 0 24px rgb(0 132 61 / 0.35)',
        'inner-top': 'inset 0 1px 0 0 rgb(255 255 255 / 0.12)',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'live-pulse': 'live-pulse 1.5s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
        'slide-up':   'slide-up 0.3s ease-out both',
        'fade-in':    'fade-in 0.2s ease-out both',
        float:        'float 3s ease-in-out infinite',
      },
      backgroundImage: {
        'pitch': 'repeating-linear-gradient(180deg, #1a7a3e 0px, #1a7a3e 36px, #16703a 36px, #16703a 72px)',
        'pitch-dark': 'repeating-linear-gradient(180deg, #145c2e 0px, #145c2e 36px, #115228 36px, #115228 72px)',
        'navy-gradient': 'linear-gradient(135deg, #0d1b2e 0%, #1b3a6b 100%)',
        'gold-gradient': 'linear-gradient(135deg, #c9a800 0%, #ffd700 60%, #ffe44d 100%)',
        'shimmer-base': 'linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 0.1) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
