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

Import sorting reports the configured module order and newline grouping. Automatic
sorting is limited to contiguous specifier imports separated only by whitespace.
Spans containing executable statements, side-effect-only imports, or comments
inside or attached to imports require manual ordering. The fixer leaves these
spans intact to preserve initialization, side-effect order, and comment/directive
ownership; already ordered unsafe spans do not receive whitespace-only reports.

### Preserve intentional runtime import order

`custom-sort/sort-imports` accepts the boolean `preserveRuntimeOrder` option
(default `false`). Set it for files whose imports intentionally evaluate in source
order. Named imports can execute module initialization and can fail before later
modules evaluate, just as bare side-effect imports can.

With this option, every declaration except explicit `import type` stays in its
original relative order in one runtime block. Mixed imports, including
`import {type T, value}`, and `import {type T}` remain in that block; the rule does
not infer erasure from usage or rearrange their specifiers. Explicit `import type`
declarations follow the runtime block, sorted by the existing external, builtin,
internal, parent, sibling, and index groups.

For example, append this file-scoped override object after the shared configuration
in your existing flat-config array. It retains the configuration's existing
`ignoreCase`, `internalPattern`, and `newlinesBetween` values:

```json
{
  "files": ["src/startup.js"],
  "rules": {
    "custom-sort/sort-imports": ["error", {
      "ignoreCase": true,
      "internalPattern": ["^~/.+"],
      "newlinesBetween": "always",
      "preserveRuntimeOrder": true
    }]
  }
}
```

`newlinesBetween: 'always'` requires one newline inside the runtime block and a
blank line before the type block; `'never'` uses one newline throughout. `'ignore'`
leaves spacing alone when the order is correct. The existing safe-fix boundaries
still apply: comments/directives, bare imports, or interleaved statements leave
the entire import span byte-for-byte intact. Such spans report only an actual
remaining order mismatch (for example, misplaced type imports), never spacing
alone. Other lint rules remain active. This option preserves declaration order;
it does not establish application startup correctness.

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

Projects may use TypeScript 7 or newer for compilation. Until `typescript-eslint` supports the TypeScript 7 native
compiler API, this package keeps its lint parser on an isolated TypeScript 6 compatibility runtime. The compatibility
runtime does not change the TypeScript version used by your project or its build commands.

This repository uses TypeScript 7.0.2 for compilation through the development dependency
`@typescript/native` (`npm:typescript@7.0.2`). Run `npm run typecheck` to check the TypeScript fixture with
that compiler. The command explicitly selects the native compiler because both TypeScript versions provide a
`tsc` executable. The published lint runtime stays pinned to TypeScript 6.0.3 with `typescript-eslint` 8.71.0,
whose supported TypeScript range is `>=4.8.4 <6.1.0`.

The published package explicitly bundles ESLint and the Vitest ESLint plugin with the TypeScript lint runtime.
npm can otherwise classify ESLint as bundled through the parser's peer dependencies
without including it in the archive, leaving consumers with a different root ESLint
missing the required runtime. Bundling adds roughly 2 MB compressed and preserves
the package's exact ESLint version alongside the consumer's ESLint and TypeScript.
The Vitest plugin shares the parser's TypeScript-ESLint dependencies; bundling its
locked closure prevents fresh transitive versions from conflicting with the
isolated parser's bundled dependencies.

Run `npm run test:package` for the archive installation regression through Lex's
Vitest runner. It packs the real package, installs clean ESLint 10.12.0 and 10.13.0
consumers with TypeScript 7.0.2, runs `npm ci` and dependency graph checks, and lints
clean and invalid typed fixtures through the public configuration. npm and Node
must be available on PATH. Set `STYLEGUIDE_PACKAGE_OFFLINE=1` to require cached
dependencies; missing cache entries fail the test. To qualify an existing immutable
archive instead of packing, set `STYLEGUIDE_PACKAGE_ARCHIVE` to its path. The runner
prints a temporary evidence directory containing the archive and process logs.

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

### React Hooks Classifier Regression Tests

Run `npm run test:hooks` for the public-config JavaScript/TSX hook classifier regressions.
The development dependency on Lex supplies Vitest and its matching coverage provider; no separate
test runner dependency is required. Run
`npm run test:hooks -- --collectCoverageFrom plugins/react-hooks-rules.js` to enforce 90% coverage
for the focused hook-rule implementation. This coverage boundary does not represent coverage of
the other local rules. The existing `npm test` command continues to validate TypeScript fixtures
and configured rule support.

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
