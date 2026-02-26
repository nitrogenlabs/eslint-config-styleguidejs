/**
 * Custom ESLint rule for sorting imports with grouping and type-aware ordering.
 * Inspired by eslint-plugin-perfectionist's sort-imports rule but embedded locally
 * and adjusted so type imports respect external/internal/relative grouping.
 *
 * Group order (top to bottom):
 * 1. value-external (packages)
 * 2. value-builtin (Node builtins, including node: prefix)
 * 3. value-internal (matches internalPattern)
 * 4. value-parent (../foo)
 * 5. value-sibling (./foo)
 * 6. value-index (./ or ./index.*)
 * 7. type-external
 * 8. type-builtin
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
      newlinesBetween = 'ignore'
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

    const groupMeta = {
      external: {
        block: 'value-absolute',
        order: 0
      },
      builtin: {
        block: 'value-absolute',
        order: 1
      },
      internal: {
        block: 'value-absolute',
        order: 2
      },
      parent: {
        block: 'value-relative',
        order: 3
      },
      sibling: {
        block: 'value-relative',
        order: 4
      },
      index: {
        block: 'value-relative',
        order: 5
      },
      'type-external': {
        block: 'type',
        order: 6
      },
      'type-builtin': {
        block: 'type',
        order: 7
      },
      'type-internal': {
        block: 'type',
        order: 8
      },
      'type-parent': {
        block: 'type',
        order: 9
      },
      'type-sibling': {
        block: 'type',
        order: 10
      },
      'type-index': {
        block: 'type',
        order: 11
      }
    };
    const orderedGroupKeys = Object.keys(groupMeta).sort(
      (a, b) => groupMeta[a].order - groupMeta[b].order
    );

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

        const grouped = Object.fromEntries(orderedGroupKeys.map((group) => [group, []]));

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
        for (const key of orderedGroupKeys) {
          expectedOrder.push(...grouped[key].map((item) => ({group: key, node: item.node})));
        }

        // Check order differences first
        let differs = false;
        for (let i = 0; i < importNodes.length; i += 1) {
          if (importNodes[i] !== expectedOrder[i].node) {
            differs = true;
            break;
          }
        }

        const firstImport = importNodes[0];
        const lastImport = importNodes[importNodes.length - 1];

        const expectedCodeParts = [];

        for(let index = 0; index < expectedOrder.length; index += 1) {
          const current = expectedOrder[index];
          const previous = expectedOrder[index - 1];

          if(index > 0) {
            if(newlinesBetween === 'always') {
              const previousBlock = groupMeta[previous.group].block;
              const currentBlock = groupMeta[current.group].block;
              expectedCodeParts.push(previousBlock === currentBlock ? '\n' : '\n\n');
            } else {
              expectedCodeParts.push('\n');
            }
          }

          expectedCodeParts.push(sourceCode.getText(current.node));
        }

        const expectedCode = expectedCodeParts.join('');
        const currentCode = sourceCode.text.slice(firstImport.range[0], lastImport.range[1]);

        if(newlinesBetween === 'ignore' && !differs) return;
        if(newlinesBetween !== 'ignore' && !differs && currentCode === expectedCode) return;

        context.report({
          node: firstImport,
          message:
            'Imports are not sorted correctly. Expected external -> builtin -> internal -> parent -> sibling -> index, then the same order for type imports.',
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
