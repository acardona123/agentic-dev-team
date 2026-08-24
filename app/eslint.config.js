// Flat config. `expo` bundles the TS + React Native rules we want; nothing custom
// yet — additions get justified in the story that needs them.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', 'node_modules/*'] },
]);
