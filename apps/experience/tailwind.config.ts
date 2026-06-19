import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        exp: {
          /* ── Darks (dark sections, game modules, nav) ── */
          void:      '#060d19',   // Deepest dark
          navy:      '#0d1b2e',   // Primary dark surface
          'navy-2':  '#1b3a6b',   // Lighter navy
          ink:       '#141929',   // Dark card surface

          /* ── Brand accents ── */
          gold:      '#e6aa00',   // Refined PSL gold (readable)
          'gold-2':  '#ffd700',   // Bright gold (large type only)
          green:     '#00843d',   // Football green
          'green-2': '#006631',   // Deep green accent
          blue:      '#1e3a8a',   // Tournament blue

          /* ── States ── */
          live:      '#ef4444',   // Live match red
          'live-dk': '#b91c1c',
          success:   '#16a34a',
          warning:   '#d97706',

          /* ── Light surfaces (editorial, table) ── */
          surface:   '#f8f9fb',   // Editorial off-white
          card:      '#ffffff',
          muted:     '#6b7280',   // Body text muted
          border:    '#e5e7eb',   // Light border
          'border-dk': 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans:    ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4rem',    { lineHeight: '1',    fontWeight: '900', letterSpacing: '-0.025em' }],
        'display-xl':  ['3rem',    { lineHeight: '1.05', fontWeight: '900', letterSpacing: '-0.02em'  }],
        'display-lg':  ['2.25rem', { lineHeight: '1.1',  fontWeight: '800', letterSpacing: '-0.015em' }],
        'display-md':  ['1.75rem', { lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.01em'  }],
        'display-sm':  ['1.375rem',{ lineHeight: '1.2',  fontWeight: '700', letterSpacing: '-0.005em' }],
        'body-lg':     ['1.0625rem',{ lineHeight: '1.6',  fontWeight: '400' }],
        'body-md':     ['0.9375rem',{ lineHeight: '1.55', fontWeight: '400' }],
        'body-sm':     ['0.8125rem',{ lineHeight: '1.5',  fontWeight: '400' }],
        'label-lg':    ['0.8125rem',{ lineHeight: '1.2',  fontWeight: '600', letterSpacing: '0.04em' }],
        'label-md':    ['0.6875rem',{ lineHeight: '1.2',  fontWeight: '700', letterSpacing: '0.06em' }],
        'label-sm':    ['0.625rem', { lineHeight: '1.2',  fontWeight: '700', letterSpacing: '0.08em' }],
        'score-xl':    ['5rem',    { lineHeight: '1',    fontWeight: '900', letterSpacing: '-0.03em'  }],
        'score-lg':    ['3.5rem',  { lineHeight: '1',    fontWeight: '900', letterSpacing: '-0.02em'  }],
        'score-md':    ['2.25rem', { lineHeight: '1',    fontWeight: '900' }],
        'stat-xl':     ['3.5rem',  { lineHeight: '1',    fontWeight: '900' }],
        'stat-md':     ['1.5rem',  { lineHeight: '1',    fontWeight: '800' }],
      },
      borderRadius: {
        'card':    '14px',
        'card-sm': '10px',
        'card-xs': '8px',
        'pill':    '100px',
      },
      boxShadow: {
        'card':        '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md':     '0 4px 12px 0 rgb(0 0 0 / 0.08)',
        'card-lg':     '0 8px 24px 0 rgb(0 0 0 / 0.12)',
        'card-xl':     '0 16px 48px 0 rgb(0 0 0 / 0.18)',
        'glow-gold':   '0 0 32px rgb(230 170 0 / 0.4)',
        'glow-green':  '0 0 32px rgb(0 132 61 / 0.4)',
        'inner-top':   'inset 0 1px 0 0 rgb(255 255 255 / 0.1)',
        'inner-glow':  'inset 0 0 80px rgb(230 170 0 / 0.06)',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)'    },
          '50%':      { opacity: '0.45', transform: 'scale(0.82)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ticker-left': {
          '0%':   { transform: 'translateX(0)'    },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'live-pulse':  'live-pulse 1.4s ease-in-out infinite',
        shimmer:       'shimmer 2s linear infinite',
        'slide-up':    'slide-up 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':     'fade-in 0.25s ease-out both',
        'ticker-left': 'ticker-left 28s linear infinite',
      },
      backgroundImage: {
        'pitch-dark':    'repeating-linear-gradient(180deg,#145c2e 0px,#145c2e 36px,#115228 36px,#115228 72px)',
        'navy-gradient': 'linear-gradient(135deg,#060d19 0%,#0d1b2e 60%,#1b3a6b 100%)',
        'gold-gradient': 'linear-gradient(135deg,#b38800 0%,#e6aa00 60%,#ffd700 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
