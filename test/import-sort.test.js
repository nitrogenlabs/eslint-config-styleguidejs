import {ESLint} from 'eslint';
import styleguide, {typescriptConfig} from 'eslint-config-styleguidejs';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import tseslint from 'typescript-eslint';
import {describe, expect, it} from 'vitest';

const sortRule = 'custom-sort/sort-imports';
const lintImports = async (code, options, typescript = false) => {
  const eslint = new ESLint({
    fix: (message) => message.ruleId === sortRule,
    overrideConfig: [
      ...(typescript ? [...typescriptConfig, tseslint.configs.disableTypeChecked] : styleguide),
      ...(options ? [{rules: {[sortRule]: ['error', options]}}] : [])
    ],
    overrideConfigFile: true
  });
  const [result] = await eslint.lintText(code, {filePath: `imports-fixture.${typescript ? 'ts' : 'js'}`});

  expect(result.fatalErrorCount).toBe(0);
  expect((await eslint.calculateConfigForFile('imports-fixture.js')).processor).toBeUndefined();

  return {
    diagnostics: result.messages.filter((message) => message.ruleId === sortRule),
    output: result.output ?? code
  };
};

const executeModule = (source, modules = {}) => {
  const directory = mkdtempSync(join(tmpdir(), 'import-sort-runtime-'));

  try {
    for(const [name, contents] of Object.entries(modules)) {
      writeFileSync(join(directory, name), contents);
    }
    writeFileSync(join(directory, 'entry.mjs'), source);
    writeFileSync(join(directory, 'run.mjs'), 'import {result} from "./entry.mjs"; process.stdout.write(JSON.stringify(result));');

    return JSON.parse(execFileSync(process.execPath, [join(directory, 'run.mjs')], {encoding: 'utf8'}));
  } finally {
    rmSync(directory, {force: true, recursive: true});
  }
};

describe('public import-sort safety', () => {
  it('retains executable hoisted and mock setup between imports at runtime', async () => {
    const source = [
      'import {b} from "./b.mjs";',
      'const vi = {hoisted: (initialize) => initialize(), mock: (_name, factory) => factory()};',
      'const setup = vi.hoisted(() => ({value: 40}));',
      'vi.mock("socket", () => { setup.value += 1; });',
      'import {a} from "./a.mjs";',
      'export const result = (typeof setup === "undefined" ? -100 : setup.value) + a + b;'
    ].join('\n');
    const fixed = await lintImports(source);

    expect(executeModule(fixed.output, {
      'a.mjs': 'export const a = 1;',
      'b.mjs': 'export const b = 2;'
    })).toBe(44);
    expect(fixed.output).toBe(source);
    expect(fixed.diagnostics).toHaveLength(1);
    expect(fixed.diagnostics[0].fix).toBeUndefined();
    expect((await lintImports(fixed.output)).output).toBe(source);
  });

  it('preserves side-effect-only module evaluation order', async () => {
    const source = [
      'import "./z.mjs";',
      'import "./a.mjs";',
      'export const result = globalThis.importSortSequence;'
    ].join('\n');
    const fixed = await lintImports(source);

    expect(executeModule(fixed.output, {
      'a.mjs': '(globalThis.importSortSequence ||= []).push("a");',
      'z.mjs': '(globalThis.importSortSequence ||= []).push("z");'
    })).toEqual(['z', 'a']);
    expect(fixed.output).toBe(source);
    expect(fixed.diagnostics).toHaveLength(1);
    expect(fixed.diagnostics[0].fix).toBeUndefined();
  });

  it.each([
    ['leading attachment', '// belongs to z\nimport z from "z";\nimport a from "a";'],
    ['trailing attachment', 'import z from "z";\nimport a from "a"; // belongs to a'],
    ['multiline attachment', '/* belongs\n * to z */\nimport z from "z";\nimport a from "a";'],
    ['intervening comment', 'import z from "z";\n\n// retain provenance\n\nimport a from "a";'],
    ['inline comment', 'import { /* binding contract */ z } from "z";\nimport a from "a";'],
    ['eslint directive', 'import z from "z";\n/* eslint-disable-next-line no-unused-vars */\nimport a from "a";'],
    ['statement directive', 'import z from "z";\n"use client";\nimport a from "a";']
  ])('does not fix an unsafe %s', async (_name, source) => {
    const fixed = await lintImports(source);

    expect(fixed.output).toBe(source);
    expect(fixed.diagnostics).toHaveLength(1);
    expect(fixed.diagnostics[0].fix).toBeUndefined();
    expect((await lintImports(fixed.output)).output).toBe(source);
  });

  it.each(['always', 'never', 'ignore'])(
    'does not report an unsafe span as a %s whitespace error',
    async (newlinesBetween) => {
      const source = 'import a from "a";\n// retain\nimport z from "z";';

      expect(await lintImports(source, {newlinesBetween})).toEqual({diagnostics: [], output: source});
    }
  );

  it('retains executable setup between mixed value and type imports', async () => {
    const source = 'import type {Z} from "z";\nconst setup = 42;\nimport {type A, value} from "a";\nexport {setup};';
    const fixed = await lintImports(source, undefined, true);

    expect(fixed.output).toBe(source);
    expect(fixed.diagnostics).toHaveLength(1);
    expect(fixed.diagnostics[0].fix).toBeUndefined();
  });

  it('sorts safe imports without changing their initialized exports', async () => {
    const source = 'import {b} from "./b.mjs";\nimport {a} from "./a.mjs";\nexport const result = a + b;';
    const fixed = await lintImports(source);

    expect(fixed.output).toBe('import {a} from "./a.mjs";\nimport {b} from "./b.mjs";\nexport const result = a + b;');
    expect(executeModule(fixed.output, {
      'a.mjs': 'export const a = 20;',
      'b.mjs': 'export const b = 22;'
    })).toBe(42);
    expect(fixed.diagnostics).toEqual([]);
    expect(await lintImports(fixed.output)).toEqual(fixed);
  });

  it.each(['', 'import a from "a";'])('leaves fewer than two imports unchanged: %s', async (source) => {
    expect(await lintImports(source)).toEqual({diagnostics: [], output: source});
  });

  it.each([
    ['always', 'import a from "a";\nimport z from "z";\n\nimport c from "./c";'],
    ['never', 'import a from "a";\nimport z from "z";\nimport c from "./c";'],
    ['ignore', 'import a from "a";\nimport z from "z";\nimport c from "./c";']
  ])('preserves safe %s newline policy and reaches a stable fix', async (newlinesBetween, expected) => {
    const options = {newlinesBetween};
    const fixed = await lintImports('import c from "./c";\n\nimport z from "z";\nimport a from "a";', options);

    expect(fixed.output).toBe(expected);
    expect(fixed.diagnostics).toEqual([]);
    expect(await lintImports(fixed.output, options)).toEqual(fixed);
  });

  it('ignores existing blank lines when the import order is correct', async () => {
    const source = 'import a from "a";\n\n\nimport z from "z";';

    expect(await lintImports(source, {})).toEqual({diagnostics: [], output: source});
  });

  it.each([
    [true, 'import first from "A";\nimport second from "a";'],
    [false, 'import second from "a";\nimport first from "A";']
  ])('preserves ignoreCase=%s source ordering', async (ignoreCase, expected) => {
    expect((await lintImports('import first from "A";\nimport second from "a";', {ignoreCase})).output).toBe(expected);
  });

  it('preserves absolute path ordering, relative ordering and every type group', async () => {
    const source = [
      'import type {Index} from "./index.tsx";',
      'import type {Sibling} from "./b";',
      'import type {Parent} from "../p";',
      'import type {Internal} from "~/z";',
      'import type {Builtin} from "node:fs";',
      'import type {ExternalZ} from "z";',
      'import type {ExternalA} from "a";',
      'import index from "./index.js";',
      'import sibling from "./b";',
      'import parent from "../p";',
      'import internal from "~/z";',
      'import builtin from "fs";',
      'import external from "a";',
      'import {type Mixed, value} from "b";'
    ].join('\n');
    const expected = [
      'import internal from "~/z";',
      'import external from "a";',
      'import {type Mixed, value} from "b";',
      'import builtin from "fs";',
      '',
      'import parent from "../p";',
      'import sibling from "./b";',
      'import index from "./index.js";',
      '',
      'import type {ExternalA} from "a";',
      'import type {ExternalZ} from "z";',
      'import type {Builtin} from "node:fs";',
      'import type {Internal} from "~/z";',
      'import type {Parent} from "../p";',
      'import type {Sibling} from "./b";',
      'import type {Index} from "./index.tsx";'
    ].join('\n');

    expect((await lintImports(source, undefined, true)).output).toBe(expected);
    expect((await lintImports(expected, undefined, true)).diagnostics).toEqual([]);
  });

  it.each(['./', './index', './index.js', './index.jsx', './index.ts', './index.tsx'])(
    'recognizes %s as a type index after sibling imports',
    async (indexPath) => {
      const source = `import type {Index} from "${indexPath}";\nimport type {Sibling} from "./z";`;

      expect((await lintImports(source, {}, true)).output).toBe(
        `import type {Sibling} from "./z";\nimport type {Index} from "${indexPath}";`
      );
    }
  );

  it('honors caller internal patterns rather than classifying them as external types', async () => {
    const source = 'import type {Internal} from "app/a";\nimport type {External} from "z";';

    expect((await lintImports(source, {internalPattern: ['^app/']}, true)).output).toBe(
      'import type {External} from "z";\nimport type {Internal} from "app/a";'
    );
  });
});
