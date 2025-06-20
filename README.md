# eslint-config-styleguidejs

JavaScript and TypeScript Style Guide ESLint Configuration using ESLint v9's flat config format.

## Installation

```bash
npm install --save-dev eslint-config-styleguidejs
```

## Usage

### ESLint v9 (Flat Config)

Create an `eslint.config.js` file in your project root:

```js
import styleguidejs from 'eslint-config-styleguidejs';

export default [
  ...styleguidejs,
  // Your custom configurations here
];
```

### Features

- Full support for JavaScript and TypeScript
- React and React Native rules
- Jest testing support
- Import sorting and organization
- Consistent code style enforcement
- Modern ES6+ best practices

### TypeScript Support

For TypeScript projects, make sure you have a `tsconfig.json` file in your project root. The TypeScript rules will automatically use it.

### Extending or Overriding Rules

You can extend or override the default rules by adding your own configurations:

```js
import styleguidejs from 'eslint-config-styleguidejs';

export default [
  ...styleguidejs,
  {
    rules: {
      // Your custom rule overrides
      'no-console': 'error',
      'max-len': ['error', { code: 100 }]
    }
  }
];
```

## ESLint v9 Compatibility

This configuration uses ESLint v9's flat config format and is compatible with ESLint v9.2+. It leverages the `@eslint/compat` package to ensure compatibility with plugins that haven't been fully updated to ESLint v9 yet.

## License

MIT