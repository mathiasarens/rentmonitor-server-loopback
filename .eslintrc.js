module.exports = {
  extends: ['@loopback/eslint-config', 'plugin:cypress/recommended'],
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
  },
  parserOptions: {
    createDefaultProgram: true,
  },
};
