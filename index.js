// Re-export all named exports from eslint.config.js
// Import both the default export and named exports
import defaultConfig, {typescriptConfig} from './eslint.config.js';

export * from './eslint.config.js';

// Create a new default export that includes both the array and the named exports as properties
const enhancedConfig = [...defaultConfig];
enhancedConfig.typescriptConfig = typescriptConfig;

// Export the enhanced config as default
export default enhancedConfig;