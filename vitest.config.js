export default {
  test: {
    coverage: {
      enabled: true,
      include: ['custom-sort-imports-rule.js', 'plugins/react-hooks-rules.js'],
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: '.artifacts/import-sort-coverage',
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        perFile: true,
        statements: 90
      }
    },
    environment: 'node',
    include: ['test/react-hooks.test.js', 'test/import-sort.test.js', 'test/legacy-cleanup.test.js']
  }
};
