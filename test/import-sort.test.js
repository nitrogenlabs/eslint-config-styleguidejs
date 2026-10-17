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

const executeModule = (source, modules = {}, captureEffects = false) => {
  const directory = mkdtempSync(join(tmpdir(), 'import-sort-runtime-'));

  try {
    for(const [name, contents] of Object.entries(modules)) {
      writeFileSync(join(directory, name), contents);
    }
    writeFileSync(join(directory, 'entry.mjs'), source);
    writeFileSync(join(directory, 'run.mjs'), captureEffects ? [
      'let error;',
      'try { await import("./entry.mjs"); } catch (caught) {',
      '  error = {code: caught.code, message: caught.message, name: caught.name};',
      '}',
      'process.stdout.write(JSON.stringify({error, events: globalThis.importSortSequence}));'
    ].join('\n') : 'import {result} from "./entry.mjs"; process.stdout.write(JSON.stringify(result));');

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

describe('public opt-in runtime import order', () => {
  const options = {preserveRuntimeOrder: true};
  const source = 'import {z} from "./z.mjs";\nimport {a} from "./a.mjs";\nexport const result = [z, a];';
  const modules = {
    'a.mjs': '(globalThis.importSortSequence ||= []).push("a"); export const a = 1;',
    'z.mjs': '(globalThis.importSortSequence ||= []).push("z"); export const z = 2;'
  };

  it.each([undefined, {preserveRuntimeOrder: false}])('retains default sorting and its observable effects: %s', async (settings) => {
    const fixed = await lintImports(source, settings);

    expect(fixed.output).toBe('import {a} from "./a.mjs";\nimport {z} from "./z.mjs";\nexport const result = [z, a];');
    expect(executeModule(fixed.output, modules, true)).toEqual({events: ['a', 'z']});
    expect(executeModule(source, modules, true)).toEqual({events: ['z', 'a']});
  });

  it('preserves successful named-import effects through the public option', async () => {
    const fixed = await lintImports(source, options);

    expect(fixed).toEqual({diagnostics: [], output: source});
    expect(executeModule(fixed.output, modules, true)).toEqual({events: ['z', 'a']});
    expect(await lintImports(fixed.output, options)).toEqual(fixed);
  });

  it('preserves early named-import failure effects and the original error', async () => {
    const fixed = await lintImports(source, options);

    expect(executeModule(fixed.output, {
      ...modules,
      'z.mjs': '(globalThis.importSortSequence ||= []).push("z"); throw Object.assign(new RangeError("original failure"), {code: "MODEL_READ"}); export const z = 2;'
    }, true)).toEqual({error: {code: 'MODEL_READ', message: 'original failure', name: 'RangeError'}, events: ['z']});
  });

  it('preserves bare import effects and does not report their runtime order', async () => {
    const bare = 'import "./z.mjs";\n\nimport "./a.mjs";';
    const fixed = await lintImports(bare, {...options, newlinesBetween: 'never'});

    expect(fixed).toEqual({diagnostics: [], output: bare});
    expect(executeModule(fixed.output, modules, true)).toEqual({events: ['z', 'a']});
  });

  it.each([
    ['always', 'import {type Z, z, a} from "./z";\nimport fs from "node:fs";\nimport {type A} from "a";\n\nimport type {External} from "z";\nimport type {Builtin} from "node:fs";\nimport type {Internal} from "~/a";\nimport type {Parent} from "../p";\nimport type {Sibling} from "./s";\nimport type {Index} from "./index";'],
    ['never', 'import {type Z, z, a} from "./z";\nimport fs from "node:fs";\nimport {type A} from "a";\nimport type {External} from "z";\nimport type {Builtin} from "node:fs";\nimport type {Internal} from "~/a";\nimport type {Parent} from "../p";\nimport type {Sibling} from "./s";\nimport type {Index} from "./index";'],
    ['ignore', 'import {type Z, z, a} from "./z";\nimport fs from "node:fs";\nimport {type A} from "a";\nimport type {External} from "z";\nimport type {Builtin} from "node:fs";\nimport type {Internal} from "~/a";\nimport type {Parent} from "../p";\nimport type {Sibling} from "./s";\nimport type {Index} from "./index";']
  ])('keeps mixed and specifier-type declarations in one runtime block with %s spacing', async (newlinesBetween, expected) => {
    const mixed = [
      'import type {Index} from "./index";',
      'import {type Z, z, a} from "./z";',
      'import type {Sibling} from "./s";',
      'import fs from "node:fs";',
      'import type {Parent} from "../p";',
      'import type {Internal} from "~/a";',
      'import type {Builtin} from "node:fs";',
      'import {type A} from "a";',
      'import type {External} from "z";'
    ].join('\n');
    const settings = {...options, newlinesBetween};
    const fixed = await lintImports(mixed, settings, true);

    expect(fixed).toEqual({diagnostics: [], output: expected});
    expect(await lintImports(fixed.output, settings, true)).toEqual(fixed);
  });

  it.each([
    '// provenance\nimport z from "z";\n\nimport a from "a";',
    'import z from "z";\nimport a from "a"; // attachment',
    'import { /* binding */ z } from "z";\nimport a from "a";',
    'import z from "z";\n/* eslint-disable-next-line no-unused-vars */\nimport a from "a";',
    'import z from "z";\n"use client";\nimport a from "a";',
    'import z from "z";\nconst setup = 42;\nimport a from "a";'
  ])('preserves every byte and avoids whitespace reports for unsafe runtime spans: %s', async (unsafe) => {
    expect(await lintImports(unsafe, {...options, newlinesBetween: 'always'})).toEqual({diagnostics: [], output: unsafe});
  });

  it.each([
    'import type {Z} from "z";\n// provenance\nimport a from "a";',
    'import type {Z} from "z";\nconst setup = 42;\nimport a from "a";',
    'import type {Z} from "z";\nimport "a";',
    'import type {Z} from "z";\n/* eslint-disable-next-line no-unused-vars */\nimport a from "a";'
  ])('still reports actual type ordering without fixing unsafe bytes: %s', async (unsafe) => {
    const fixed = await lintImports(unsafe, options, true);

    expect(fixed.output).toBe(unsafe);
    expect(fixed.diagnostics).toHaveLength(1);
    expect(fixed.diagnostics[0].fix).toBeUndefined();
  });

  it('retains safe spacing inside the runtime block and before sorted types', async () => {
    const spaced = 'import z from "./z";\n\nimport a from "a";\nimport type {Z} from "z";';

    expect((await lintImports(spaced, {...options, newlinesBetween: 'always'}, true)).output).toBe(
      'import z from "./z";\nimport a from "a";\n\nimport type {Z} from "z";'
    );
    expect(await lintImports(spaced, {...options, newlinesBetween: 'ignore'}, true)).toEqual({diagnostics: [], output: spaced});
  });

  it('continues to enforce unrelated public-config lint rules', async () => {
    const eslint = new ESLint({
      fix: false,
      overrideConfig: [...styleguide, {rules: {[sortRule]: ['error', options]}}],
      overrideConfigFile: true
    });
    const [result] = await eslint.lintText(`${source}\nconsole.log(result)\n`, {filePath: 'imports-fixture.js'});

    expect(result.messages.some((message) => message.ruleId === 'semi')).toBe(true);
    expect(result.messages.some((message) => message.ruleId === 'no-console')).toBe(true);
    expect(result.messages.filter((message) => message.ruleId === sortRule)).toEqual([]);
  });

  it('rejects nonboolean runtime-order options through the public schema', async () => {
    await expect(lintImports(source, {preserveRuntimeOrder: 'true'})).rejects.toThrow(/boolean/u);
  });
});
