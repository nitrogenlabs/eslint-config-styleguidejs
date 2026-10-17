// The fixture runs after being copied into a consumer that installs this package.
// eslint-disable-next-line import/no-extraneous-dependencies
import styleguide, {config, typescriptConfig} from 'eslint-config-styleguidejs';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootRequire = createRequire(import.meta.url);
const packageDirectory = fileURLToPath(new URL('.', import.meta.resolve('eslint-config-styleguidejs')));
const lintRequire = createRequire(join(packageDirectory, 'package.json'));
const {ESLint} = lintRequire('eslint');
const lintTypescript = createRequire(lintRequire.resolve('ts-api-utils'))('typescript');
const parserRequire = createRequire(createRequire(lintRequire.resolve('typescript-eslint'))
  .resolve('@typescript-eslint/parser'));
const parserTypescript = parserRequire('typescript');

assert.ok(Array.isArray(styleguide));
assert.ok(Array.isArray(config));
assert.ok(Array.isArray(typescriptConfig));
assert.equal(ESLint.version, '10.12.0');
assert.equal(rootRequire('eslint/package.json').version, process.argv[2]);
assert.equal(lintRequire.resolve('eslint'), join(packageDirectory, 'node_modules/eslint/lib/api.js'));
assert.ok(existsSync(join(packageDirectory, 'node_modules/eslint/bin/eslint.js')));
assert.equal(lintTypescript.version, '6.0.3');
assert.ok(lintTypescript.TypeFlags.String);
assert.equal(parserTypescript, lintTypescript);
assert.equal(rootRequire('typescript/package.json').version, '7.0.2');

const eslint = new ESLint({
  cwd: process.cwd(),
  overrideConfig: typescriptConfig,
  overrideConfigFile: true
});
const [clean, invalid] = await eslint.lintFiles(['clean.ts', 'invalid.ts']);

assert.equal(clean.fatalErrorCount, 0);
assert.equal(invalid.fatalErrorCount, 0);
assert.deepEqual(clean.messages, []);
assert.deepEqual(invalid.messages.map((message) => message.ruleId),
  ['@typescript-eslint/no-redundant-type-constituents']);
assert.equal(invalid.messages[0].severity, 2);
process.stdout.write(JSON.stringify({
  cleanMessages: clean.messages,
  invalidRules: invalid.messages.map((message) => message.ruleId),
  lintEslint: ESLint.version,
  lintTypescript: lintTypescript.version,
  rootEslint: rootRequire('eslint/package.json').version,
  rootTypescript: rootRequire('typescript/package.json').version
}));
