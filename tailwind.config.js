/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#040806',
          900: '#08100c',
          800: '#0f2017',
          700: '#173123',
          600: '#224632',
          500: '#2d5c42',
          400: '#3e7f5b',
          300: '#5caa80',
          200: '#8ecdb0',
          100: '#c5ebd9',
        },
        olive: {
          950: '#060704',
          900: '#0c0e08',
          800: '#181c11',
          700: '#2a311d',
          600: '#3f492b',
          500: '#56643c',
        },
        moss: {
          800: '#1d2212',
          700: '#333b20',
          600: '#4d5731',
          500: '#6f7d47',
          400: '#8e9e62',
          300: '#adb885',
        },
        earth: {
          950: '#070504',
          900: '#0e0b09',
          800: '#1f1612',
          700: '#382821',
          600: '#543c32',
          500: '#755446',
        },
        amber: {
          500: '#d97706',
          400: '#fbbf24',
          300: '#fcd34d',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
