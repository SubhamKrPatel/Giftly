/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        blush: {
          50: '#fdf4f5',
          100: '#fbe8ea',
          200: '#f7d3d7',
          300: '#f1b3ba',
          400: '#e8869a',
          500: '#d9627e',
          600: '#c44468',
          700: '#a43459',
          800: '#8a2d4f',
          900: '#762946',
        },
        cream: {
          50: '#fefdf9',
          100: '#fdf8ef',
          200: '#faf0da',
          300: '#f5e3bc',
          400: '#eecf92',
          500: '#e6b86a',
          600: '#d9a04e',
          700: '#b67e3e',
          800: '#926339',
          900: '#785232',
        },
        warm: {
          50: '#fefefe',
          100: '#fdfcfb',
          200: '#faf6f2',
          300: '#f5ede6',
          400: '#edd9cd',
          500: '#e2c4b0',
          600: '#ceaa92',
          700: '#b58c74',
          800: '#97725e',
          900: '#7c5e4f',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'sparkle': 'sparkle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #fdf8ef 0%, #fff1f2 40%, #fdf4f5 100%)',
        'rose-gradient': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
        'warm-gradient': 'linear-gradient(135deg, #faf0da 0%, #fdf4f5 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        'glow': '0 0 24px rgba(244, 63, 94, 0.18)',
        'phone': '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
