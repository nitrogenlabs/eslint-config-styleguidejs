import {ESLint} from 'eslint';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

import {config} from '../index.js';

const fixture = mkdtempSync(join(tmpdir(), 'styleguide-dev-policy-'));

mkdirSync(join(fixture, 'node_modules', 'declared-dev'), {recursive: true});
writeFileSync(join(fixture, 'package.json'), JSON.stringify({
  devDependencies: {'declared-dev': '1.0.0'},
  name: 'styleguide-dev-policy',
  type: 'module'
}));

describe('public development dependency policy', () => {
  it.each([
    {denied: true, devDependencies: undefined, label: 'absent'},
    {denied: true, devDependencies: null, label: 'null', rejected: true},
    {denied: true, devDependencies: false, label: 'false'},
    {denied: true, devDependencies: [], label: 'empty patterns'},
    {denied: true, devDependencies: ['**/other.js'], label: 'unmatched patterns'},
    {denied: false, devDependencies: true, label: 'true'},
    {denied: false, devDependencies: ['**/fixture.js'], label: 'matched patterns'}
  ])('preserves $label behavior', async ({denied, devDependencies, rejected}) => {
    const eslint = new ESLint({
      cwd: fixture,
      overrideConfig: [
        ...config,
        {
          rules: {
            'import/no-extraneous-dependencies': ['error', {devDependencies}]
          }
        }
      ],
      overrideConfigFile: true
    });
    const results = eslint.lintText('import value from \'declared-dev\';\n\nexport {value};\n', {
      filePath: join(fixture, 'fixture.js')
    });

    if(rejected) {
      await expect(results).rejects.toThrow('Value null should be boolean.');

      return;
    }

    const [result] = await results;

    expect(result.fatalErrorCount).toBe(0);
    expect(result.messages.map(({ruleId}) => ruleId)).toEqual(denied ? ['import/no-extraneous-dependencies'] : []);
  });
});
