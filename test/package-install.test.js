import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {beforeAll, describe, expect, it} from 'vitest';

const owner = fileURLToPath(new URL('../', import.meta.url));
const evidence = mkdtempSync(join(tmpdir(), 'styleguide-package-'));
const flags = ['--ignore-scripts', '--no-audit', '--no-fund'];

if(process.env.STYLEGUIDE_PACKAGE_OFFLINE === '1') {
  flags.push('--offline');
}

const npm = (directory, label, args) => {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', [...args, ...flags], {
    cwd: directory,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    timeout: 120000
  });

  writeFileSync(join(evidence, `${label}.stdout`), result.stdout ?? '');
  writeFileSync(join(evidence, `${label}.stderr`), result.stderr ?? '');

  expect(result.error, `${label}: process launch failed`).toBeUndefined();
  expect(result.status, `${label}: see ${evidence}\n${result.stderr}`).toBe(0);

  return result.stdout;
};

let archive;

beforeAll(() => {
  // Keep the actual archive and process logs so failures can be diagnosed.
  process.stdout.write(`Package integration evidence: ${evidence}\n`);
  if(process.env.STYLEGUIDE_PACKAGE_ARCHIVE) {
    archive = resolve(process.env.STYLEGUIDE_PACKAGE_ARCHIVE);
  } else {
    const [packed] = JSON.parse(npm(owner, 'pack', ['pack', '--json', '--pack-destination', evidence]));

    archive = join(evidence, packed.filename);
  }
});

describe('published lint runtime closure', () => {
  // Omitting ESLint from the packed bundle must fail the mismatching consumer's graph.
  it.each(['10.13.0', '10.12.0'])('installs and lints with consumer ESLint %s and TypeScript 7', (version) => {
    const directory = join(evidence, `eslint-${version}`);

    mkdirSync(directory);
    copyFileSync(archive, join(directory, 'styleguide.tgz'));
    writeFileSync(join(directory, 'package.json'), JSON.stringify({
      dependencies: {
        eslint: version,
        'eslint-config-styleguidejs': 'file:./styleguide.tgz',
        typescript: '7.0.2'
      },
      name: `styleguide-consumer-${version}`,
      private: true,
      type: 'module',
      version: '1.0.0'
    }, null, 2));
    writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {strict: true},
      include: ['*.ts']
    }));
    writeFileSync(join(directory, 'clean.ts'), 'export type Value = string;\n');
    writeFileSync(join(directory, 'invalid.ts'), 'export type Value = string | \'literal\';\n');
    copyFileSync(new URL('./fixtures/package-consumer.mjs', import.meta.url), join(directory, 'probe.mjs'));
    npm(directory, `${version}-install`, ['install']);

    expect(existsSync(join(directory,
      'node_modules/eslint-config-styleguidejs/node_modules/eslint/lib/api.js'))).toBe(true);

    npm(directory, `${version}-install-graph`, ['ls', '--all', '--json']);
    npm(directory, `${version}-ci`, ['ci']);
    const graph = JSON.parse(npm(directory, `${version}-graph`, ['ls', '--all', '--json']));

    expect(graph.problems).toBeUndefined();

    const probe = spawnSync(process.execPath, ['probe.mjs', version], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 60000
    });

    writeFileSync(join(evidence, `${version}-probe.stdout`), probe.stdout ?? '');
    writeFileSync(join(evidence, `${version}-probe.stderr`), probe.stderr ?? '');

    expect(probe.error).toBeUndefined();
    expect(probe.status, `Runtime probe: ${probe.stderr}`).toBe(0);

    const result = JSON.parse(probe.stdout);

    expect(result.cleanMessages).toEqual([]);
    expect(result.invalidRules).toEqual(['@typescript-eslint/no-redundant-type-constituents']);
    expect(result.lintEslint).toBe('10.12.0');
    expect(result.rootEslint).toBe(version);
    expect(result.lintTypescript).toBe('6.0.3');
    expect(result.rootTypescript).toBe('7.0.2');
    expect(readFileSync(join(directory, 'invalid.ts'), 'utf8')).toContain('string | \'literal\'');
  });
});
