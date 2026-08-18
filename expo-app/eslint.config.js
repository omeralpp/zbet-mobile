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
  },
  {
    // Repository tooling, not app code: it runs in Node and reporting to stdout
    // is the entire point of it.
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        URL: "readonly",
        console: "readonly",
        process: "readonly"
      }
    },
    rules: {
      "no-console": "off"
    }
  }
]);
