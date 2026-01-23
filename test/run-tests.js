#!/usr/bin/env node

import { ESLint } from 'eslint';
import { config, typescriptConfig } from '../eslint.config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateRules } from './validate-rules.js';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTypescriptTest() {
  console.log('Running TypeScript configuration test...');

  try {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: typescriptConfig
    });

    const testFiles = [
      path.join(__dirname, 'typescript-test.ts'),
      path.join(__dirname, 'import-type-sort.test.ts')
    ];
    const results = await eslint.lintFiles(testFiles);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    console.log('ESLint Results:');
    console.log(resultText);

    // Check if there are any errors
    const hasErrors = results.some(result => result.errorCount > 0);
    if (hasErrors) {
      console.error('❌ TypeScript configuration test failed with errors.');
      return false;
    } else {
      console.log('✅ TypeScript configuration test passed successfully!');
      return true;
    }
  } catch (error) {
    console.error('❌ Error running TypeScript test:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Running all tests for eslint-config-styleguidejs...\n');

  const testResults = [];

  // Run TypeScript test
  testResults.push(await runTypescriptTest());

  // Run rule validation test
  console.log('\nRunning rule validation test...');
  testResults.push(await validateRules());

  // Add more tests here as needed

  // Print summary
  console.log('\n📊 Test Summary:');
  const passedCount = testResults.filter(result => result).length;
  const failedCount = testResults.filter(result => !result).length;

  console.log(`Passed: ${passedCount}, Failed: ${failedCount}, Total: ${testResults.length}`);

  // Exit with appropriate code
  if (failedCount > 0) {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run all tests
runAllTests();