import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Ignore build/dist folders
  globalIgnores(['dist', 'node_modules']),

  {
    // Apply to JS, JSX, TS, TSX
    files: ['**/*.{js,jsx,ts,tsx}'],

    // Base configurations
    extends: [
      js.configs.recommended,          // JS rules
      tsPlugin.configs.recommended,    // TypeScript rules
      reactHooks.configs['recommended-latest'], // React Hooks
      reactRefresh.configs.vite,       // Vite plugin
    ],

    languageOptions: {
      parser: '@typescript-eslint/parser', // TypeScript parser
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      // Allow unused vars that start with capital letters or underscore
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // TypeScript-specific adjustments
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off', // optional
    },

    settings: {
      react: {
        version: 'detect', // auto-detect React version
      },
    },
  },
]);
