/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: { DEFAULT: '#E11D48', dark: '#BE123C', light: '#FB7185', glow: '#F43F5E' },
        primary: { DEFAULT: '#E11D48', dark: '#BE123C', light: '#FB7185', glow: '#F43F5E' },
        lacquer: { DEFAULT: '#E11D48', dark: '#BE123C', light: '#FB7185', glow: '#F43F5E' },
        accent: { DEFAULT: '#D97706', dark: '#B45309', light: '#FDE68A' },
        ochre: { DEFAULT: '#D97706', dark: '#B45309', light: '#FDE68A' },
        herb: { DEFAULT: '#059669', dark: '#047857', light: '#D1FAE5' },
        ink: { DEFAULT: '#0F172A', muted: '#475569', faint: '#94A3B8' },
        foodText: { DEFAULT: '#0F172A', muted: '#475569' },
        rice: { DEFAULT: '#FFFFFF', deep: '#F8FAFC', light: '#FFFFFF' },
        surface: { DEFAULT: '#FFFFFF', card: '#FFFFFF', dark: '#F8FAFC' },
      },
      borderRadius: {
        card: '1.25rem',
        control: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        card: '0 10px 30px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        lift: '0 20px 40px -8px rgba(15, 23, 42, 0.09)',
        glow: '0 10px 25px -5px rgba(225, 29, 72, 0.35)',
        warm: '0 10px 30px -4px rgba(15, 23, 42, 0.06)',
      },
      letterSpacing: {
        editorial: '0.08em',
        tightest: '-0.03em',
      },
    },
  },
  plugins: [],
};
