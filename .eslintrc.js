module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:vue/essential',
    '@vue/prettier',
    '@vue/typescript',
  ],
  settings: {
    'import/extensions': ['.ts', '.js'],
    'import/resolver': {
      typescript: { project: './src' },
    },
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/array-type': [
      'warn',
      {
        default: 'array-simple',
      },
    ],
    'object-shorthand': ['error', 'always'],
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        // 'newlines-between': 'always', // import groups の間 1行あける
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: { order: 'asc', caseInsensitive: true }, // 大文字小文字関係なくアルファベット順にしたい
        pathGroups: [
          { pattern: 'src/types/**', group: 'internal', position: 'before' },
          {
            pattern: 'src/repositories/**',
            group: 'internal',
            position: 'before',
          },
        ],
      },
    ],
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
