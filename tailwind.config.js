const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: colors.gray,
        primary: colors.sky,
        secondary: colors.emerald,
        danger: colors.red,
        warning: colors.amber,
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
