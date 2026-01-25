#!/usr/bin/env node

import {validateRules} from './validate-rules.js';

// Run the validation
validateRules().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
