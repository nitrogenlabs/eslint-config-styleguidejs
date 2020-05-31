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
        "selector": "default",
        "format": [
          "camelCase"
        ],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "class",
        "format": [
          "PascalCase"
        ],
        "leadingUnderscore": "forbid"
      },
      {
        "selector": "parameter",
        "format": [
          "camelCase"
        ]
      },
      {
        "selector": "property",
        "format": [
          "camelCase",
          "UPPER_CASE"
        ]
      },
      {
        "selector": "memberLike",
        "modifiers": [
          "private"
        ],
        "format": [
          "camelCase"
        ]
      },
      {
        "selector": "typeLike",
        "format": [
          "PascalCase"
        ],
        "leadingUnderscore": "forbid"
      },
      {
        "selector": "variable",
        "format": [
          "camelCase",
          "PascalCase",
          "UPPER_CASE"
        ]
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
