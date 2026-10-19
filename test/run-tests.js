#!/usr/bin/env node

import {ESLint} from 'eslint';
import {createRequire} from 'module';
import {format} from 'node:util';
import path from 'path';
import {fileURLToPath} from 'url';

import {typescriptConfig} from '../eslint.config.js';
import {validateRules} from './validate-rules.js';

// Get the directory name of the current module
const directoryName = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const runTypescriptRuntimeTest = async () => {
  process.stdout.write(`${format('Checking the isolated TypeScript lint runtime...')}\n`);

  try {
    const tsApiRequire = createRequire(require.resolve('ts-api-utils'));
    const lintTypescript = tsApiRequire('typescript');

    if(lintTypescript.versionMajorMinor !== '6.0' || !lintTypescript.TypeFlags) {
      process.stderr.write(`${format(`❌ Expected the lint runtime to use TypeScript 6.0, received ${lintTypescript.version}.`)}\n`);
      return false;
    }

    process.stdout.write(`${format(`✅ TypeScript ${lintTypescript.version} lint runtime is isolated successfully!`)}\n`);
    return true;
  } catch(error) {
    process.stderr.write(`${format('❌ Error checking the TypeScript lint runtime:', error)}\n`);
    return false;
  }
};

const runTypescriptTest = async () => {
  process.stdout.write(`${format('Running TypeScript configuration test...')}\n`);

  try {
    const eslint = new ESLint({
      overrideConfig: typescriptConfig,
      overrideConfigFile: true
    });

    const testFiles = [
      path.join(directoryName, 'import-external-builtin-order.test.ts'),
      path.join(directoryName, 'import-builtin-external-order.test.ts'),
      path.join(directoryName, 'import-type-placement.test.ts'),
      path.join(directoryName, 'import-type-sort.test.ts'),
      path.join(directoryName, 'typescript-test.ts')
    ];
    const results = await eslint.lintFiles(testFiles);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    process.stdout.write(`${format('ESLint Results:')}\n`);
    process.stdout.write(`${format(resultText)}\n`);

    // Check if there are any errors
    const hasErrors = results.some((result) => result.errorCount > 0);
    if(hasErrors) {
      process.stderr.write(`${format('❌ TypeScript configuration test failed with errors.')}\n`);
      return false;
    }
    process.stdout.write(`${format('✅ TypeScript configuration test passed successfully!')}\n`);
    return true;
  } catch(error) {
    process.stderr.write(`${format('❌ Error running TypeScript test:', error)}\n`);
    return false;
  }
};

const runAllTests = async () => {
  process.stdout.write(`${format('🧪 Running all tests for eslint-config-styleguidejs...\n')}\n`);

  const testResults = [];

  testResults.push(await runTypescriptRuntimeTest());

  // Run TypeScript test
  testResults.push(await runTypescriptTest());

  // Run rule validation test
  process.stdout.write(`${format('\nRunning rule validation test...')}\n`);
  testResults.push(await validateRules());

  // Add more tests here as needed

  // Print summary
  process.stdout.write(`${format('\n📊 Test Summary:')}\n`);
  const passedCount = testResults.filter((result) => result).length;
  const failedCount = testResults.filter((result) => !result).length;

  process.stdout.write(`${format(`Passed: ${passedCount}, Failed: ${failedCount}, Total: ${testResults.length}`)}\n`);

  // Exit with appropriate code
  if(failedCount > 0) {
    process.stdout.write(`${format('\n❌ Some tests failed.')}\n`);
    process.exit(1);
  } else {
    process.stdout.write(`${format('\n✅ All tests passed!')}\n`);
    process.exit(0);
  }
};

// Run all tests
runAllTests();
