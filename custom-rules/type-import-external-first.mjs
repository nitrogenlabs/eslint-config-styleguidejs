// ESM version of the custom rule
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce external type imports before local type imports',
      category: 'Stylistic Issues',
      recommended: false
    },
    fixable: 'code',
    schema: []
  },
  create(context) {
    return {
      Program(node) {
        const importTypeNodes = node.body.filter(
          n => n.type === 'ImportDeclaration' && n.importKind === 'type'
        );
        let seenLocal = false;
        for (const imp of importTypeNodes) {
          const isExternal = !imp.source.value.startsWith('.') && !imp.source.value.startsWith('/');
          if (seenLocal && isExternal) {
            context.report({
              node: imp,
              message: 'External type imports should be before local type imports.',
              fix(fixer) {
                // Not auto-fixing for now (could be implemented)
                return null;
              }
            });
          }
          if (!isExternal) seenLocal = true;
        }
      }
    };
  }
};
