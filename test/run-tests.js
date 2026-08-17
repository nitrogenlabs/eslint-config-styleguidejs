#!/usr/bin/env node

import {ESLint} from 'eslint';
import {createRequire} from 'module';
import path from 'path';
import {fileURLToPath} from 'url';

import {config, typescriptConfig} from '../eslint.config.js';
import {validateRules} from './validate-rules.js';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const runTypescriptRuntimeTest = async () => {
  console.log('Checking the isolated TypeScript lint runtime...');

  try {
    const tsApiRequire = createRequire(require.resolve('ts-api-utils'));
    const lintTypescript = tsApiRequire('typescript');

    if(lintTypescript.versionMajorMinor !== '6.0' || !lintTypescript.TypeFlags) {
      console.error(`❌ Expected the lint runtime to use TypeScript 6.0, received ${lintTypescript.version}.`);
      return false;
    }

    console.log(`✅ TypeScript ${lintTypescript.version} lint runtime is isolated successfully!`);
    return true;
  } catch(error) {
    console.error('❌ Error checking the TypeScript lint runtime:', error);
    return false;
  }
};

const runTypescriptTest = async () => {
  console.log('Running TypeScript configuration test...');

  try {
    const eslint = new ESLint({
      overrideConfig: typescriptConfig,
      overrideConfigFile: true
    });

    const testFiles = [
      path.join(__dirname, 'import-external-builtin-order.test.ts'),
      path.join(__dirname, 'import-builtin-external-order.test.ts'),
      path.join(__dirname, 'import-type-placement.test.ts'),
      path.join(__dirname, 'import-type-sort.test.ts'),
      path.join(__dirname, 'typescript-test.ts')
    ];
    const results = await eslint.lintFiles(testFiles);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    console.log('ESLint Results:');
    console.log(resultText);

    // Check if there are any errors
    const hasErrors = results.some((result) => result.errorCount > 0);
    if(hasErrors) {
      console.error('❌ TypeScript configuration test failed with errors.');
      return false;
    }
    console.log('✅ TypeScript configuration test passed successfully!');
    return true;
  } catch(error) {
    console.error('❌ Error running TypeScript test:', error);
    return false;
  }
};

const runAllTests = async () => {
  console.log('🧪 Running all tests for eslint-config-styleguidejs...\n');

  const testResults = [];

  testResults.push(await runTypescriptRuntimeTest());

  // Run TypeScript test
  testResults.push(await runTypescriptTest());

  // Run rule validation test
  console.log('\nRunning rule validation test...');
  testResults.push(await validateRules());

  // Add more tests here as needed

  // Print summary
  console.log('\n📊 Test Summary:');
  const passedCount = testResults.filter((result) => result).length;
  const failedCount = testResults.filter((result) => !result).length;

  console.log(`Passed: ${passedCount}, Failed: ${failedCount}, Total: ${testResults.length}`);

  // Exit with appropriate code
  if(failedCount > 0) {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
};

// Run all tests
runAllTests();
