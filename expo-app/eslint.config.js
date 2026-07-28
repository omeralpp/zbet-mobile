const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      ".expo/**",
      ".codex-artifacts/**",
      "dist/**",
      "android/**",
      "ios/**",
      "coverage/**"
    ]
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  }
]);
