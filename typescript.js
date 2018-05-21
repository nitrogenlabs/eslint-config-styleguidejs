module.exports = {
  extends: 'eslint-config-styleguidejs/base',
  parser: 'typescript-eslint-parser',
  plugins: [
    'typescript'
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  rules: {
    'no-undef': 0,
    'typescript/class-name-casing': 2,
    'typescript/explicit-function-return-type': 2,
    'typescript/member-naming': 2,
    'typescript/member-naming': 2,
    'typescript/member-ordering': 2,
    'typescript/no-angle-bracket-type-assertion': 2,
    'typescript/no-array-constructor': 2,
    'typescript/no-unused-vars': 2,
    'typescript/type-annotation-spacing': 2
  }
}
