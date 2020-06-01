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
      {
        'selector': 'class',
        'format': [
          'PascalCase'
        ],
        'leadingUnderscore': 'forbid'
      },
      {
        'selector': 'default',
        'format': [
          'strictCamelCase'
        ],
        'leadingUnderscore': 'allow'
      },
      {
        'selector': 'enumMember',
        'format': [
          'strictCamelCase',
          'UPPER_CASE'
        ]
      },
      {
        'selector': 'memberLike',
        'modifiers': [
          'private'
        ],
        'format': [
          'strictCamelCase'
        ]
      },
      {
        'selector': 'parameter',
        'format': [
          'strictCamelCase',
          'PascalCase'
        ],
        'leadingUnderscore': 'forbid'
      },
      {
        'selector': 'property',
        'format': null,
        'leadingUnderscore': 'allow'
      },
      {
        'selector': 'typeLike',
        'format': [
          'PascalCase'
        ],
        'leadingUnderscore': 'forbid'
      },
      {
        'selector': 'variable',
        'format': [
          'strictCamelCase',
          'PascalCase',
          'UPPER_CASE'
        ],
        'leadingUnderscore': 'allow'
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
