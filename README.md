# eslint-config-styleguidejs

## The Ultimate JavaScript & TypeScript Linting Solution

**eslint-config-styleguidejs** is a comprehensive, battle-tested ESLint configuration designed to maximize developer productivity and code quality across modern JavaScript and TypeScript projects. Built on ESLint v10's flat config format, it represents the distillation of industry best practices from thousands of production codebases.

> "Code like everyone can read your work, because they can."

**[Explore our Best Practices Guide](./BEST_PRACTICES.md)** – Discover the psychological and cognitive benefits behind our coding standards and how they improve developer productivity.

## Why Choose styleguidejs?

- **Optimized for Modern Development**: Carefully tuned rules that align with how JavaScript and TypeScript are written today
- **Accelerate Code Reviews**: Consistent formatting and style rules eliminate trivial feedback, focusing reviews on what matters
- **Reduce Cognitive Load**: Standardized patterns build muscle memory and let developers focus on solving problems, not syntax
- **Type-Aware Linting**: First-class TypeScript support with type-checking rules that catch real bugs
- **Performance Focused**: Rules selected and configured for minimal impact on lint speed
- **Cross-Environment Compatible**: Works seamlessly across browsers, Node.js, and React Native
- **Team-Friendly**: Designed for multi-developer teams with rules that encourage maintainable code
- **Industry Aligned**: Based on patterns used by top tech companies and popular open-source projects

## Installation

```bash
npm install --save-dev eslint-config-styleguidejs
```

## Usage

### ESLint v10 (Flat Config)

Create an `eslint.config.js` file in your project root:

```js
import styleguidejs from 'eslint-config-styleguidejs';

export default [
  ...styleguidejs,
  // Your custom configurations here
];
```

### TypeScript Support

For TypeScript projects, you can use the TypeScript-specific configuration:

```js
import { typescriptConfig } from 'eslint-config-styleguidejs';

export default [
  ...typescriptConfig,
  // Your custom configurations here
];
```

This configuration includes:

- TypeScript-specific rules that leverage type information
- Automatic project service integration for efficient type checking
- Proper spacing and formatting for type annotations
- Consistent naming conventions for TypeScript constructs
- Smart rules that adapt to TypeScript's unique features

Make sure you have a `tsconfig.json` file in your project root. The TypeScript rules will automatically use it.

### ES Modules Import

This package uses ES Modules. If you're using ESM in your project, you can import it in multiple ways:

```js
// Method 1: Default import (gives you the base config array)
import styleguidejs from 'eslint-config-styleguidejs';

// You can access the TypeScript config as a property
const { typescriptConfig } = styleguidejs;

// Method 2: Named imports
import { config, typescriptConfig } from 'eslint-config-styleguidejs';

// Method 3: Import specific configs
import { typescriptConfig } from 'eslint-config-styleguidejs';
```

### ESLint v10 Compatibility

This package is fully compatible with ESLint v10 and uses the flat config format. Third-party plugin namespaces with v10 gaps were replaced by in-repo local plugins:

- `@stylistic/eslint-plugin` for stylistic rules (replaces the deprecated `@typescript-eslint/eslint-plugin` stylistic rules)
- `typescript-eslint` v8 for TypeScript support
- `@vitest/eslint-plugin` for Vitest test rule support
- Local `import/*` rules (`plugins/styleguide-v10-plugins.js`)
- Local `react/*` rules (`plugins/styleguide-v10-plugins.js`)
- Local `react-hooks/*` rules (`plugins/styleguide-v10-plugins.js`)
- Local `react-native/*` plugin namespace (`plugins/styleguide-v10-plugins.js`)

### Audit Supported Rules

Run the built-in support audit to verify every enabled rule resolves under ESLint v10:

```bash
npm run audit:v10
```

The report is written to `reports/eslint-v10-support.json`.

Current local rule coverage in `plugins/styleguide-v10-plugins.js`:

- Implemented with active checks: `import/extensions`, `import/first`, `import/newline-after-import`, `import/no-absolute-path`, `import/no-duplicates`, `import/no-extraneous-dependencies`, `import/no-mutable-exports`, `import/no-self-import`, `import/no-useless-path-segments`, `react/jsx-no-undef`, `react/jsx-sort-props`, `react/no-did-mount-set-state`, `react/no-did-update-set-state`, `react/no-unknown-property`, `react/self-closing-comp`, `react-hooks/rules-of-hooks`
- Compatibility placeholders (non-reporting): remaining configured `import/*`, `react/*`, and `react-hooks/exhaustive-deps` rules that require deeper cross-file/framework analysis

### Import Extensions

The `import/extensions` rule is configured to always require file extensions for the following file types:

- JavaScript files (`.js`, `.jsx`)
- TypeScript files (`.ts`, `.tsx`)
- CSS files (`.css`)
- JSON files (`.json`)
- SVG files (`.svg`)
- Type files (`.types`)

This helps ensure consistent import statements across your codebase.

## Feature Highlights

### Code Quality

- **Prevent Common Errors**: Catch bugs before they happen with rules that identify problematic patterns
- **Enforce Best Practices**: Promote patterns that lead to maintainable, readable code
- **Type Safety**: Leverage TypeScript's type system to catch errors at lint time

**[Deep Dive into Our Best Practices](./BEST_PRACTICES.md)** – Learn how our rules are scientifically designed to reduce cognitive load and improve code comprehension through psychological principles of visual perception and mental processing.

### Developer Experience

- **Readability First**: Rules optimized for code readability and scan-ability
- **Consistent Formatting**: Standardized spacing, indentation, and structure
- **Import Organization**: Automatic sorting and grouping of imports
- **Modern Syntax**: Encourages ES6+ features and patterns

### Framework Support

- **React & React Native**: Specialized rules for React and React Native development
- **Vitest Testing**: Support for Vitest test files with appropriate rule adjustments
- **Node.js**: Server-side specific rules and globals

### Team Collaboration

- **Optimized for Pull Requests**: Line length limits (`max-len`) and style rules that make diffs more readable
- **Consistent Across Environments**: Same rules work in VS Code, GitHub, and CI environments
- **Clear Error Messages**: Helpful, actionable lint messages that explain the "why"

## Extending or Overriding Rules

To extend or override rules, add your custom configuration after the default one:

```js
import styleguidejs from 'eslint-config-styleguidejs';

export default [
  ...styleguidejs,
  {
    rules: {
      // Your custom rules here
      'no-console': 'off',
    },
  },
];
```

## Recommended Editor Setup

For the best experience, we recommend using Visual Studio Code with the ESLint extension:

1. Install the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. Add these settings to your VS Code configuration:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "json",
    "jsonc"
  ]
}
```

## Contributing

We welcome contributions! Please feel free to submit a PR or open an issue.

## License

MIT
