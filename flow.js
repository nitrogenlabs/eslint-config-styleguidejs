module.exports = {
  extends: 'styleguidejs/base',
  parserOptions: {
    babelOptions: {
      presets: [
        '@babel/preset-flow'
      ]
    },
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  plugins: [
    'flowtype'
  ],
  rules: {
    'flowtype/array-style-complex-type': [2, 'shorthand'],
    'flowtype/array-style-simple-type': [2, 'shorthand'],
    'flowtype/boolean-style': [2, 'boolean'],
    'flowtype/delimiter-dangle': [2, 'never'],
    'flowtype/newline-after-flow-annotation': [1, 'never'],
    'flowtype/no-dupe-keys': 2,
    'flowtype/no-existential-type': 2,
    'flowtype/no-flow-fix-me-comments': [1, 'TODO\s+[0-9]+'],
    'flowtype/no-mutable-array': 0,
    'flowtype/no-primitive-constructor-types': 2,
    'flowtype/no-types-missing-file-annotation': 0,
    'flowtype/no-unused-expressions': 1,
    'flowtype/no-weak-types': 0,
    'flowtype/object-type-delimiter': [2, 'comma'],
    'flowtype/require-parameter-type': 0,
    'flowtype/require-return-type': 0,
    'flowtype/require-types-at-top': 2,
    'flowtype/require-valid-file-annotation': 1,
    'flowtype/require-variable-type': 0,
    'flowtype/semi': [2, 'always'],
    'flowtype/space-after-type-colon': [2, 'always', {'allowLineBreak': true}],
    'flowtype/space-before-generic-bracket': [2, 'never'],
    'flowtype/space-before-type-colon': [2, 'never'],
    'flowtype/type-import-style': [1, 'declaration'],
    'flowtype/union-intersection-spacing': [2, 'always'],
    'react/prop-types': 0
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: false
    }
  }
}
