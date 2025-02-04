import js from "@eslint/js";
import globals from "globals";
import ts from "typescript-eslint";

const typescriptRules = [ts.configs.eslintRecommended, ...ts.configs.recommended]
  .map(config => config.rules)
  .reduce((acc, rules) => ({ ...acc, ...rules }), {});

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    files: ["__tests__/**/*.ts", "src/**/*.ts"],

    plugins: {
      "@typescript-eslint": ts.plugin,
    },

    languageOptions: {
      sourceType: "module",
      parser: ts.parser,

      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: false,
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      ...typescriptRules,

      "no-implicit-coercion": "error",
      "no-param-reassign": "error",
      "object-shorthand": "error",

      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-check": true, "ts-expect-error": false },
      ],

      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
      "@typescript-eslint/no-unsafe-declaration-merging": "error",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/prefer-as-const": "error",
    },
  }
];
