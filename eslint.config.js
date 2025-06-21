/* eslint-env node */
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: ['eslint.config.js', 'postcss.config.js', 'tailwind.config.js'],
  },
  ...compat.config(require('./.eslintrc.json')),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
  },
];
