import js from '@eslint/js';
import react from 'eslint-plugin-react';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      '@typescript-eslint': tseslint,
    },
    rules: {},
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
