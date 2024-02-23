import { expect, test } from "vitest";
import {
  EnvValidationError,
  boolean,
  email,
  number,
  oneOf,
  optional,
  port,
  string,
  url,
  validate,
} from "../src";

test("with valid input", () => {
  const input = {
    FOO: "foo",
    BAR: "42",
    BAZ: "true",
    QUX: "a",
    QUUX: "https://swan.io",
    FRED: "8080",
    THUD: "john@doe.com",
  };

  const output = validate({
    env: input,
    validators: {
      FOO: string,
      BAR: number,
      BAZ: boolean,
      QUX: oneOf("a", "b"),
      QUUX: url,
      FRED: port,
      THUD: email,
    },
  });

  expect(output).toStrictEqual({
    FOO: "foo",
    BAR: 42,
    BAZ: true,
    QUX: "a",
    QUUX: "https://swan.io",
    FRED: 8080,
    THUD: "john@doe.com",
  });
});

test("with extra env variables", () => {
  const input = {
    FOO: "foo",
    BAR: "42",
    BAZ: "true",
  };

  const output = validate({
    env: input,
    validators: {
      FOO: string,
    },
  });

  expect(output).toStrictEqual({
    FOO: "foo",
  });
});

test("with invalid env variables", () => {
  const input = {
    FOO: "foo",
    BAR: "bar",
    BAZ: "baz",
    QUX: "c",
    QUUX: "swan.io",
    FRED: 72000,
    THUD: "john-doe.com",
  };

  try {
    validate({
      env: input,
      validators: {
        FOO: string,
        BAR: number,
        BAZ: boolean,
        QUX: oneOf("a", "b"),
        QUUX: url,
        FRED: port,
        THUD: email,
      },
    });
  } catch (e) {
    expect(e).toBeInstanceOf(EnvValidationError);
    const error = e as EnvValidationError;

    expect(error.variables).toStrictEqual([
      "BAR",
      "BAZ",
      "QUX",
      "QUUX",
      "FRED",
      "THUD",
    ]);
  }
});

test("with missing env variables", () => {
  const input = {
    FOO: "foo",
    BAR: "", // empty strings means not set
  };

  try {
    validate({
      env: input,
      validators: {
        FOO: string,
        BAR: string,
        BAZ: boolean,
      },
    });
  } catch (e) {
    expect(e).toBeInstanceOf(EnvValidationError);
    const error = e as EnvValidationError;
    expect(error.variables).toStrictEqual(["BAR", "BAZ"]);
  }
});

test("with invalid and missing env variables", () => {
  const input = {
    FOO: "foo",
    BAR: "bar",
  };

  try {
    validate({
      env: input,
      validators: {
        FOO: string,
        BAR: number,
        BAZ: boolean,
      },
    });
  } catch (error) {
    expect(error).toBeInstanceOf(EnvValidationError);

    expect((error as EnvValidationError).variables).toStrictEqual([
      "BAR",
      "BAZ",
    ]);
  }
});

test("with overrides", () => {
  const input = {
    FOO: "foo",
    BAR: "42",
    BAZ: "1",
  };

  const output = validate({
    env: input,
    validators: {
      FOO: string,
      BAR: number,
      BAZ: boolean,
    },
    overrides: {
      FOO: "overriddenFoo",
    },
  });

  expect(output).toStrictEqual({
    FOO: "overriddenFoo",
    BAR: 42,
    BAZ: true,
  });
});

test("with missing env variables and overrides", () => {
  const input = {
    FOO: "foo",
  };

  const output = validate({
    env: input,
    validators: {
      FOO: string,
      BAR: number,
      BAZ: boolean,
    },
    overrides: {
      BAR: 42,
      BAZ: true,
    },
  });

  expect(output).toStrictEqual({
    FOO: "foo",
    BAR: 42,
    BAZ: true,
  });
});

test("with optional values", () => {
  const input = {
    FOO: "foo",
    BAR: "", // empty strings means not set
    QUX: "a",
  };

  const output = validate({
    env: input,
    validators: {
      FOO: string,
      BAR: optional(string),
      BAZ: optional(number),
      QUX: optional(oneOf("a", "b")),
    },
  });

  expect(output).toStrictEqual({
    FOO: "foo",
    BAR: { defined: false },
    BAZ: { defined: false },
    QUX: { defined: true, value: "a" },
  });
});
