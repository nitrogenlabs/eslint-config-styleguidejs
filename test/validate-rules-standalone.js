#!/usr/bin/env node

import {format} from 'node:util';

import {validateRules} from './validate-rules.js';

// Run the validation
validateRules().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  process.stderr.write(`${format('❌ Unexpected error:', error)}\n`);
  process.exit(1);
});
