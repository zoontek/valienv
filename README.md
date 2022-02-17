# ✓ valienv

A simple environment variables validator for Node.js and web browsers.

[![mit licence](https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge)](https://github.com/zoontek/valienv/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/valienv?style=for-the-badge)](https://www.npmjs.org/package/valienv)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/valienv?label=size&style=for-the-badge)](https://bundlephobia.com/result?p=valienv)

## Installation

```sh
$ npm i valienv --save
# --- or ---
$ yarn add valienv
```

## 📘 Basic usage

This library exports a main function: `validateEnv`.<br>
Using `validators`, you can parse, validate and type required environment variables (other variables will be excluded).

```ts
import { bool, nbr, str, validateEnv } from "valienv";

// with process.env = {
//   ACCENT_COLOR: "#0099e5",
//   TIMEOUT_MS: "5000",
//   ENABLE_ANALYTICS: "true",
// }

export const env = validateEnv({
  env: process.env,
  validators: {
    // we validate env using bundled validators
    ACCENT_COLOR: str,
    TIMEOUT_MS: nbr,
    ENABLE_ANALYTICS: bool,
  },
});

// -> typeof env = Readonly<{
//   ACCENT_COLOR: string;
//   TIMEOUT_MS: number;
//   ENABLE_ANALYTICS: boolean;
// }>
```

_⚠️  In case of incorrect environment variables, the function will throw an `EnvValidationError` exposing `invalidVariables` and `missingVariables` names (not their values) and preventing your application start._

## 📕 Advanced usage

The `validateEnv` function accepts `prefix` and `overrides` options.

#### prefix

Some bundlers only expose prefixed environment variables to your application (ex: [Create React App](https://create-react-app.dev/docs/adding-custom-environment-variables/), [Vite](https://vitejs.dev/guide/env-and-mode.html)).<br>
The `prefix` option is very useful to remove them.

```ts
import { str, validateEnv } from "valienv";

// with process.env = {
//   REACT_APP_CONTACT_EMAIL: "zoontek@github.com",
// }

export const env = validateEnv({
  env: process.env,
  prefix: "REACT_APP_",
  validators: {
    CONTACT_EMAIL: str,
  },
});

// -> typeof env = Readonly<{ CONTACT_EMAIL: string }>
```

#### overrides

The `overrides` option is useful to override some variables in some contexts.

```ts
import { str, validateEnv } from "valienv";

// with process.env = {
//   CONTACT_EMAIL: "zoontek@github.com",
// }

export const env = validateEnv({
  env: process.env,
  validators: {
    CONTACT_EMAIL: str,
  },
  overrides: {
    ...(process.env.NODE_ENV === "test" && {
      CONTACT_EMAIL: "no-mail",
    }),
  },
});

// -> typeof env = Readonly<{ CONTACT_EMAIL: string }>
```

_⚠️  The values set has to be correctly typed but are **not** validated._

## 🔧 Custom validators

By default, `valienv` only exports 3 validators: `str` (for `string`), `nbr` (for `number`) and `bool` (for `boolean`).<br>
But it's very easy to write your own:

```ts
import { validateEnv, Validator } from "valienv";

// A validator take raw input, try to parse it and
// returns the result in case of valid value:
const port: Validator<number> = (value /*: string*/) => {
  const parsed = parseInt(value);

  if (parsed > 0 && parsed < 65536) {
    return parsed;
  }
};

// with process.env = {
//   PORT: "3000",
// }

export const env = validateEnv({
  env: process.env,
  validators: {
    PORT: port,
  },
});

// -> typeof env = Readonly<{ PORT: number }>
```

You can even go wild by using stricter types, complex parsing, your favorite validation library, etc! 🔥

```ts
import validator from "validator";
import { validateEnv } from "valienv";

// with process.env = {
//   ETHEREUM_ADDRESS: "0xb794f5ea0ba39494ce839613fffba74279579268",
//   NODE_ENV: "development",
//   OPENED_COUNTRIES: "FR,BE,DE",
// }

export const env = validateEnv({
  env: process.env,
  validators: {
    // inlined validators return types are correctly infered
    ETHEREUM_ADDRESS: (value) => {
      if (validator.isEthereumAddress(value)) {
        return value;
      }
    },
    NODE_ENV: (value) => {
      if (
        value === "development" ||
        value === "test" ||
        value === "production"
      ) {
        return value;
      }
    },
    OPENED_COUNTRIES: (value) => {
      const array = value.split(",");

      if (array.every(validator.isISO31661Alpha2)) {
        return array;
      }
    },
  },
});

// -> typeof env = Readonly<{
//   ETHEREUM_ADDRESS: string;
//   NODE_ENV: "development" | "production" | "test";
//   OPENED_COUNTRIES: string[];
// }>
```

## ❓ Questions

### Why not handling `NODE_ENV` for us?

Frontend bundlers generally **statically replace** `process.env.NODE_ENV` values at building time, allowing minifiers like [`terser`](https://github.com/terser/terser) to eliminate dead code from production build. Aliasing `NODE_ENV` would prevent such optimisations. But if your are working with Node.js, feel free to implement a custom validator for it if you want 🙂!
