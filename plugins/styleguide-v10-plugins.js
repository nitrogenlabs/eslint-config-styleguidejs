import fs from 'node:fs';
import path from 'node:path';
import {builtinModules} from 'node:module';

const builtinModuleSet = new Set(builtinModules.flatMap((name) => [name, `node:${name}`]));

function createNoopRule(description) {
  return {
    meta: {
      type: 'suggestion',
      docs: {description},
      schema: []
    },
    create() {
      return {};
    }
  };
}

function getLintedFilePath(context) {
  const filename = context.physicalFilename || context.filename || context.getFilename?.();
  if(!filename || filename === '<input>' || filename === '<text>') {
    return null;
  }

  return path.resolve(filename);
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function stripQueryAndHash(source) {
  return source.split('?')[0].split('#')[0];
}

function getImportSource(node) {
  return node?.source?.value && typeof node.source.value === 'string'
    ? stripQueryAndHash(node.source.value)
    : null;
}

function isBareModuleSpecifier(source) {
  return source && !source.startsWith('.') && !source.startsWith('/');
}

function isAbsoluteImport(source) {
  return source.startsWith('/') || /^[A-Za-z]:[\\/]/u.test(source);
}

function getPackageName(moduleSpecifier) {
  if(moduleSpecifier.startsWith('@')) {
    const parts = moduleSpecifier.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : moduleSpecifier;
  }

  return moduleSpecifier.split('/')[0];
}

function resolveImportToFile(fromFile, source) {
  if(!fromFile || !source || (!source.startsWith('.') && !isAbsoluteImport(source))) {
    return null;
  }

  const raw = source.startsWith('.')
    ? path.resolve(path.dirname(fromFile), source)
    : path.resolve(source);

  const tryPaths = [
    raw,
    `${raw}.js`,
    `${raw}.jsx`,
    `${raw}.ts`,
    `${raw}.tsx`,
    `${raw}.mjs`,
    `${raw}.cjs`,
    `${raw}.json`,
    path.join(raw, 'index.js'),
    path.join(raw, 'index.jsx'),
    path.join(raw, 'index.ts'),
    path.join(raw, 'index.tsx'),
    path.join(raw, 'index.mjs'),
    path.join(raw, 'index.cjs')
  ];

  for(const candidate of tryPaths) {
    if(fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.resolve(candidate);
    }
  }

  return path.resolve(raw);
}

function findNearestPackageJson(filePath) {
  if(!filePath) {
    return null;
  }

  let currentDir = path.dirname(filePath);

  while(true) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if(fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }

    const parentDir = path.dirname(currentDir);
    if(parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

const packageJsonCache = new Map();

function loadPackageJson(packageJsonPath) {
  if(!packageJsonPath) {
    return null;
  }

  if(packageJsonCache.has(packageJsonPath)) {
    return packageJsonCache.get(packageJsonPath);
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJsonCache.set(packageJsonPath, parsed);
    return parsed;
  } catch {
    packageJsonCache.set(packageJsonPath, null);
    return null;
  }
}

function isDefinedInScope(name, scope) {
  let current = scope;

  while(current) {
    if(current.set?.has(name)) {
      return true;
    }
    current = current.upper;
  }

  return false;
}

function getScopeForNode(context, node) {
  const sourceCode = context.sourceCode || context.getSourceCode?.();

  if(sourceCode?.getScope) {
    return sourceCode.getScope(node);
  }

  if(context.getScope) {
    return context.getScope();
  }

  return null;
}

function getAncestorsForNode(context, node) {
  const sourceCode = context.sourceCode || context.getSourceCode?.();

  if(sourceCode?.getAncestors) {
    return sourceCode.getAncestors(node);
  }

  if(context.getAncestors) {
    return context.getAncestors();
  }

  return [];
}

const importRules = {
  default: createNoopRule('Compatibility placeholder for import/default.'),
  export: createNoopRule('Compatibility placeholder for import/export.'),
  'exports-last': createNoopRule('Compatibility placeholder for import/exports-last.'),
  named: createNoopRule('Compatibility placeholder for import/named.'),
  'no-cycle': createNoopRule('Compatibility placeholder for import/no-cycle.'),
  'no-deprecated': createNoopRule('Compatibility placeholder for import/no-deprecated.'),
  'no-internal-modules': createNoopRule('Compatibility placeholder for import/no-internal-modules.'),
  'no-named-as-default': createNoopRule('Compatibility placeholder for import/no-named-as-default.'),
  'no-named-as-default-member': createNoopRule('Compatibility placeholder for import/no-named-as-default-member.'),
  'no-unresolved': createNoopRule('Compatibility placeholder for import/no-unresolved.'),
  'no-webpack-loader-syntax': createNoopRule('Compatibility placeholder for import/no-webpack-loader-syntax.'),
  order: createNoopRule('Compatibility placeholder for import/order.'),
  'prefer-default-export': createNoopRule('Compatibility placeholder for import/prefer-default-export.'),

  extensions: {
    meta: {
      type: 'problem',
      docs: {description: 'Enforce or disallow import file extensions.'},
      schema: [
        {enum: ['always', 'never', 'ignorePackages']},
        {
          type: 'object',
          additionalProperties: {
            enum: ['always', 'never', 'alwaysIgnorePackages', 'neverIgnorePackages']
          }
        }
      ]
    },
    create(context) {
      const [mode = 'never', extensionConfig = {}] = context.options;
      const filePath = getLintedFilePath(context);

      function getRuleForExtension(extension, isPackageImport) {
        const normalizedExt = extension.replace(/^\./u, '');
        const configured = extensionConfig[normalizedExt];

        if(configured === 'alwaysIgnorePackages') {
          return isPackageImport ? 'ignore' : 'always';
        }

        if(configured === 'neverIgnorePackages') {
          return isPackageImport ? 'ignore' : 'never';
        }

        if(configured === 'always' || configured === 'never') {
          return configured;
        }

        if(mode === 'ignorePackages' && isPackageImport) {
          return 'ignore';
        }

        return mode === 'always' ? 'always' : 'never';
      }

      function resolveMissingExtensionRule(source) {
        if(!filePath || !source.startsWith('.')) {
          return null;
        }

        const resolvedBase = path.resolve(path.dirname(filePath), source);
        const candidates = [
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.mjs',
          '.cjs',
          '.json',
          '.css',
          '.svg',
          '.types'
        ];

        for(const extension of candidates) {
          const candidate = `${resolvedBase}${extension}`;
          if(fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return getRuleForExtension(extension, false);
          }
        }

        return null;
      }

      function check(node) {
        const source = getImportSource(node);
        if(!source) {
          return;
        }

        const isPackageImport = isBareModuleSpecifier(source);
        const extension = path.extname(source);

        if(extension) {
          const extensionRule = getRuleForExtension(extension, isPackageImport);

          if(extensionRule === 'never') {
            context.report({
              node: node.source,
              message: `Unexpected file extension "${extension}" for import "${source}".`
            });
          }

          return;
        }

        const inferredRule = resolveMissingExtensionRule(source);
        const extensionRule = inferredRule || getRuleForExtension('', isPackageImport);

        if(extensionRule === 'always') {
          context.report({
            node: node.source,
            message: `Missing file extension for import "${source}".`
          });
        }
      }

      return {
        ExportAllDeclaration: check,
        ExportNamedDeclaration(node) {
          if(node.source) {
            check(node);
          }
        },
        ImportDeclaration: check
      };
    }
  },

  first: {
    meta: {
      type: 'suggestion',
      docs: {description: 'Ensure all imports appear before non-import statements.'},
      schema: []
    },
    create(context) {
      return {
        Program(node) {
          let hasSeenNonImport = false;

          for(const statement of node.body) {
            if(statement.type === 'ImportDeclaration') {
              if(hasSeenNonImport) {
                context.report({
                  node: statement,
                  message: 'Import statements must appear before other statements.'
                });
              }
              continue;
            }

            if(statement.type === 'ExpressionStatement' && statement.directive) {
              continue;
            }

            hasSeenNonImport = true;
          }
        }
      };
    }
  },

  'newline-after-import': {
    meta: {
      type: 'layout',
      docs: {description: 'Require a newline after the final import declaration.'},
      schema: []
    },
    create(context) {
      const sourceCode = context.sourceCode || context.getSourceCode();

      return {
        Program(node) {
          const imports = node.body.filter((statement) => statement.type === 'ImportDeclaration');
          if(imports.length === 0) {
            return;
          }

          const lastImport = imports[imports.length - 1];
          const nextStatement = node.body[node.body.indexOf(lastImport) + 1];
          if(!nextStatement) {
            return;
          }

          const lastImportLastToken = sourceCode.getLastToken(lastImport);
          const nextStatementFirstToken = sourceCode.getFirstToken(nextStatement);

          if(!lastImportLastToken || !nextStatementFirstToken) {
            return;
          }

          if(nextStatementFirstToken.loc.start.line === lastImportLastToken.loc.end.line + 1) {
            context.report({
              node: nextStatement,
              message: 'Expected one blank line after the final import statement.'
            });
          }
        }
      };
    }
  },

  'no-absolute-path': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow absolute import paths.'},
      schema: []
    },
    create(context) {
      function check(node) {
        const source = getImportSource(node);
        if(!source) {
          return;
        }

        if(isAbsoluteImport(source)) {
          context.report({
            node: node.source,
            message: `Absolute import path "${source}" is not allowed.`
          });
        }
      }

      return {
        ExportAllDeclaration: check,
        ExportNamedDeclaration(node) {
          if(node.source) {
            check(node);
          }
        },
        ImportDeclaration: check
      };
    }
  },

  'no-duplicates': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow duplicate imports from the same module.'},
      schema: []
    },
    create(context) {
      const seenSources = new Map();

      return {
        ImportDeclaration(node) {
          const source = getImportSource(node);
          if(!source) {
            return;
          }

          const importKind = node.importKind || 'value';
          const seenKinds = seenSources.get(source) || new Set();
          const hasExactKind = seenKinds.has(importKind);
          const hasBothKinds = seenKinds.has('type') && seenKinds.has('value');

          if(hasExactKind || (hasBothKinds && seenKinds.size > 1)) {
            context.report({
              node: node.source,
              message: `Duplicate import from "${source}".`
            });
            return;
          }

          seenKinds.add(importKind);
          seenSources.set(source, seenKinds);
        }
      };
    }
  },

  'no-extraneous-dependencies': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow imports from packages not listed in dependencies.'},
      schema: [
        {
          type: 'object',
          additionalProperties: true,
          properties: {
            devDependencies: {
              anyOf: [
                {type: 'boolean'},
                {type: 'array', items: {type: 'string'}}
              ]
            },
            optionalDependencies: {type: 'boolean'},
            peerDependencies: {type: 'boolean'}
          }
        }
      ]
    },
    create(context) {
      const options = context.options[0] || {};
      const lintedFilePath = getLintedFilePath(context);
      const packageJsonPath = findNearestPackageJson(lintedFilePath);
      const packageData = loadPackageJson(packageJsonPath);
      const packageRoot = packageJsonPath ? path.dirname(packageJsonPath) : process.cwd();

      if(!packageData) {
        return {};
      }

      const dependencies = packageData.dependencies || {};
      const devDependencies = packageData.devDependencies || {};
      const peerDependencies = packageData.peerDependencies || {};
      const optionalDependencies = packageData.optionalDependencies || {};

      const devDependencyOption = options.devDependencies;
      const allowPeerDependencies = options.peerDependencies !== false;
      const allowOptionalDependencies = options.optionalDependencies !== false;
      const nodeModulesRoot = path.join(packageRoot, 'node_modules');

      function isAllowedDevDependency(importingFile) {
        if(devDependencyOption === true) {
          return true;
        }

        if(devDependencyOption === false || devDependencyOption == null) {
          return false;
        }

        if(!Array.isArray(devDependencyOption)) {
          return false;
        }

        const absolutePath = importingFile ? normalizePath(path.resolve(importingFile)) : '';
        const relativePath = importingFile
          ? normalizePath(path.relative(packageRoot, importingFile))
          : '';

        return devDependencyOption.some((pattern) => (
          path.matchesGlob(absolutePath, pattern) || path.matchesGlob(relativePath, pattern)
        ));
      }

      return {
        ImportDeclaration(node) {
          const source = getImportSource(node);
          if(!source || builtinModuleSet.has(source) || !isBareModuleSpecifier(source)) {
            return;
          }

          const packageName = getPackageName(source);
          const packagePath = packageName.startsWith('@')
            ? path.join(nodeModulesRoot, ...packageName.split('/'))
            : path.join(nodeModulesRoot, packageName);

          if(!fs.existsSync(packagePath)) {
            return;
          }

          if(dependencies[packageName]) {
            return;
          }

          if(allowPeerDependencies && peerDependencies[packageName]) {
            return;
          }

          if(allowOptionalDependencies && optionalDependencies[packageName]) {
            return;
          }

          if(devDependencies[packageName] && isAllowedDevDependency(lintedFilePath)) {
            return;
          }

          context.report({
            node: node.source,
            message: `Package "${packageName}" should be listed in dependencies (or allowed devDependencies) to import "${source}".`
          });
        }
      };
    }
  },

  'no-mutable-exports': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow mutable exports.'},
      schema: []
    },
    create(context) {
      return {
        ExportNamedDeclaration(node) {
          if(node.declaration?.type !== 'VariableDeclaration') {
            return;
          }

          if(node.declaration.kind === 'const') {
            return;
          }

          context.report({
            node,
            message: `Unexpected mutable export using "${node.declaration.kind}".`
          });
        }
      };
    }
  },

  'no-self-import': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow importing the current file.'},
      schema: []
    },
    create(context) {
      const currentFile = getLintedFilePath(context);

      if(!currentFile) {
        return {};
      }

      function check(node) {
        const source = getImportSource(node);
        if(!source || (!source.startsWith('.') && !isAbsoluteImport(source))) {
          return;
        }

        const importedFile = resolveImportToFile(currentFile, source);
        if(!importedFile) {
          return;
        }

        if(path.resolve(importedFile) === path.resolve(currentFile)) {
          context.report({
            node: node.source,
            message: 'Module should not import itself.'
          });
        }
      }

      return {
        ImportDeclaration: check
      };
    }
  },

  'no-useless-path-segments': {
    meta: {
      type: 'suggestion',
      docs: {description: 'Disallow unnecessary path segments in import paths.'},
      schema: []
    },
    create(context) {
      function check(node) {
        const source = getImportSource(node);
        if(!source || !source.startsWith('.')) {
          return;
        }

        const normalized = path.posix.normalize(source);
        const comparableNormalized =
          source.startsWith('./') &&
          !normalized.startsWith('./') &&
          !normalized.startsWith('../')
            ? `./${normalized}`
            : normalized;

        if(comparableNormalized !== source && comparableNormalized !== `${source}/`) {
          context.report({
            node: node.source,
            message: `Import path "${source}" contains unnecessary path segments.`
          });
        }
      }

      return {
        ExportAllDeclaration: check,
        ExportNamedDeclaration(node) {
          if(node.source) {
            check(node);
          }
        },
        ImportDeclaration: check
      };
    }
  }
};

function getJsxTagRootName(nodeName) {
  if(nodeName.type === 'JSXIdentifier') {
    return nodeName.name;
  }

  if(nodeName.type === 'JSXMemberExpression') {
    return getJsxTagRootName(nodeName.object);
  }

  if(nodeName.type === 'JSXNamespacedName') {
    return nodeName.namespace.name;
  }

  return null;
}

function getJsxAttributeName(attributeNode) {
  if(attributeNode.type !== 'JSXAttribute') {
    return null;
  }

  if(attributeNode.name?.type === 'JSXIdentifier') {
    return attributeNode.name.name;
  }

  return null;
}

const reactRules = {
  'display-name': createNoopRule('Compatibility placeholder for react/display-name.'),
  'jsx-boolean-value': createNoopRule('Compatibility placeholder for react/jsx-boolean-value.'),
  'jsx-uses-react': createNoopRule('Compatibility placeholder for react/jsx-uses-react.'),
  'jsx-uses-vars': createNoopRule('Compatibility placeholder for react/jsx-uses-vars.'),
  'jsx-wrap-multilines': createNoopRule('Compatibility placeholder for react/jsx-wrap-multilines.'),
  'no-multi-comp': createNoopRule('Compatibility placeholder for react/no-multi-comp.'),
  'prop-types': createNoopRule('Compatibility placeholder for react/prop-types.'),
  'react-in-jsx-scope': createNoopRule('Compatibility placeholder for react/react-in-jsx-scope.'),

  'jsx-no-undef': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow undefined components in JSX.'},
      schema: []
    },
    create(context) {
      return {
        JSXOpeningElement(node) {
          const componentName = getJsxTagRootName(node.name);

          if(!componentName || /^[a-z]/u.test(componentName)) {
            return;
          }

          if(componentName === 'Fragment') {
            return;
          }

          const scope = getScopeForNode(context, node);
          if(scope && isDefinedInScope(componentName, scope)) {
            return;
          }

          context.report({
            node,
            message: `"${componentName}" is not defined in scope.`
          });
        }
      };
    }
  },

  'jsx-sort-props': {
    meta: {
      type: 'suggestion',
      docs: {description: 'Enforce sorted JSX props.'},
      schema: [
        {
          type: 'object',
          additionalProperties: true,
          properties: {
            ignoreCase: {type: 'boolean'}
          }
        }
      ]
    },
    create(context) {
      const options = context.options[0] || {};
      const ignoreCase = options.ignoreCase === true;

      function normalize(name) {
        return ignoreCase ? name.toLowerCase() : name;
      }

      return {
        JSXOpeningElement(node) {
          const attributes = node.attributes
            .filter((attribute) => attribute.type === 'JSXAttribute')
            .map((attribute) => ({
              node: attribute,
              name: getJsxAttributeName(attribute)
            }))
            .filter((entry) => entry.name);

          for(let index = 1; index < attributes.length; index += 1) {
            const previous = attributes[index - 1];
            const current = attributes[index];

            if(normalize(previous.name) > normalize(current.name)) {
              context.report({
                node: current.node,
                message: `JSX prop "${current.name}" should be sorted before "${previous.name}".`
              });
              return;
            }
          }
        }
      };
    }
  },

  'no-did-mount-set-state': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow setState in componentDidMount.'},
      schema: []
    },
    create(context) {
      return {
        "MethodDefinition[key.name='componentDidMount'] CallExpression[callee.object.type='ThisExpression'][callee.property.name='setState']"(node) {
          context.report({
            node,
            message: 'Do not use this.setState() in componentDidMount.'
          });
        }
      };
    }
  },

  'no-did-update-set-state': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow setState in componentDidUpdate.'},
      schema: []
    },
    create(context) {
      return {
        "MethodDefinition[key.name='componentDidUpdate'] CallExpression[callee.object.type='ThisExpression'][callee.property.name='setState']"(node) {
          context.report({
            node,
            message: 'Do not use this.setState() in componentDidUpdate.'
          });
        }
      };
    }
  },

  'no-unknown-property': {
    meta: {
      type: 'problem',
      docs: {description: 'Disallow invalid JSX DOM property names.'},
      schema: []
    },
    create(context) {
      const knownAliases = {
        class: 'className',
        for: 'htmlFor',
        tabindex: 'tabIndex'
      };

      return {
        JSXAttribute(node) {
          const attrName = getJsxAttributeName(node);
          if(!attrName) {
            return;
          }

          if(attrName.startsWith('data-') || attrName.startsWith('aria-')) {
            return;
          }

          const replacement = knownAliases[attrName.toLowerCase()];
          if(replacement) {
            context.report({
              node,
              message: `Unknown JSX property "${attrName}". Did you mean "${replacement}"?`
            });
          }
        }
      };
    }
  },

  'self-closing-comp': {
    meta: {
      type: 'suggestion',
      docs: {description: 'Enforce self-closing syntax for components without children.'},
      schema: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            component: {type: 'boolean'},
            html: {type: 'boolean'}
          }
        }
      ]
    },
    create(context) {
      const options = context.options[0] || {};
      const enforceComponent = options.component !== false;
      const enforceHtml = options.html === true;

      function hasMeaningfulChildren(node) {
        return node.children.some((child) => {
          if(child.type === 'JSXText') {
            return child.value.trim().length > 0;
          }

          if(child.type === 'JSXExpressionContainer') {
            return child.expression?.type !== 'JSXEmptyExpression';
          }

          return true;
        });
      }

      return {
        JSXElement(node) {
          if(node.openingElement.selfClosing || hasMeaningfulChildren(node)) {
            return;
          }

          const tagName = getJsxTagRootName(node.openingElement.name);
          if(!tagName) {
            return;
          }

          const isComponent = /^[A-Z]/u.test(tagName);

          if((isComponent && !enforceComponent) || (!isComponent && !enforceHtml)) {
            return;
          }

          context.report({
            node: node.openingElement,
            message: `${tagName} has no children and should be self-closing.`
          });
        }
      };
    }
  }
};

function getFunctionName(node, ancestors) {
  if(node.id?.type === 'Identifier') {
    return node.id.name;
  }

  const parent = ancestors[ancestors.length - 1];
  if(!parent) {
    return null;
  }

  if(parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
    return parent.id.name;
  }

  if(parent.type === 'AssignmentExpression' && parent.left.type === 'Identifier') {
    return parent.left.name;
  }

  if(parent.type === 'Property' && parent.key.type === 'Identifier') {
    return parent.key.name;
  }

  if(parent.type === 'MethodDefinition' && parent.key.type === 'Identifier') {
    return parent.key.name;
  }

  return null;
}

function isHookName(name) {
  return /^use[A-Z0-9]/u.test(name);
}

const reactHooksRules = {
  'exhaustive-deps': createNoopRule('Compatibility placeholder for react-hooks/exhaustive-deps.'),

  'rules-of-hooks': {
    meta: {
      type: 'problem',
      docs: {description: 'Enforce basic React Hooks usage constraints.'},
      schema: []
    },
    create(context) {
      return {
        CallExpression(node) {
          if(node.callee.type !== 'Identifier' || !isHookName(node.callee.name)) {
            return;
          }

          const ancestors = getAncestorsForNode(context, node);
          const functionAncestorIndex = [...ancestors].reverse().findIndex((ancestor) => (
            ancestor.type === 'FunctionDeclaration' ||
            ancestor.type === 'FunctionExpression' ||
            ancestor.type === 'ArrowFunctionExpression'
          ));

          if(functionAncestorIndex === -1) {
            context.report({
              node,
              message: `React Hook "${node.callee.name}" cannot be called at the top level.`
            });
            return;
          }

          const fnNode = ancestors[ancestors.length - 1 - functionAncestorIndex];
          const functionAncestors = ancestors.slice(0, ancestors.length - functionAncestorIndex);
          const functionName = getFunctionName(fnNode, functionAncestors);

          const isComponent = functionName ? /^[A-Z]/u.test(functionName) : false;
          const isCustomHook = functionName ? isHookName(functionName) : false;

          if(!isComponent && !isCustomHook) {
            context.report({
              node,
              message: `React Hook "${node.callee.name}" must be called in a React component or custom hook.`
            });
          }

          const disallowedAncestors = ancestors.filter((ancestor) => (
            ancestor.type === 'IfStatement' ||
            ancestor.type === 'ConditionalExpression' ||
            ancestor.type === 'ForStatement' ||
            ancestor.type === 'ForInStatement' ||
            ancestor.type === 'ForOfStatement' ||
            ancestor.type === 'WhileStatement' ||
            ancestor.type === 'DoWhileStatement' ||
            ancestor.type === 'SwitchCase' ||
            ancestor.type === 'TryStatement' ||
            ancestor.type === 'CatchClause'
          ));

          if(disallowedAncestors.length > 0) {
            context.report({
              node,
              message: `React Hook "${node.callee.name}" cannot be called conditionally.`
            });
          }
        }
      };
    }
  }
};

const reactNativePlugin = {
  meta: {
    name: 'eslint-plugin-react-native-local',
    version: '1.0.0'
  },
  rules: {}
};

function createPlugin(name, rules) {
  return {
    meta: {
      name,
      version: '1.0.0'
    },
    rules
  };
}

export const importPlugin = createPlugin('eslint-plugin-import-local', importRules);
export const reactPlugin = createPlugin('eslint-plugin-react-local', reactRules);
export const reactHooksPlugin = createPlugin('eslint-plugin-react-hooks-local', reactHooksRules);
export {reactNativePlugin};
