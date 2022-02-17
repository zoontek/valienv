"use strict";

const path = require("path");

module.exports = {
  plugins: ["@typescript-eslint"],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],

  env: {
    browser: true,
    node: true,
  },

  parserOptions: {
    project: path.join(__dirname, "tsconfig.json"),
  },

  rules: {
    "no-implicit-coercion": "error",
    "no-param-reassign": "error",
    "object-shorthand": "error",

    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-check": true, "ts-expect-error": false },
    ],

    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/no-base-to-string": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
  },
};
