import stylistic from '@stylistic/eslint-plugin';
import tsStyleistic from '@stylistic/eslint-plugin-ts';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const baseConfig = {
  languageOptions: {
    ecmaVersion: 'latest',
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...globals.jest,
      ...globals.node
    },
    parserOptions: {
      ecmaFeatures: {
        globalReturn: true
      }
    },
    sourceType: 'module'
  },
  plugins: {
    '@stylistic': stylistic,
    '@stylistic/ts': tsStyleistic,
    import: importPlugin,
    jest: jestPlugin
  },
  rules: {
    '@stylistic/type-annotation-spacing': ['error', {
      after: true,
      before: false,
      overrides: {
        arrow: {
          after: true,
          before: true
        }
      }
    }],
    'array-bracket-spacing': ['error', 'never'],
    'array-callback-return': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': 'error',
    'brace-style': ['error', '1tbs', {allowSingleLine: false}],
    camelcase: 'off',
    'comma-dangle': ['error', 'never'],
    'comma-style': ['error', 'last'],
    'computed-property-spacing': ['error', 'never'],
    'consistent-return': 'warn',
    curly: ['error', 'all'],
    'nonblock-statement-body-position': ['error', 'below'],
    'dot-notation': 'error',
    'eol-last': 'off',
    eqeqeq: ['error', 'always'],
    'func-style': ['error', 'expression', {allowArrowFunctions: true}],
    'generator-star-spacing': 'warn',
    'import/default': 'off',
    'import/export': 'error',
    'import/exports-last': 'off',
    'import/extensions': ['error', 'never', {
      css: 'always',
      js: 'always',
      json: 'always',
      jsx: 'always',
      svg: 'always',
      ts: 'always',
      tsx: 'always',
      types: 'always'
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
        devDependencies: [
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
        peerDependencies: true
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
        alphabetize: {
          caseInsensitive: true,
          order: 'asc'
        },
        groups: [
          ['builtin', 'external', 'internal'],
          ['parent', 'sibling', 'index'],
          'type'
        ],
        'newlines-between': 'always'
      }
    ],
    'import/prefer-default-export': 'off',
    indent: ['error', 2, {SwitchCase: 1}],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'warn',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
    'keyword-spacing': [
      'error',
      {
        overrides: {
          catch: {
            after: false
          },
          for: {
            after: false
          },
          if: {
            after: false
          },
          switch: {
            after: false
          },
          while: {
            after: false
          }
        }
      }
    ],
    'max-len': [
      'error', {
        code: 120,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
        tabWidth: 2
      }
    ],
    'new-cap': 'off',
    'newline-per-chained-call': 'off',
    'no-array-constructor': 'error',
    'no-await-in-loop': 'warn',
    'no-case-declarations': 'error',
    'no-class-assign': 'error',
    'no-confusing-arrow': ['error', {allowParens: true}],
    'no-console': 'warn',
    'no-const-assign': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-eq-null': 'error',
    'no-eval': 'warn',
    'no-extra-semi': 'error',
    'no-invalid-this': 'off',
    'no-loop-func': 'warn',
    'no-mixed-operators': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-assign': 'error',
    'no-multiple-empty-lines': ['error', {max: 2}],
    'max-statements-per-line': ['error', {max: 1}],
    'no-nested-ternary': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'no-param-reassign': 'error',
    'no-plusplus': 'off',
    'no-restricted-properties': [
      'warn',
      {
        message: 'Please use spread, {...obj}',
        object: 'Object',
        property: 'assign'
      }
    ],
    'no-sparse-arrays': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': ['warn', {enforceInMethodNames: true}],
    'no-unexpected-multiline': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-expressions': 'off',
    'no-unused-vars': ['warn', {ignoreRestSiblings: true}],
    'no-use-before-define': 'off',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-escape': 'warn',
    'no-var': 'error',
    'no-warning-comments': [
      'warn',
      {
        location: 'anywhere',
        terms: [
          'fixme'
        ]
      }
    ],
    'no-whitespace-before-property': 'error',
    'object-curly-spacing': ['error', 'never'],
    'object-shorthand': 'warn',
    'one-var': ['error', 'never'],
    'padded-blocks': ['error', 'never'],
    'prefer-arrow-callback': 'error',
    'prefer-const': ['error', {destructuring: 'all', ignoreReadBeforeAssign: true}],
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true
      },
      {
        enforceForRenamedProperties: false
      }
    ],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single'],
    radix: ['error', 'as-needed'],
    semi: ['error', 'always'],
    'semi-spacing': 'error',
    'sort-imports': 'off',
    'sort-keys': ['error', 'asc', {
      caseSensitive: true,
      minKeys: 2,
      natural: false
    }],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        asyncArrow: 'always',
        named: 'never'
      }
    ],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'spaced-comment': ['error', 'always', {exceptions: ['-', '+']}],
    strict: ['error', 'never'],
    'template-curly-spacing': ['error', 'never'],
    'valid-typeof': 'off',
    'vars-on-top': 'error',
    'wrap-iife': ['error', 'outside']
  }
};

const reactConfig = {
  files: ['**/*.jsx', '**/*.tsx'],
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    'react-native': reactNativePlugin
  },
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
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
    'react/self-closing-comp': ['error', {component: true, html: false}]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};

const testConfig = {
  files: ['**/__tests__/**/*', '**/tests/**/*', '**/*.test.*', '**/*.spec.*'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};

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
      '@stylistic/indent': ['error', 2],
      '@stylistic/ts/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false
        }
      }],
      '@typescript-eslint/consistent-type-assertions': ['error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never'
        }
      ],
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/naming-convention': ['warn',
        {
          format: [
            'PascalCase'
          ],
          leadingUnderscore: 'forbid',
          selector: 'class'
        },
        {
          format: [
            'camelCase'
          ],
          leadingUnderscore: 'allow',
          selector: 'default'
        },
        {
          format: [
            'camelCase',
            'UPPER_CASE'
          ],
          selector: 'enumMember'
        },
        {
          format: [
            'camelCase'
          ],
          modifiers: [
            'private'
          ],
          selector: 'memberLike'
        },
        {
          format: [
            'camelCase',
            'PascalCase'
          ],
          leadingUnderscore: 'forbid',
          selector: 'parameter'
        },
        {
          format: null,
          leadingUnderscore: 'allow',
          selector: 'property'
        },
        {
          format: [
            'PascalCase'
          ],
          leadingUnderscore: 'forbid',
          selector: 'typeLike'
        },
        {
          format: [
            'camelCase',
            'PascalCase',
            'UPPER_CASE'
          ],
          leadingUnderscore: 'allow',
          selector: 'variable'
        }
      ],
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      '@typescript-eslint/no-unused-vars': ['warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/type-annotation-spacing': ['error', {
        after: true,
        before: false,
        overrides: {
          arrow: {
            after: true,
            before: true
          }
        }
      }],
      'import/extensions': ['error', 'never', {
        css: 'always',
        js: 'always',
        json: 'always',
        jsx: 'always',
        svg: 'always',
        ts: 'always',
        tsx: 'always',
        types: 'always'
      }],
      indent: 'off',
      'no-duplicate-imports': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off'
    }
  }
);

export default config;