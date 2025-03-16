/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import globals from "globals"
import pluginJs from "@eslint/js"
import js from "@eslint/js"
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from "eslint/config"
import babelParser from "@babel/eslint-parser"

export default defineConfig([
  stylistic.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
      js
    },
    extends: ["js/recommended"],
    languageOptions: {
      parser: babelParser,
      globals: {
        ...globals.browser,
        ...globals.node
      },
      ecmaVersion: 13,
      sourceType: "module"
    },
    rules: {
      ...js.configs.recommended.rules,
      // Coding issues that have a high chance of leading to errors
      'no-new': ['error'],
      'no-implicit-coercion': ['error', {'allow': ['!!']}],
      'curly': ['error', 'all'],
      'block-scoped-var': ['error'],
      'default-case': ['error'],
      'no-fallthrough': ['error', {'allowEmptyCase': true}],
      'no-continue': ['error'],
      'eqeqeq': ['error', 'always'],
      'no-cond-assign': ['error', 'always'],
      'no-unreachable': ['error'],
      'no-unreachable-loop': ['error'],
      'no-unmodified-loop-condition': ['error'],
      'no-await-in-loop': ['warn'],
      'no-useless-catch': ['error'],
      'no-console': ['error'],
      'arrow-body-style': ['error', 'always'],
      '@stylistic/no-confusing-arrow': ['error', {'allowParens': false, 'onlyOneSimpleParam': false}],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      // Bad code smells
      'complexity': ['warn', {'max': 20, 'variant': 'modified'}],
      'max-depth': ['warn', {'max': 3}],
      'max-lines': ['warn', {'max': 300, 'skipBlankLines': true, 'skipComments': true}],
      'max-statements': ['warn', { 'max': 30} , {'ignoreTopLevelFunctions': true }],
      'max-statements-per-line': ['warn', { 'max': 2 }],
      '@stylistic/max-statements-per-line': ['warn', { 'max': 2 }],
      'max-params': ['warn', { 'max': 5 }],
      // More stylistic code issues
      '@stylistic/semi': ['warn', 'never'],
      'camelcase': ['warn', { 'properties': 'always', 'ignoreImports': true }],
      'no-array-constructor': ['warn'],
      '@stylistic/indent': ['warn', 2, { 'SwitchCase': 1 }],
      '@stylistic/no-trailing-spaces': ['warn', {'skipBlankLines': false, 'ignoreComments': false}],
      '@stylistic/no-multi-spaces': ['warn', {'ignoreEOLComments': false, 'ignoreEOLComments': false}],
      '@stylistic/no-tabs': ['warn'],
      '@stylistic/no-multiple-empty-lines': ['warn', {'max': 1, 'maxEOF': 0,  'maxBOF': 0}],
      '@stylistic/quotes': ['warn','single'],
      '@stylistic/space-before-function-paren': ['warn', {'anonymous': 'never', 'named': 'always'}],
      '@stylistic/one-var-declaration-per-line': ['warn', 'always'],
      '@stylistic/comma-dangle': ['warn', 'never'],
      '@stylistic/brace-style': ['warn', '1tbs', { 'allowSingleLine': true }],
      '@stylistic/operator-linebreak': ['warn', 'after']
    }
  },
  pluginJs.configs.recommended,
]);
