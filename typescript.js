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
    '@typescript-eslint/naming-convention': [2,
      {'selector': 'default', 'format': ['camelCase']},
      {
        'selector': 'variable',
        'format': ['camelCase', 'UPPER_CASE']
      },
      {
        'selector': 'parameter',
        'format': ['camelCase'],
        'leadingUnderscore': 'allow'
      },
      {
        'selector': 'memberLike',
        'modifiers': ['private'],
        'format': ['camelCase'],
        'leadingUnderscore': 'require'
      },

      {
        'selector': 'typeLike',
        'format': ['PascalCase']
      }
    ],
    '@typescript-eslint/consistent-type-assertions': [2,
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'never',
      }
    ],
    '@typescript-eslint/member-ordering': 2,
    '@typescript-eslint/no-array-constructor': 2,
    '@typescript-eslint/no-unused-vars': [1,
      {
        ignoreRestSiblings: false
      }
    ],
    '@typescript-eslint/type-annotation-spacing': 2,
    'react/prop-types': 0
  }
}
