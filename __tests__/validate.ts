import { expect, test } from "vitest";
import {
  EnvValidationError,
  boolean,
  number,
  oneOf,
  string,
  validate,
} from "../src";

test("with valid input", () => {
  const input = {
    FOO: "foo",
    BAR: "42",
    BAZ: "true",
    QUX: "a",
  };

  const output = validate({
    env: input,
    validators: {
      FOO: string,
      BAR: number,
      BAZ: boolean,
      QUX: oneOf("a", "b"),
    },
  });

  expect(output).toStrictEqual({
    FOO: "foo",
    BAR: 42,
    BAZ: true,
    QUX: "a",
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
  };

  try {
    validate({
      env: input,
      validators: {
        FOO: string,
        BAR: number,
        BAZ: boolean,
        QUX: oneOf("a", "b"),
      },
    });
  } catch (e) {
    expect(e).toBeInstanceOf(EnvValidationError);
    const error = e as EnvValidationError;
    expect(error.variables).toStrictEqual(["BAR", "BAZ", "QUX"]);
  }
});

test("with missing env variables", () => {
  const input = {
    FOO: "foo",
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
    BAZ: "true",
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
