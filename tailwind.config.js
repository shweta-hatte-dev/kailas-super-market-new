/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#173F2B', 800: '#1D4D35' },
        leaf: { DEFAULT: '#4F8D57', dark: '#3C7044' },
        sage: { DEFAULT: '#E8F0E6', deep: '#D5E4D2' },
        cream: { DEFAULT: '#FAF7F0', deep: '#F2ECDD' },
        ink: '#222821',
        gold: { DEFAULT: '#C6A66B', tint: '#F1E7CF' },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Figtree Variable"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        lift: '0 14px 32px -14px rgba(23,63,43,0.28)',
        drawer: '-18px 0 48px -20px rgba(23,63,43,0.35)',
      },
    },
  },
  plugins: [],
};
