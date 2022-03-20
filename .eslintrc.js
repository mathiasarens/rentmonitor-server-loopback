module.exports = {
  extends: '@loopback/eslint-config',
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
      },
    },
  ],
  rules: {
    'mocha/handle-done-callback': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
  },
  parserOptions: {
    createDefaultProgram: true,
  },
};
