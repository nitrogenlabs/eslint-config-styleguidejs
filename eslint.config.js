import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import stylisticPlugin from '@stylistic/eslint-plugin-ts';

// Base configuration
const baseConfig = {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        globalReturn: true
      }
    },
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...globals.jest,
      ...globals.node
    }
  },
  plugins: {
    'import': importPlugin,
    'jest': jestPlugin,
    '@stylistic': stylisticPlugin
  },
  rules: {
    'array-bracket-spacing': ['error', 'never'],
    'array-callback-return': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': 'error',
    'brace-style': ['error', '1tbs', {'allowSingleLine': false}],
    'camelcase': 'off',
    'computed-property-spacing': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'comma-style': ['error', 'last'],
    'consistent-return': 'warn',
    'curly': 'error',
    'dot-notation': 'error',
    'eol-last': 'off',
    'eqeqeq': ['error', 'always'],
    'func-style': ['error', 'expression', {'allowArrowFunctions': true}],
    'generator-star-spacing': 'warn',
    'import/default': 'off',
    'import/export': 'error',
    'import/exports-last': 'off',
    'import/extensions': ['error', 'never', {
      'css': 'always',
      'json': 'always',
      'svg': 'always',
      'types': 'always'
    }],
    'import/first': 'error',
    'import/named': 'off',
    'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    'import/no-cycle': 'error',
    'import/no-deprecated': 'warn',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': [
      'error',
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
          'jest.setup.js',
          '**/*.config.*'
        ],
        'peerDependencies': true
      }
    ],
    'import/no-internal-modules': 'off',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'warn',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-webpack-loader-syntax': 'off',
    'import/order': [
      'error',
      {
        'alphabetize': {
          'caseInsensitive': true,
          'order': 'asc'
        },
        'groups': [
          ['builtin', 'external', 'internal'],
          ['parent', 'sibling', 'index'],
          'type'
        ],
        'newlines-between': 'always'
      }
    ],
    'import/prefer-default-export': 'off',
    'indent': ['error', 2, {'SwitchCase': 1}],
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
      'error', {
        'code': 120,
        'ignoreRegExpLiterals': true,
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true,
        'ignoreUrls': true,
        'tabWidth': 2
      }
    ],
    'new-cap': 'off',
    'newline-per-chained-call': 'off',
    'no-array-constructor': 'error',
    'no-await-in-loop': 'warn',
    'no-case-declarations': 'error',
    'no-class-assign': 'error',
    'no-confusing-arrow': ['error', {'allowParens': true}],
    'no-const-assign': 'error',
    'no-console': 'warn',
    'no-dupe-keys': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-eq-null': 'error',
    'no-extra-semi': 'error',
    'no-eval': 'warn',
    'no-invalid-this': 'off',
    'no-loop-func': 'warn',
    'no-mixed-operators': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-assign': 'error',
    'no-multiple-empty-lines': ['error', {'max': 2}],
    'no-nested-ternary': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'no-param-reassign': 'error',
    'no-plusplus': 'warn',
    'no-restricted-properties': [
      'warn',
      {
        'object': 'Object',
        'property': 'assign',
        'message': 'Please use spread, {...obj}'
      }
    ],
    'no-sparse-arrays': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': ['warn', {'enforceInMethodNames': true}],
    'no-unexpected-multiline': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-expressions': 'off',
    'no-unused-vars': ['warn', {'ignoreRestSiblings': true}],
    'no-use-before-define': 'off',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-escape': 'warn',
    'no-var': 'error',
    'no-warning-comments': [
      'warn',
      {
        'terms': [
          'fixme'
        ],
        'location': 'anywhere'
      }
    ],
    'no-whitespace-before-property': 'error',
    'one-var': ['error', 'never'],
    'object-curly-spacing': ['error', 'never'],
    'object-shorthand': 'warn',
    'padded-blocks': ['error', 'never'],
    'prefer-arrow-callback': 'error',
    'prefer-const': ['error', {'destructuring': 'all', 'ignoreReadBeforeAssign': true}],
    'prefer-destructuring': [
      'error',
      {
        'array': false,
        'object': true
      },
      {
        'enforceForRenamedProperties': false
      }
    ],
    'prefer-rest-params': 'error',
    'prefer-template': 'error',
    'prefer-spread': 'error',
    'quote-props': ['error', 'as-needed'],
    'quotes': ['error', 'single'],
    'radix': ['error', 'as-needed'],
    'semi': ['error', 'always'],
    'semi-spacing': 'error',
    'sort-imports': 'off',
    'sort-keys': ['error', 'asc', {
      'caseSensitive': true,
      'minKeys': 2,
      'natural': false
    }],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': [
      'error',
      {
        'anonymous': 'never',
        'asyncArrow': 'always',
        'named': 'never',
      }
    ],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'spaced-comment': ['error', 'always', {'exceptions': ['-', '+']}],
    'strict': ['error', 'never'],
    'template-curly-spacing': ['error', 'never'],
    'valid-typeof': 'off',
    'vars-on-top': 'error',
    'wrap-iife': ['error', 'outside'],
    '@stylistic/type-annotation-spacing': ['error', {
      before: true,
      after: true
    }]
  }
};

// React configuration
const reactConfig = {
  files: ['**/*.jsx', '**/*.tsx'],
  plugins: {
    'react': reactPlugin,
    'react-hooks': reactHooksPlugin,
    'react-native': reactNativePlugin
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/display-name': 'off',
    'react/jsx-boolean-value': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-sort-props': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/jsx-wrap-multilines': 'error',
    'react/no-did-mount-set-state': 'error',
    'react/no-did-update-set-state': 'error',
    'react/no-multi-comp': 'off',
    'react/no-unknown-property': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/self-closing-comp': ['error', {'component': true, 'html': false}],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};


// Test files configuration
const testConfig = {
  files: ['**/__tests__/**/*', '**/tests/**/*', '**/*.test.*', '**/*.spec.*'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};

// File ignores
const ignoresConfig = {
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.lex-tmp/**']
};

export const config = [
  ignoresConfig,
  baseConfig,
  reactConfig,
  testConfig
];

export const typescriptConfig = tseslint.config(
  config,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        projectService: true
      }
    },
    rules: {
      'indent': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-assertions': ['error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        }
      ],
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/naming-convention': ['error',
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
            'camelCase'
          ],
          'leadingUnderscore': 'allow'
        },
        {
          'selector': 'enumMember',
          'format': [
            'camelCase',
            'UPPER_CASE'
          ]
        },
        {
          'selector': 'memberLike',
          'modifiers': [
            'private'
          ],
          'format': [
            'camelCase'
          ]
        },
        {
          'selector': 'parameter',
          'format': [
            'camelCase',
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
            'camelCase',
            'PascalCase',
            'UPPER_CASE'
          ],
          'leadingUnderscore': 'allow'
        }
      ],
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-unused-vars': ['warn',
        {
          'args': 'after-used',
          'argsIgnorePattern': '^_',
          'caughtErrors': 'all',
          'caughtErrorsIgnorePattern': '^_',
          'ignoreRestSiblings': true,
          'varsIgnorePattern': '^_'
        }
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      '@stylistic/indent': ['error', 2]
    }
  }
);

export default config;