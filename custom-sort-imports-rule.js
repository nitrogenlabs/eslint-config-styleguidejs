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

    const getImportGroup = (source, isType) => {
      const relative = source.startsWith('.');
      const internal = internalPatterns.some((pattern) => pattern.test(source));
      const builtin = isBuiltin(source);

      if(relative) {
        const isIndex =
          source === './' ||
          source === './index' ||
          source === './index.js' ||
          source === './index.jsx' ||
          source === './index.ts' ||
          source === './index.tsx';

        if(isIndex)         {
          return isType ? 'type-index' : 'index';
        }
        if(source.startsWith('../'))         {
          return isType ? 'type-parent' : 'parent';
        }
        return isType ? 'type-sibling' : 'sibling';
      }

      if(builtin)       {
        return isType ? 'type-builtin' : 'builtin';
      }
      if(internal)       {
        return isType ? 'type-internal' : 'internal';
      }
      return isType ? 'type-external' : 'external';
    };

    const groupMeta = {
      builtin: {
        block: 'value-absolute',
        order: 1
      },
      external: {
        block: 'value-absolute',
        order: 0
      },
      index: {
        block: 'value-relative',
        order: 5
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
      'type-builtin': {
        block: 'type',
        order: 7
      },
      'type-external': {
        block: 'type',
        order: 6
      },
      'type-index': {
        block: 'type',
        order: 11
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
      }
    };
    const orderedGroupKeys = Object.keys(groupMeta).sort(
      (a, b) => groupMeta[a].order - groupMeta[b].order
    );
    const orderedBlockKeys = ['value-absolute', 'value-relative', 'type'];

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
        if(importNodes.length < 2)         {
          return;
        }

        const grouped = Object.fromEntries(orderedGroupKeys.map((group) => [group, []]));
        const groupedByBlock = Object.fromEntries(orderedBlockKeys.map((block) => [block, []]));

        for(const node of importNodes) {
          const source = node.source.value;
          const isType = node.importKind === 'type';
          const group = getImportGroup(source, isType);
          grouped[group].push({node, source});
        }

        // Sort within each specific group first.
        for(const key of Object.keys(grouped)) {
          grouped[key].sort((a, b) => compareImportSources(a.source, b.source));
        }

        // Re-group by block and sort by import source so ordering is based on module path,
        // not imported identifier names, while still preserving high-level blocks.
        for(const key of orderedGroupKeys) {
          const {block} = groupMeta[key];
          groupedByBlock[block].push(...grouped[key].map((item) => ({group: key, ...item})));
        }

        for(const block of orderedBlockKeys) {
          groupedByBlock[block].sort((a, b) => {
            if(block === 'type') {
              const groupOrderDelta = groupMeta[a.group].order - groupMeta[b.group].order;
              if(groupOrderDelta !== 0) {
                return groupOrderDelta;
              }
            }

            return compareImportSources(a.source, b.source);
          });
        }

        const expectedOrder = [];
        for(const block of orderedBlockKeys) {
          expectedOrder.push(...groupedByBlock[block].map((item) => ({group: item.group, node: item.node})));
        }

        // Check order differences first
        let differs = false;
        for(let i = 0; i < importNodes.length; i += 1) {
          if(importNodes[i] !== expectedOrder[i].node) {
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

        if(newlinesBetween === 'ignore' && !differs)         {
          return;
        }
        if(newlinesBetween !== 'ignore' && !differs && currentCode === expectedCode)         {
          return;
        }

        context.report({
          fix(fixer) {
            return fixer.replaceTextRange(
              [firstImport.range[0], lastImport.range[1]],
              expectedCode
            );
          },
          message:
            'Imports are not sorted correctly. Expected absolute imports sorted by module path, then relative imports, then type imports.',
          node: firstImport
        });
      }
    };
  },
  meta: {
    docs: {
      category: 'Stylistic Issues',
      description: 'Sort imports with external before internal/relative, preserving type grouping'
    },
    fixable: 'code',
    schema: [
      {
        properties: {
          ignoreCase: {type: 'boolean'},
          internalPattern: {
            items: {type: 'string'},
            type: 'array'
          },
          newlinesBetween: {
            enum: ['ignore', 'always', 'never']
          }
        },
        type: 'object'
      }
    ],
    type: 'suggestion'
  }
};

export default customSortImportsRule;
