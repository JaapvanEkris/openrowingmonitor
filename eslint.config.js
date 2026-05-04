import globals from 'globals'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import { configs as litConfigs } from 'eslint-plugin-lit'
import { configs as wcConfigs } from 'eslint-plugin-wc'

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  stylistic.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tsPlugin
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node
      },
      ecmaVersion: 13,
      sourceType: 'module'
    },
    rules: {
      // Coding issues that have a high chance of leading to errors
      'no-new': ['error'],
      'no-var': ['error'],
      'no-implicit-coercion': ['error', { allow: ['!!'] }],
      curly: ['error', 'all'],
      'block-scoped-var': ['error'],
      'default-case': ['error'],
      'no-fallthrough': ['error', { allowEmptyCase: true }],
      'no-continue': ['error'],
      eqeqeq: ['error', 'always'],
      'no-cond-assign': ['error', 'always'],
      'no-unreachable': ['error'],
      'no-unreachable-loop': ['error'],
      'no-unmodified-loop-condition': ['error'],
      'no-await-in-loop': ['warn'],
      'no-useless-catch': ['error'],
      'no-console': ['error'],
      'arrow-body-style': ['warn', 'as-needed'],
      '@stylistic/no-confusing-arrow': ['error', { allowParens: false, onlyOneSimpleParam: false }],
      '@stylistic/arrow-parens': ['warn', 'always'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      // Bad code smells
      complexity: ['warn', { max: 20, variant: 'modified' }],
      'max-depth': ['warn', { max: 3 }],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-statements': ['warn', { max: 30 }, { ignoreTopLevelFunctions: true }],
      'max-statements-per-line': ['warn', { max: 2 }],
      '@stylistic/max-statements-per-line': ['warn', { max: 2 }],
      'max-params': ['warn', { max: 5 }],
      'no-warning-comments': ['warn'],
      // More stylistic code issues
      '@stylistic/semi': ['warn', 'never'],
      camelcase: ['warn', { properties: 'always', ignoreImports: true }],
      'no-array-constructor': ['warn'],
      '@stylistic/indent': ['warn', 2, { SwitchCase: 1 }],
      '@stylistic/no-trailing-spaces': ['warn', { skipBlankLines: false, ignoreComments: false }],
      '@stylistic/no-multi-spaces': ['warn', { ignoreEOLComments: false }],
      '@stylistic/no-tabs': ['warn'],
      '@stylistic/no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0, maxBOF: 0 }],
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/space-before-function-paren': ['warn', { anonymous: 'never', named: 'always' }],
      '@stylistic/one-var-declaration-per-line': ['warn', 'always'],
      '@stylistic/comma-dangle': ['warn', 'never'],
      '@stylistic/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
      '@stylistic/operator-linebreak': ['warn', 'after']
    }
  },
  {
    // Automated tests, here more tests is always better
    files: ['*/**/*.test.js', '*/**/*.test.ts'],
    rules: {
      'max-depth': ['off'],
      'max-lines': ['off'],
      'max-statements': ['off']
    }
  },
  {
    ...litConfigs['flat/recommended'],
    files: ['*/client/**/*.js', '*/client/**/*.ts']
  },
  {
    ...wcConfigs['flat/recommended'],
    files: ['*/client/**/*.js', '*/client/**/*.ts']
  },
  {
    files: ['*/client/**/*.js', '*/client/**/*.ts'],
    rules: {
      'no-console': ['warn'],
      '@stylistic/indent': ['off'],
      camelcase: ['off']
    }
  },
  {
    // TypeScript-specific overrides: tsc handles undef checking, and the base
    // no-unused-vars doesn't understand TS interface/type parameter names
    files: ['**/*.ts'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
]
