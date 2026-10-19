import {builtinRules} from 'eslint/use-at-your-own-risk';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {format} from 'node:util';

import {config, typescriptConfig} from '../eslint.config.js';

const require = createRequire(import.meta.url);
const eslintVersion = require('eslint/package.json').version;

const isRuleOff = (configValue) => {
  if(configValue === 0 || configValue === 'off') {
    return true;
  }

  if(Array.isArray(configValue)) {
    return configValue[0] === 0 || configValue[0] === 'off';
  }

  return false;
};

const parsePluginRuleId = (ruleId) => {
  if(!ruleId.includes('/')) {
    return {pluginName: null, ruleName: ruleId};
  }

  if(ruleId.startsWith('@')) {
    const [pluginName, ...rest] = ruleId.split('/');
    return {
      pluginName,
      ruleName: rest.join('/')
    };
  }

  const [pluginName, ...rest] = ruleId.split('/');
  return {
    pluginName,
    ruleName: rest.join('/')
  };
};

const collectPlugins = (configArray) => {
  const plugins = new Map();

  for(const block of configArray) {
    if(!block?.plugins || typeof block.plugins !== 'object') {
      continue;
    }

    for(const [pluginName, plugin] of Object.entries(block.plugins)) {
      plugins.set(pluginName, plugin);
    }
  }

  return plugins;
};

const collectEnabledRules = (configArray) => {
  const rules = new Map();

  for(const block of configArray) {
    if(!block?.rules || typeof block.rules !== 'object') {
      continue;
    }

    for(const [ruleId, ruleConfig] of Object.entries(block.rules)) {
      if(isRuleOff(ruleConfig)) {
        continue;
      }

      rules.set(ruleId, ruleConfig);
    }
  }

  return rules;
};

const audit = (configName, configArray) => {
  const plugins = collectPlugins(configArray);
  const enabledRules = collectEnabledRules(configArray);

  const supported = [];
  const unsupported = [];

  for(const ruleId of enabledRules.keys()) {
    const {pluginName, ruleName} = parsePluginRuleId(ruleId);

    if(!pluginName) {
      if(builtinRules.has(ruleId)) {
        supported.push({ruleId, source: 'core'});
      } else {
        unsupported.push({reason: 'Missing ESLint core rule', ruleId});
      }
      continue;
    }

    const plugin = plugins.get(pluginName);
    if(!plugin) {
      unsupported.push({reason: `Plugin "${pluginName}" is not loaded in config.`, ruleId});
      continue;
    }

    if(!plugin.rules || typeof plugin.rules !== 'object') {
      unsupported.push({reason: `Plugin "${pluginName}" has no rule map.`, ruleId});
      continue;
    }

    if(!Object.prototype.hasOwnProperty.call(plugin.rules, ruleName)) {
      unsupported.push({reason: `Plugin "${pluginName}" does not define "${ruleName}".`, ruleId});
      continue;
    }

    supported.push({ruleId, source: pluginName});
  }

  return {
    config: configName,
    coreRuleCount: builtinRules.size,
    enabledRuleCount: enabledRules.size,
    pluginCount: plugins.size,
    supported,
    unsupported
  };
};

const baseAudit = audit('config', config);
const typescriptAudit = audit('typescriptConfig', typescriptConfig);

const report = {
  audits: [baseAudit, typescriptAudit],
  eslintVersion,
  generatedAt: new Date().toISOString()
};

const reportPath = path.resolve('reports/eslint-v10-support.json');
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for(const result of report.audits) {
  process.stdout.write(`${format(`\n${result.config}`)}\n`);
  process.stdout.write(`${format(`- enabled rules: ${result.enabledRuleCount}`)}\n`);
  process.stdout.write(`${format(`- supported: ${result.supported.length}`)}\n`);
  process.stdout.write(`${format(`- unsupported: ${result.unsupported.length}`)}\n`);

  if(result.unsupported.length > 0) {
    for(const item of result.unsupported) {
      process.stdout.write(`${format(`  - ${item.ruleId}: ${item.reason}`)}\n`);
    }
  }
}

process.stdout.write(`${format(`\nWrote report: ${reportPath}`)}\n`);
