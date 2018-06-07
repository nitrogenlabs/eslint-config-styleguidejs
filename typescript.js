module.exports = {
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true
  },
  extends: 'styleguidejs/base',
  parser: 'typescript-eslint-parser',
  plugins: [
    'typescript'
  ],
  parserOptions: {
    ecmaFeatures: {
      globalReturn: true,
      jsx: true,
      experimentalObjectRestSpread: true
    },
    ecmaVersion: 6,
    sourceType: 'module'
  },
  rules: {
    'no-undef': 0,
    'typescript/class-name-casing': 2,
    'typescript/member-naming': 2,
    'typescript/member-naming': 2,
    'typescript/member-ordering': 2,
    'typescript/no-angle-bracket-type-assertion': 2,
    'typescript/no-array-constructor': 2,
    'typescript/no-unused-vars': 2,
    'typescript/type-annotation-spacing': 2,
    'react/prop-types': 0
  }
}
