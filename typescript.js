module.exports = {
  extends: path.resolve(__dirname, './base'),
  parser: path.resolve(__dirname, './node_modules/typescript-eslint-parser'),
  plugins: [
    path.resolve(__dirname, './node_modules/eslint-plugin-typescript')
  ],
  rules: {
  }
}
