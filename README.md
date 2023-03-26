# ✓ valienv

A simple environment variables validator for Node.js, web browsers and React Native.

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

This library exports a main function: `validate`.<br>
Using `validators`, you can parse, validate and type required environment variables (other variables will be excluded).

```ts
import { boolean, number, oneOf, string, validate } from "valienv";

// with process.env = {
//   ACCENT_COLOR: "#0099e5",
//   TIMEOUT_MS: "5000",
//   ENABLE_ANALYTICS: "true",
//   NODE_ENV: "development",
// }

export const env = validate({
  env: process.env,
  validators: {
    // we validate env using bundled validators
    ACCENT_COLOR: string,
    TIMEOUT_MS: number,
    ENABLE_ANALYTICS: boolean,
    NODE_ENV: oneOf("development", "test", "production"),
  },
});

// -> typeof env = Readonly<{
//   ACCENT_COLOR: string;
//   TIMEOUT_MS: number;
//   ENABLE_ANALYTICS: boolean;
//   NODE_ENV: "development" | "test" | "production";
// }>
```

_⚠️  In case of incorrect environment variables, the function will throw an `EnvValidationError` exposing `invalidVariables` and `missingVariables` names (not their values) to prevent your application from starting._

## 📕 Advanced usage

The `validate` function accepts an `overrides` option.

#### overrides

The `overrides` option is useful to override some variables in some contexts.

```ts
import { string, validate } from "valienv";

// with process.env = {
//   CONTACT_EMAIL: "zoontek@github.com",
// }

export const env = validate({
  env: process.env,
  validators: {
    CONTACT_EMAIL: string,
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

## Custom validators

By default, `valienv` only exports 3 validators: `string`, `number` and `boolean`. It also offers `oneOf`, a helper to create validators for union of string literals.

It's very easy to write your own:

```ts
import { validate, Validator } from "valienv";

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

export const env = validate({
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
import { validate } from "valienv";

// with process.env = {
//   ETHEREUM_ADDRESS: "0xb794f5ea0ba39494ce839613fffba74279579268",
//   OPENED_COUNTRIES: "FR,BE,DE",
// }

export const env = validate({
  env: process.env,
  validators: {
    // inlined validators return types are correctly inferred
    ETHEREUM_ADDRESS: (value) => {
      if (validator.isEthereumAddress(value)) {
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
//   OPENED_COUNTRIES: string[];
// }>
```

## Optional values

As it's a common pattern to have some optional environment values, you can write a small helper to wrap every validator with:

```ts
import { string, validate } from "valienv";

// Here's we are using a simple TS discriminating union:
type OptionalEnvValue<T> = { isSet: true; value: T } | { isSet: false };

const optional =
  <T>(validator: Validator<T>): Validator<OptionalEnvValue<T>> =>
  (value) => {
    const result = validator(value);

    return typeof result !== "undefined"
      ? { isSet: true, value: result }
      : { isSet: false };
  };

const env = validate({
  env: process.env,
  validators: {
    FOO: optional(string),
  },
});

if (env.FOO.isSet) {
  console.log(env.FOO.value); // FOO.value can only be accessed when isSet is true
}
```

But you can also wrap them using a library of your choice:

```ts
import { string, validate } from "valienv";
import { Option } from "@swan-io/boxed";

const optional =
  <T>(validator: Validator<T>): Validator<Option<T>> =>
  (value) =>
    Option.fromUndefined(validator(value));

const env = validate({
  env: process.env,
  validators: {
    FOO: optional(string),
  },
});

env.FOO.match({
  Some: (value) => {
    // env.FOO is set, you can use its value
  },
  None: () => {
    // env.FOO isn't set
  },
});
```

## ❓ Questions

### Why not handling `NODE_ENV` for us?

Frontend bundlers generally **statically replace** `process.env.NODE_ENV` values at build time, allowing minifiers like [`terser`](https://github.com/terser/terser) to eliminate dead code from production build. Aliasing `NODE_ENV` would prevent such optimisations.<br />
But if you are working with Node.js, feel free to use `oneOf` on `NODE_ENV` if you want.
