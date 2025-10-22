/**
 * ESLint 配置文件
 * ESLint Configuration
 *
 * 使用 ESLint 9.x 新的扁平配置格式
 * 基于 Next.js + TypeScript 的最佳实践
 */

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // 基础 JavaScript 规则
  js.configs.recommended,

  // Next.js 特定规则
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // 通用规则
  {
    rules: {
      // 代码质量
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',

      // 代码风格
      indent: ['warn', 2, { SwitchCase: 1 }],
      quotes: ['warn', 'single', { avoidEscape: true }],
      semi: ['warn', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'func-call-spacing': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-before-blocks': 'error',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'spaced-comment': ['error', 'always'],

      // 最佳实践
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-throw-literal': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      radix: 'error',
      yoda: 'error',

      // 变量声明
      'no-undef': 'warn',
      'no-unused-vars': 'off', // 使用 TypeScript 版本
      'no-use-before-define': 'warn',

      // 函数
      'no-dupe-args': 'error',
      'no-empty-function': 'warn',
      'no-extra-parens': ['warn', 'functions'],
      'no-param-reassign': 'warn',
      'no-return-await': 'warn',
      'require-await': 'warn',

      // 对象和数组
      'no-array-constructor': 'error',
      'no-dupe-keys': 'error',
      'no-new-object': 'error',
      'no-obj-calls': 'error',
      'object-shorthand': 'error',
      'prefer-object-spread': 'error',
    },
  },

  // Jest 测试文件配置
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: {
        // Jest 全局变量
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // Node.js 全局变量
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 忽略文件
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      'public/**',
    ],
  },
];
