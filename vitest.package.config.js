export default {
  test: {
    environment: 'node',
    hookTimeout: 120000,
    include: ['test/package-install.test.js'],
    testTimeout: 240000
  }
};
