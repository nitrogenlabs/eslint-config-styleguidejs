export default {
  test: {
    coverage: {
      include: ['plugins/react-hooks-rules.js'],
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      }
    },
    environment: 'node',
    include: ['test/react-hooks.test.js']
  }
};
