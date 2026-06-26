/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // --- Typography -------------------------------------------------------
      // Fraunces (serif display) for headings; Inter for body/UI.
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        overline: '0.18em',
      },
      // --- Palette: warm, editorial neutrals + a single clay accent --------
      colors: {
        // Page + surface tones (warm paper).
        paper: {
          DEFAULT: '#f6f3ee', // page background
          raised: '#fdfbf7', // card / panel surface
          sunk: '#efeae1', // wells, placeholders
        },
        // Warm near-black through taupe for type.
        ink: {
          900: '#221e19', // headings
          700: '#3c352d', // strong body
          500: '#6c6358', // muted body
          400: '#938a7c', // subtle meta
        },
        // Hairline borders.
        line: {
          DEFAULT: '#e6dfd3',
          strong: '#d6ccbc',
        },
        // The single disciplined accent: muted clay / terracotta.
        clay: {
          50: '#f8efea',
          100: '#eed9cf',
          200: '#e0bcab',
          400: '#c47f66',
          500: '#b15a3e', // primary accent
          600: '#9a4a31',
          700: '#7c3b28',
        },
      },
      // --- Form language: restrained radii, hairline-first ------------------
      borderRadius: {
        card: '0.625rem', // 10px — calm, not bubbly
      },
      boxShadow: {
        // Quiet elevation; the design leans on borders, not shadows.
        card: '0 1px 2px rgba(34, 30, 25, 0.04), 0 18px 40px -28px rgba(34, 30, 25, 0.45)',
        soft: '0 1px 2px rgba(34, 30, 25, 0.05)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
