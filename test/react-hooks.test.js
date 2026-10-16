import {ESLint} from 'eslint';
import styleguide, {typescriptConfig} from 'eslint-config-styleguidejs';
import tseslint from 'typescript-eslint';
import {describe, expect, it} from 'vitest';

const hookRule = 'react-hooks/rules-of-hooks';
const lintHooks = async (code, extension = 'jsx') => {
  const eslint = new ESLint({
    overrideConfig: extension === 'tsx'
      ? [...typescriptConfig, tseslint.configs.disableTypeChecked]
      : styleguide,
    overrideConfigFile: true
  });
  const [result] = await eslint.lintText(code, {filePath: `hooks-fixture.${extension}`});

  expect(result.fatalErrorCount).toBe(0);
  expect((await eslint.calculateConfigForFile(`hooks-fixture.${extension}`)).rules[hookRule][0]).toBe(2);

  return result.messages.filter((message) => message.ruleId === hookRule).map(({column, line, ruleId}) => ({
    column,
    line,
    ruleId
  }));
};

describe('public React hooks configuration', () => {
  it.each([
    ['exported component arrow', 'export const Panel = () => { useRef(null); useEffect(() => {}, []); return null; };'],
    ['exported custom hook arrow', 'export const usePanel = () => { useRef(null); return null; };'],
    ['default named component arrow', 'const Panel = () => { useRef(null); return null; }; export default Panel;'],
    ['component declaration', 'export function Panel() { useRef(null); return null; }'],
    ['custom hook declaration', 'export function usePanel() { useRef(null); return null; }'],
    ['named function expression', 'export const Panel = function Inner() { useRef(null); return null; };'],
    ['component assignment', 'let Panel; Panel = () => { useRef(null); return null; };'],
    ['component property', 'const views = { Panel: () => { useRef(null); return null; } };'],
    ['custom hook property', 'const hooks = { usePanel: function() { useRef(null); return null; } };'],
    ['component object method', 'const views = { Panel() { useRef(null); return null; } };'],
    ['component class method', 'class Views { Panel() { useRef(null); return null; } }'],
    ['ordinary calls', 'const ordinary = () => { use(); useful(); React.useRef(null); };']
  ])('accepts %s', async (_name, code) => {
    expect(await lintHooks(code)).toEqual([]);
  });

  it.each([
    ['typed exported component arrow', 'export const Panel: FC<Props> = ({value}) => { const ref = useRef(value); useEffect(() => {}, []); return <div ref={ref} />; };'],
    ['typed custom hook arrow', 'export const usePanel = (): null => { useRef(null); return null; };']
  ])('accepts TSX %s', async (_name, code) => {
    expect(await lintHooks(code, 'tsx')).toEqual([]);
  });

  it.each([
    ['top-level call', 'useRef(null);', 1, 1],
    ['lowercase arrow', 'const ordinary = () => {\n  useRef(null);\n};', 2, 3],
    ['lowercase declaration', 'function ordinary() {\n  useRef(null);\n}', 2, 3],
    ['anonymous default function', 'export default function() {\n  useRef(null);\n}', 2, 3],
    ['anonymous default arrow', 'export default () => {\n  useRef(null);\n};', 2, 3],
    ['nested anonymous callback', 'const Panel = () => { items.map(() => {\n  useRef(null);\n}); };', 2, 3],
    ['lowercase assignment', 'let ordinary; ordinary = () => {\n  useRef(null);\n};', 2, 3],
    ['lowercase property', 'const helpers = { ordinary: () => {\n  useRef(null);\n} };', 2, 3],
    ['lowercase class method', 'class Helpers { ordinary() {\n  useRef(null);\n} }', 2, 3],
    ['literal property name', 'const views = { "Panel": () => {\n  useRef(null);\n} };', 2, 3],
    ['member assignment', 'views.Panel = () => {\n  useRef(null);\n};', 2, 3],
    ['conditional component call', 'function Panel() { if (ready) {\n  useRef(null);\n} }', 2, 3],
    ['conditional component arrow call', 'const Panel = () => { if (ready) {\n  useRef(null);\n} };', 2, 3],
    ['loop custom hook arrow call', 'const usePanel = () => { while (ready) {\n  useRef(null);\n} };', 2, 3],
    ['loop component call', 'function Panel() { for (const item of items) {\n  useRef(item);\n} }', 2, 3]
  ])('reports %s at the hook call', async (_name, code, line, column) => {
    expect(await lintHooks(code)).toEqual([{column, line, ruleId: hookRule}]);
  });
});
