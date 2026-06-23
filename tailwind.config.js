/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return `rgb(var(${variableName}) / <alpha-value>)`;
}

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Semantic tokens — backed by RGB-triplet CSS variables set per
        // data-theme in src/index.css, so the same utility classes
        // (including opacity modifiers like bg-brand/20) work across
        // light / day / night / dark without duplicating component code.
        app: {
          bg: withOpacity('--bg'),
          surface: withOpacity('--surface'),
          card: withOpacity('--card'),
          border: withOpacity('--border'),
          text: withOpacity('--text'),
          muted: withOpacity('--text-muted'),
        },
        brand: {
          DEFAULT: withOpacity('--primary'),
          light: withOpacity('--primary-light'),
          dark: withOpacity('--primary-dark'),
        },
        mood: {
          great: withOpacity('--mood-great'),
          good: withOpacity('--mood-good'),
          okay: withOpacity('--mood-okay'),
          stressed: withOpacity('--mood-stressed'),
          overwhelmed: withOpacity('--mood-overwhelmed'),
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgb(var(--primary) / 0.25)',
        card: '0 4px 16px -4px rgb(var(--text) / 0.06)',
      },
    },
  },
  plugins: [],
}
