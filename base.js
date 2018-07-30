module.exports = {
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      globalReturn: true,
      jsx: true,
      experimentalObjectRestSpread: true
    },
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: [
    'babel',
    'import',
    'jest',
    'react',
    'react-native'
  ],
  rules: {
    'array-bracket-spacing': [2, 'never'],
    'array-callback-return': 2,
    'arrow-body-style': [2, 'as-needed'],
    'arrow-parens': [2, 'always'],
    'arrow-spacing': 2,
    'brace-style': [2, '1tbs', {'allowSingleLine': false}],
    'camelcase': [2, {'properties': 'never'}],
    'computed-property-spacing': [2, 'never'],
    'comma-dangle': [2, 'never'],
    'comma-style': [2, 'last'],
    'consistent-return': 1,
    'curly': 2,
    'dot-notation': 2,
    'eol-last': 2,
    'eqeqeq': [2, 'always'],
    'func-style': ['error', 'expression', {'allowArrowFunctions': true}],
    'generator-star-spacing': 1,
    'id-length': [2, {'min': 2}],
    'import/default': 0,
    'import/export': 2,
    'import/exports-last': 0,
    'import/extensions': [2, 'never', {'ignorePackages': true}],
    'import/first': 2,
    'import/max-dependencies': [1, {'max': 15}],
    'import/named': 2,
    'import/newline-after-import': 2,
    'import/no-absolute-path': 2,
    'import/no-cycle': 2,
    'import/no-deprecated': 1,
    'import/no-duplicates': 2,
    'import/no-extraneous-dependencies': [
      2,
      {
        'devDependencies': [
          '**/__tests__/*',
          '**/__tests__/**/*',
          '**/tests/*',
          '**/tests/**/*',
          '**/*.test.js*',
          '**/*.spec.js*',
          '**/*.test.ts*',
          '**/*.spec.ts*',
          'jest.setup.js'
        ],
        'peerDependencies': true
      }
    ],
    'import/no-internal-modules': 0,
    'import/no-mutable-exports': 2,
    'import/no-named-as-default': 2,
    'import/no-named-as-default-member': 1,
    'import/no-self-import': 2,
    'import/no-useless-path-segments': 2,
    'import/no-webpack-loader-syntax': 0,
    'import/order': [
      2,
      {
        'groups': [['builtin', 'external', 'internal'], ['parent', 'sibling', 'index']],
        'newlines-between': 'always'
      }
    ],
    'import/prefer-default-export': 0,
    'indent': [2, 2, {'SwitchCase': 1}],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'warn',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
    'keyword-spacing': [
      'error',
      {
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
    'max-len': [
      2, {
        'code': 120,
        'ignoreRegExpLiterals': true,
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true,
        'ignoreUrls': true,
        'tabWidth': 2
      }
    ],
    'new-cap': 2,
    'newline-per-chained-call': 0,
    'no-array-constructor': 2,
    'no-await-in-loop': 1,
    'no-case-declarations': 2,
    'no-class-assign': 2,
    'no-confusing-arrow': [2, {'allowParens': true}],
    'no-const-assign': 2,
    'no-dupe-keys': 2,
    'no-duplicate-imports': 2,
    'no-else-return': 2,
    'no-eq-null': 2,
    'no-extra-semi': 2,
    'no-eval': 1,
    'no-loop-func': 1,
    'no-mixed-operators': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-multi-assign': 2,
    'no-multiple-empty-lines': [2, {'max': 2}],
    'no-nested-ternary': 2,
    'no-new-func': 2,
    'no-new-object': 2,
    'no-new-wrappers': 2,
    'no-param-reassign': 2,
    'no-plusplus':[2, {"allowForLoopAfterthoughts": true }],
    'no-restricted-properties': [
      1,
      {
        'object': 'Object',
        'property': 'assign',
        'message': 'Please use spread, {...obj}'
      }
    ],
    'no-sparse-arrays': 2,
    'no-trailing-spaces': 2,
    'no-undef-init': 2,
    'no-underscore-dangle': [1, {'enforceInMethodNames': true}],
    'no-unexpected-multiline': 2,
    'no-unneeded-ternary': 2,
    'no-unused-vars': [1, {'ignoreRestSiblings': true}],
    'no-use-before-define': [2, {'functions': false, 'classes': false}],
    'no-useless-concat': 2,
    'no-useless-constructor': 2,
    'no-useless-escape': 2,
    'no-var': 2,
    'no-warning-comments': [
      1,
      {
        'terms': [
          'fixme'
        ],
        'location': 'anywhere'
      }
    ],
    'no-whitespace-before-property': 2,
    'one-var': [2, 'never'],
    'object-curly-spacing': [2, 'never'],
    'object-shorthand': 1,
    'padded-blocks': [2, 'never'],
    'prefer-arrow-callback': 2,
    'prefer-const': [2, {'destructuring': 'all', 'ignoreReadBeforeAssign': true}],
    'prefer-destructuring': [
      2,
      {
        'array': false,
        'object': true
      },
      {
        'enforceForRenamedProperties': false
      }
    ],
    'prefer-rest-params': 2,
    'prefer-template': 2,
    'prefer-spread': 2,
    'quote-props': [2, 'as-needed'],
    'quotes': [2, 'single'],
    'radix': [2, 'as-needed'],
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
    'react/prop-types': 1,
    'react/react-in-jsx-scope': 2,
    'react/self-closing-comp': [2, {'component': true, 'html': false}],
    'semi': [2, 'always'],
    'semi-spacing': 2,
    'sort-keys': [2, 'asc', {'caseSensitive': true, 'natural': false}],
    'space-before-blocks': [2, 'always'],
    'space-before-function-paren': [
      2,
      {
        'anonymous': 'never',
        'asyncArrow': 'always',
        'named': 'never',
      }
    ],
    'space-in-parens': [2, 'never'],
    'space-infix-ops': 2,
    'spaced-comment': [2, 'always', {'exceptions': ['-', '+']}],
    'strict': [2, 'never'],
    'template-curly-spacing': [2, 'never'],
    'vars-on-top': 2,
    'wrap-iife': [2, 'outside']
  }
};
