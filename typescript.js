module.exports = {
  extends: 'styleguidejs/base',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    "indent": 0,
    'no-undef': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/consistent-type-assertions': [2,
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'never',
      }
    ],
    '@typescript-eslint/member-ordering': 2,
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
    '@typescript-eslint/no-array-constructor': 2,
    '@typescript-eslint/no-unused-vars': [1,
      {
        ignoreRestSiblings: false
      }
    ],
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/type-annotation-spacing': 2,
    "@typescript-eslint/indent": [
      2,
      2
    ]
  }
}
