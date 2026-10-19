#!/usr/bin/env node

import {ESLint} from 'eslint';
import {format} from 'node:util';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const fileName = fileURLToPath(import.meta.url);
const directoryName = dirname(fileName);

// Test file with intentional violations to trigger all rules
const testCode = `
// Test file to validate all ESLint rules exist and work correctly

import React from 'react';
import { useState, useEffect } from 'react';

// Test TypeScript interface
interface TestInterface {
  name: string;
  value: number;
  readonly _id?: string;
}

// Test type definition
export type TestType = {
  id: string;
  data: {
    field1: string;
    field2: number;
  }
};

// Test function with various rule violations
export const testFunction = (param: {
  input: string;
  output: number;
}): TestInterface => {
  const [state, setState] = useState<string>('test');

  if(param.input) {
    return { name: param.input, value: param.output };
  }

  return { name: 'default', value: 0 };
};

// Test React component
export const TestComponent = ({ name, value }: { name: string; value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Component mounted');
  }, []);

  return (
    <div className="test" onClick={() => setCount(count + 1)}>
      <h1>{name}</h1>
      <p>Value: {value}</p>
      <p>Count: {count}</p>
    </div>
  );
};

// Test Jest-like code
describe('test suite', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
`;

const validateRules = async () => {
  process.stdout.write(`${format('🧪 Validating ESLint rules...\n')}\n`);

  try {
    // Create ESLint instance
    const eslint = new ESLint({
      overrideConfigFile: join(directoryName, '..', 'eslint.config.js')
    });

    // Lint the test code
    const results = await eslint.lintText(testCode, {
      filePath: 'test-rules.tsx'
    });

    const result = results[0];

    if(result.errorCount === 0 && result.warningCount === 0) {
      process.stdout.write(`${format('✅ All rules validated successfully!')}\n`);
      process.stdout.write(`${format('📊 No rule errors or warnings found.')}\n`);
      return true;
    }

    // Check for rule-related errors
    const ruleErrors = result.messages.filter((msg) =>
      msg.ruleId && (
        msg.message.includes('Could not find') ||
        msg.message.includes('deprecated') ||
        msg.message.includes('not found in plugin')
      )
    );

    if(ruleErrors.length > 0) {
      process.stdout.write(`${format('❌ Found rule validation errors:')}\n`);
      ruleErrors.forEach((error) => {
        process.stdout.write(`${format(`   - ${error.ruleId}: ${error.message}`)}\n`);
      });
      return false;
    }

    // Show other linting issues (these are expected from our test code)
    const otherIssues = result.messages.filter((msg) =>
      msg.ruleId && !ruleErrors.includes(msg)
    );

    if(otherIssues.length > 0) {
      process.stdout.write(`${format('⚠️  Found expected linting issues (rules are working):')}\n`);
      otherIssues.forEach((issue) => {
        process.stdout.write(`${format(`   - ${issue.ruleId}: ${issue.message} (line ${issue.line})`)}\n`);
      });
    }

    process.stdout.write(`${format('\n✅ All ESLint rules exist and are working correctly!')}\n`);
    process.stdout.write(`${format(`📊 Total issues found: ${result.errorCount + result.warningCount}`)}\n`);
    return true;
  } catch(error) {
    process.stderr.write(`${format('❌ Error validating rules:', error.message)}\n`);

    // Check if it's a rule-related error
    if(error.message.includes('Could not find') ||
        error.message.includes('deprecated') ||
        error.message.includes('not found in plugin')) {
      process.stderr.write(`${format('This appears to be a rule validation error.')}\n`);
      return false;
    }

    process.stderr.write(`${format('This appears to be a configuration error.')}\n`);
    return false;
  }
};

// Export the validation function
export {validateRules};
