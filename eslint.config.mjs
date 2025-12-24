import js from "@eslint/js";
import globals from "globals";
import svelte from 'eslint-plugin-svelte';
// import svelteConfig from './svelte.config.js';

export default [
  {
    ignores: ["dist-extension/*", "build", "chrome", "docs"]
  },
  js.configs.recommended,
  ...svelte.configs.recommended,
  {
    "rules": {
      "dot-notation": 2,
      "max-statements-per-line": 2,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        // ...globals.webextensions,
      }
    },
  },
  {
    files: ["test/**/*.js", "*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      }
    }
  },
  // {
  //   files: ["**/*.svelte.js", "**/*.svelte"],
  //   languageOptions: {
  //     parserOptions: {
  //       svelteConfig,
  //     }
  //   }
  // }
];
