/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6eeff',
          100: '#ccdcff',
          200: '#99b9ff',
          300: '#6695ff',
          400: '#3372ff',
          500: '#0f52ba', // primary
          600: '#0c42a6',
          700: '#093179',
          800: '#06214d',
          900: '#031026',
        },
        secondary: {
          50: '#e6fafa',
          100: '#ccf5f5',
          200: '#99ebeb',
          300: '#66e0e0',
          400: '#33d6d6',
          500: '#00a6a6', // secondary
          600: '#008585',
          700: '#006363',
          800: '#004242',
          900: '#002121',
        },
        accent: {
          50: '#fff7e6',
          100: '#ffeecb',
          200: '#ffdd99',
          300: '#ffcc66',
          400: '#ffbb33',
          500: '#ff8c00', // accent
          600: '#cc7000',
          700: '#995400',
          800: '#663800',
          900: '#331c00',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          700: '#b91c1c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};