import globals from 'globals';
import {readFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';

import {validateRules} from './validate-rules.js';

const thisFilename = fileURLToPath(import.meta.url);
const thisDirname = dirname(thisFilename);
const packageJsonText = readFileSync(resolve(thisDirname, '../package.json'), 'utf8');

void globals;
void packageJsonText;
void validateRules;
