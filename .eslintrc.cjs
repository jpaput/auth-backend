module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier', 'import'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      'plugin:prettier/recommended'
    ],
    rules: {
      'prettier/prettier': 'error',
      'import/order': ['warn', {
        groups: ['builtin', 'external', 'internal'],
        'newlines-between': 'always'
      }]
    }
  };