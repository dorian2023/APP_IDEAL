/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ideal: {
          light: '#e6f0ff',
          DEFAULT: '#0052cc',      // Azul Corporativo Oficial
          hover: '#0043a4',
          dark: '#003380',
        },
        brand: {
          glass: 'rgba(255, 255, 255, 0.08)',
          'glass-dark': 'rgba(9, 13, 22, 0.65)',
        },
        navy: {
          50: '#f4f6fa',
          100: '#e9ecf4',
          200: '#c8d1e5',
          300: '#a7b6d7',
          400: '#647ebd',
          500: '#0052cc',
          600: '#1d3266',
          700: '#15244a',
          800: '#131b2e',          // Fondo de tarjetas de administración
          900: '#090d16',          // Fondo de página de administración (Abisal)
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        title: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
