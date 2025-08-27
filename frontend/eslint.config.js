import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig } from "eslint/config";
import babelParser from "@babel/eslint-parser";

export default defineConfig({
  files: ["**/*.{js,jsx}"],
  languageOptions: {
    parser: babelParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
      requireConfigFile: false,
      babelOptions: {
        presets: ["@babel/preset-react"],
      },
    },
    globals: globals.browser,
  },
  plugins: {
    react: pluginReact,
    "react-hooks": pluginReactHooks,
    "jsx-a11y": pluginJsxA11y,
  },
  rules: {
    // ESLint base rules
    ...js.configs.recommended.rules,

    // React
    "react/jsx-uses-react": "off", // React 17+
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-vars": "error",

    // React Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // JSX accessibility
    "jsx-a11y/alt-text": "warn",
    "jsx-a11y/anchor-is-valid": "warn",

    // no-unused-vars صارم مع استثناء React
    "no-unused-vars": ["warn", { vars: "all", args: "after-used", ignoreRestSiblings: true, varsIgnorePattern: "^React$" }],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
});
