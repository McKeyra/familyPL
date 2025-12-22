/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Bria's Theme - Warm Sunset
        bria: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          glow: 'rgba(249, 115, 22, 0.4)',
        },
        // Naya's Theme - Ocean Dream
        naya: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          glow: 'rgba(6, 182, 212, 0.4)',
        },
        // Parent Theme - Professional Purple
        parent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          glow: 'rgba(168, 85, 247, 0.4)',
        },
        // Glass colors
        glass: {
          white: 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(0, 0, 0, 0.1)',
          border: 'rgba(255, 255, 255, 0.18)',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'neumorphic': '20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff',
        'neumorphic-inset': 'inset 8px 8px 16px #d1d9e6, inset -8px -8px 16px #ffffff',
        'glow-bria': '0 0 40px rgba(249, 115, 22, 0.3)',
        'glow-naya': '0 0 40px rgba(6, 182, 212, 0.3)',
        'glow-parent': '0 0 40px rgba(168, 85, 247, 0.3)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'heart-beat': 'heart-beat 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
}
