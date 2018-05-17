module.exports = {
  'parser': 'babel-eslint',
  'env': {
    'browser': true,
    'es6': true,
    'jest': true,
    'jest/globals': true,
    'node': true
  },
  'plugins': [
    'jest',
    'react',
    'react-native'
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'globalReturn': true,
      'jsx': true,
      'experimentalObjectRestSpread': true
    },
    'ecmaVersion': 6,
    'sourceType': 'module'
  },
  'rules': {
    'array-bracket-spacing': 0,
    'arrow-parens': [2, 'always'],
    'camelcase': 2,
    'computed-property-spacing': [2, 'never'],
    'consistent-return': 0,
    'dot-notation': 0,
    'eol-last': 2,
    'eqeqeq': 2,
    'max-len': [2, 120, 4],
    'new-cap': 0,
    'no-duplicate-imports': 2,
    'no-eq-null': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-multiple-empty-lines': [
      2,
      {
        'max': 2
      }
    ],
    'no-trailing-spaces': 0,
    'no-use-before-define': [2, 'nofunc'],
    'no-undef': 2,
    'no-underscore-dangle': 0,
    'no-unused-vars': 2,
    'no-var': 2,
    'comma-dangle': [2, 'never'],
    'quotes': [2, 'single'],
    'space-before-blocks': [2, 'always'],
    'space-before-function-paren': [2, 'never'],
    'no-warning-comments': [
      1,
      {
        'terms': ['fixme'],
        'location': 'anywhere'
      }
    ],
    'keyword-spacing': [
      'error',
      {
        'after': true,
        'overrides': {
          'if': {
            'after': false
          },
          'for': {
            'after': false
          },
          'while': {
            'after': false
          },
          'switch': {
            'after': false
          },
          'catch': {
            'after': false
          }
        }
      }
    ],
    'strict': [2, 'never'],
    'vars-on-top': 2,
    'indent': [
      2,
      2,
      {
        'SwitchCase': 1
      }
    ],
    'generator-star-spacing': 1,
    'object-shorthand': 1,
    'no-await-in-loop': 1,
    'react/display-name': 0,
    'react/jsx-boolean-value': 2,
    'react/jsx-no-undef': 2,
    'react/jsx-sort-props': 0,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react/jsx-wrap-multilines': 2,
    'react/no-did-mount-set-state': 2,
    'react/no-did-update-set-state': 2,
    'react/no-multi-comp': 0,
    'react/no-unknown-property': 2,
    'react/prop-types': 2,
    'react/react-in-jsx-scope': 2,
    'react/self-closing-comp': [
      'error',
      {
        'component': true,
        'html': false
      }
    ],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error'
  }
};
