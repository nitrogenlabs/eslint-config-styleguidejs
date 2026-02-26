import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {builtinRules} from 'eslint/use-at-your-own-risk';
import {config, typescriptConfig} from '../eslint.config.js';

const require = createRequire(import.meta.url);
const eslintVersion = require('eslint/package.json').version;

function isRuleOff(configValue) {
  if(configValue === 0 || configValue === 'off') {
    return true;
  }

  if(Array.isArray(configValue)) {
    return configValue[0] === 0 || configValue[0] === 'off';
  }

  return false;
}

function parsePluginRuleId(ruleId) {
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
}

function collectPlugins(configArray) {
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
}

function collectEnabledRules(configArray) {
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
}

function audit(configName, configArray) {
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
        unsupported.push({ruleId, reason: 'Missing ESLint core rule'});
      }
      continue;
    }

    const plugin = plugins.get(pluginName);
    if(!plugin) {
      unsupported.push({ruleId, reason: `Plugin "${pluginName}" is not loaded in config.`});
      continue;
    }

    if(!plugin.rules || typeof plugin.rules !== 'object') {
      unsupported.push({ruleId, reason: `Plugin "${pluginName}" has no rule map.`});
      continue;
    }

    if(!Object.prototype.hasOwnProperty.call(plugin.rules, ruleName)) {
      unsupported.push({ruleId, reason: `Plugin "${pluginName}" does not define "${ruleName}".`});
      continue;
    }

    supported.push({ruleId, source: pluginName});
  }

  return {
    config: configName,
    coreRuleCount: builtinRules.size,
    pluginCount: plugins.size,
    enabledRuleCount: enabledRules.size,
    supported,
    unsupported
  };
}

const baseAudit = audit('config', config);
const typescriptAudit = audit('typescriptConfig', typescriptConfig);

const report = {
  generatedAt: new Date().toISOString(),
  eslintVersion,
  audits: [baseAudit, typescriptAudit]
};

const reportPath = path.resolve('reports/eslint-v10-support.json');
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for(const result of report.audits) {
  console.log(`\n${result.config}`);
  console.log(`- enabled rules: ${result.enabledRuleCount}`);
  console.log(`- supported: ${result.supported.length}`);
  console.log(`- unsupported: ${result.unsupported.length}`);

  if(result.unsupported.length > 0) {
    for(const item of result.unsupported) {
      console.log(`  - ${item.ruleId}: ${item.reason}`);
    }
  }
}

console.log(`\nWrote report: ${reportPath}`);
