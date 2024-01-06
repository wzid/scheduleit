/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        royalblue: {
          50: '#eef4ff',
          100: '#e1eafe',
          200: '#c8d9fd',
          300: '#a7befa',
          400: '#849bf5',
          500: '#6678ee',
          600: '#545ce3',
          700: '#3b40c7',
          800: '#3339a0',
          900: '#30367f',
          950: '#1c1e4a'
        },
        blush: {
          50: '#fbf5f5',
          100: '#f5e6e8',
          200: '#f0dbdf',
          300: '#e4bdc4',
          400: '#d498a5',
          500: '#c07385',
          600: '#a9556c',
          700: '#8d4359',
          800: '#773a4f',
          900: '#673447',
          950: '#381924'
        },
        peach: {
          50: '#fff5ed',
          100: '#ffe8d5',
          200: '#ffc49b',
          300: '#ffa872',
          400: '#fd793a',
          500: '#fc5613',
          600: '#ed3a09',
          700: '#c4290a',
          800: '#9c2110',
          900: '#7d1e11',
          950: '#440c06'
        }
      }
    }
  },
  plugins: []
};
