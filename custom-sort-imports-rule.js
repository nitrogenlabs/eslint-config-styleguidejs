/**
 * Custom ESLint rule for sorting imports with grouping and type-aware ordering.
 * Inspired by eslint-plugin-perfectionist's sort-imports rule but embedded locally
 * and adjusted so type imports respect external/internal/relative grouping.
 *
 * Group order (top to bottom):
 * 1. value-builtin (Node builtins, including node: prefix)
 * 2. value-external (packages)
 * 3. value-internal (matches internalPattern)
 * 4. value-parent (../foo)
 * 5. value-sibling (./foo)
 * 6. value-index (./ or ./index.*)
 * 7. type-builtin
 * 8. type-external
 * 9. type-internal
 * 10. type-parent
 * 11. type-sibling
 * 12. type-index
 */

import {createRequire} from 'module';

const require = createRequire(import.meta.url);

const customSortImportsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort imports with external before internal/relative, preserving type grouping',
      category: 'Stylistic Issues'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          ignoreCase: {type: 'boolean'},
          internalPattern: {
            type: 'array',
            items: {type: 'string'}
          },
          newlinesBetween: {
            enum: ['ignore', 'always', 'never']
          }
        }
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const {
      ignoreCase = true,
      internalPattern = ['^~/.+', '^@/.+'],
      newlinesBetween = 'ignore' // currently informational; we do not insert blank lines
    } = options;

    const sourceCode = context.sourceCode || context.getSourceCode();
    const internalPatterns = internalPattern.map((p) => new RegExp(p));

    // Builtin module detection (supports "node:" prefix and legacy names)
    const builtinModules = new Set(
      require('module').builtinModules.flatMap((m) => [m, `node:${m}`])
    );

    const isBuiltin = (source) => builtinModules.has(source);

    function getImportGroup(source, isType) {
      const relative = source.startsWith('.');
      const internal = internalPatterns.some((pattern) => pattern.test(source));
      const builtin = isBuiltin(source);

      if (relative) {
        const isIndex =
          source === './' ||
          source === './index' ||
          source === './index.js' ||
          source === './index.jsx' ||
          source === './index.ts' ||
          source === './index.tsx';

        if (isIndex) return isType ? 'type-index' : 'index';
        if (source.startsWith('../')) return isType ? 'type-parent' : 'parent';
        return isType ? 'type-sibling' : 'sibling';
      }

      if (builtin) return isType ? 'type-builtin' : 'builtin';
      if (internal) return isType ? 'type-internal' : 'internal';
      return isType ? 'type-external' : 'external';
    }

    const groupOrder = {
      builtin: 0,
      external: 1,
      internal: 2,
      parent: 3,
      sibling: 4,
      index: 5,
      'type-builtin': 6,
      'type-external': 7,
      'type-internal': 8,
      'type-parent': 9,
      'type-sibling': 10,
      'type-index': 11
    };

    const compareImportSources = (a, b) => {
      const left = ignoreCase ? a.toLowerCase() : a;
      const right = ignoreCase ? b.toLowerCase() : b;
      return left.localeCompare(right);
    };

    const importNodes = [];

    return {
      ImportDeclaration(node) {
        importNodes.push(node);
      },

      'Program:exit'() {
        if (importNodes.length < 2) return;

        const grouped = {
          builtin: [],
          external: [],
          internal: [],
          parent: [],
          sibling: [],
          index: [],
          'type-builtin': [],
          'type-external': [],
          'type-internal': [],
          'type-parent': [],
          'type-sibling': [],
          'type-index': []
        };

        for (const node of importNodes) {
          const source = node.source.value;
          const isType = node.importKind === 'type';
          const group = getImportGroup(source, isType);
          grouped[group].push({node, source});
        }

        // Sort within each group alphabetically by source path
        for (const key of Object.keys(grouped)) {
          grouped[key].sort((a, b) => compareImportSources(a.source, b.source));
        }

        // Build expected order by group precedence
        const expectedOrder = [];
        for (const key of Object.keys(groupOrder).sort((a, b) => groupOrder[a] - groupOrder[b])) {
          expectedOrder.push(...grouped[key].map((item) => item.node));
        }

        // If order already matches, nothing to do
        let differs = false;
        for (let i = 0; i < importNodes.length; i += 1) {
          if (importNodes[i] !== expectedOrder[i]) {
            differs = true;
            break;
          }
        }
        if (!differs) return;

        const firstImport = importNodes[0];
        const lastImport = importNodes[importNodes.length - 1];

        const expectedCode = expectedOrder.map((n) => sourceCode.getText(n)).join('\n');

        context.report({
          node: firstImport,
          message:
            'Imports are not sorted correctly. Expected builtin -> external -> internal -> parent -> sibling -> index, then the same order for type imports.',
          fix(fixer) {
            return fixer.replaceTextRange(
              [firstImport.range[0], lastImport.range[1]],
              expectedCode
            );
          }
        });
      }
    };
  }
};

export default customSortImportsRule;
