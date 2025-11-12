// eslint.config.cjs
const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');

// Cấu hình cho RN: khai báo các global như console, fetch, require...
module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'dist/**',
      'build/**',
      '.expo/**',
      '.yarn/**',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      // Khai báo các biến môi trường của RN để ESLint không báo no-undef
      globals: {
        console: 'readonly',
        fetch: 'readonly',
        require: 'readonly',
        navigator: 'readonly',
        __DEV__: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // BẮT đúng lỗi hooks sai chỗ
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Cho phép để console (nếu muốn cảnh báo thì đổi thành 'warn')
      'no-console': 'off',
    },
  },
];
