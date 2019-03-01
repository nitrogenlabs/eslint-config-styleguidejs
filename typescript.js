module.exports = {
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true
  },
  extends: 'styleguidejs/base',
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
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
    'no-unused-vars': 0,
    '@typescript-eslint/class-name-casing': 2,
    '@typescript-eslint/member-naming': 2,
    '@typescript-eslint/member-naming': 2,
    '@typescript-eslint/member-ordering': 2,
    '@typescript-eslint/no-angle-bracket-type-assertion': 2,
    '@typescript-eslint/no-array-constructor': 2,
    '@typescript-eslint/no-unused-vars': [1,
      {
        "ignoreRestSiblings": false
      }
    ],
    '@typescript-eslint/type-annotation-spacing': 2,
    'react/prop-types': 0
  }
}
