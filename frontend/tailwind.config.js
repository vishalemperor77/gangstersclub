/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    colors: {
      // `defaultTheme.colors` is EMPTY in Tailwind v3.4 — the real default
      // palette (white/black/gray/slate/red/…) lives in `tailwindcss/colors`.
      // Spreading it keeps `text-white`, `bg-black/80`, `border-white/[0.06]`,
      // `to-transparent`, etc. working, and the brand palette layers on top.
      ...colors,
      ink: {
        950: '#050505',
        900: '#0a0a0b',
        850: '#0f0f11',
        800: '#141417',
        750: '#1a1a1e',
        700: '#212126',
        600: '#2b2b31',
        500: '#3a3a42',
      },
      gold: {
        50: '#fdf9ec',
        100: '#f7efcf',
        200: '#eedda1',
        300: '#e2c66e',
        400: '#d4af45',
        500: '#c8a24b',
        600: '#a8842f',
        700: '#856626',
        800: '#5c4719',
      },
      silver: {
        100: '#e8e8ea',
        200: '#c9c9ce',
        300: '#a3a3ab',
        400: '#7d7d87',
        500: '#5c5c66',
      },
      success: '#3ddc84',
      danger: '#f0564b',
      warning: '#f0b429',
    },
    fontFamily: {
      ...defaultTheme.fontFamily,
      display: ['Cinzel', 'Cormorant Garamond', 'serif'],
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      ...defaultTheme.fontSize,
      '2xs': ['0.625rem', { lineHeight: '0.9rem' }],
    },
    borderRadius: {
      ...defaultTheme.borderRadius,
      none: '0',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '10px',
      xl: '14px',
    },
    boxShadow: {
      ...defaultTheme.boxShadow,
      glow: '0 0 0 1px rgba(200,162,75,0.35), 0 0 24px -6px rgba(200,162,75,0.35)',
      'glow-strong': '0 0 0 1px rgba(200,162,75,0.6), 0 0 40px -4px rgba(200,162,75,0.55)',
      card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.9)',
      'card-hover': '0 1px 0 0 rgba(255,255,255,0.07) inset, 0 30px 70px -28px rgba(0,0,0,0.95)',
    },
    // `bg-gradient-to-*` / `bg-none` live in this scale — replacing it wholesale
    // removed every gradient in the app (gold buttons, hero fades, card overlays).
    backgroundImage: {
      ...defaultTheme.backgroundImage,
      'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      'metal': 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.04) 100%)',
    },
    keyframes: {
      ...defaultTheme.keyframes,
      'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
      'fade-up': {
        from: { opacity: 0, transform: 'translateY(16px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      'blur-in': {
        from: { opacity: 0, filter: 'blur(10px)' },
        to: { opacity: 1, filter: 'blur(0)' },
      },
      'scale-in': {
        from: { opacity: 0, transform: 'scale(0.97)' },
        to: { opacity: 1, transform: 'scale(1)' },
      },
      'shine': {
        '0%': { backgroundPosition: '-200% center' },
        '100%': { backgroundPosition: '200% center' },
      },
      'pulse-soft': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.55 },
      },
    },
    animation: {
      ...defaultTheme.animation,
      'fade-in': 'fade-in 0.6s ease forwards',
      'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      'blur-in': 'blur-in 0.8s ease forwards',
      'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      'shine': 'shine 6s linear infinite',
      'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
    },
  },
  plugins: [],
};
