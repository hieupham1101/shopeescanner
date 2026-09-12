import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        console: '#F6F8FB',
        shopee: {
          DEFAULT: '#EE4D2D',
          dark: '#C53A21',
          soft: '#FFF1EC',
          glow: '#FFB199',
        },
      },
      boxShadow: {
        panel: '0 20px 60px rgba(15, 23, 42, 0.08)',
        glass:
          '0 28px 90px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.78)',
        soft: '0 14px 42px rgba(15, 23, 42, 0.08)',
        brand: '0 16px 36px rgba(238, 77, 45, 0.28)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0.35', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out',
        shimmer: 'shimmer 2.8s ease-in-out infinite',
        'soft-pulse': 'soft-pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
