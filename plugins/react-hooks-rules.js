const getFunctionName = (node, ancestors) => {
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
};

const isHookName = (name) => /^use[A-Z0-9]/u.test(name);

export const createRulesOfHooks = (getAncestorsForNode) => ({
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
            message: `React Hook "${node.callee.name}" cannot be called at the top level.`,
            node
          });
          return;
        }

        const fnNode = ancestors[ancestors.length - 1 - functionAncestorIndex];
        const functionAncestors = ancestors.slice(0, ancestors.length - 1 - functionAncestorIndex);
        const functionName = getFunctionName(fnNode, functionAncestors);

        const isComponent = functionName ? /^[A-Z]/u.test(functionName) : false;
        const isCustomHook = functionName ? isHookName(functionName) : false;

        if(!isComponent && !isCustomHook) {
          context.report({
            message: `React Hook "${node.callee.name}" must be called in a React component or custom hook.`,
            node
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
            message: `React Hook "${node.callee.name}" cannot be called conditionally.`,
            node
          });
        }
      }
    };
  },
  meta: {
    docs: {description: 'Enforce basic React Hooks usage constraints.'},
    schema: [],
    type: 'problem'
  }
});
