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

  expect(output).toEqual({
    FOO: "foo",
    BAR: 42,
    BAZ: true,
    QUX: "a",
  });
});

test("with valid input (as mixed literals)", () => {
  const input = {
    FOO: "foo",
    BAR: 42,
    BAZ: true,
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

  expect(output).toEqual({
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

  expect(output).toEqual({
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

    expect(error.invalidVariables).toEqual(["BAR", "BAZ", "QUX"]);
    expect(error.missingVariables).toEqual([]);
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

    expect(error.invalidVariables).toEqual([]);
    expect(error.missingVariables).toEqual(["BAR", "BAZ"]);
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

    expect((error as EnvValidationError).invalidVariables).toEqual(["BAR"]);
    expect((error as EnvValidationError).missingVariables).toEqual(["BAZ"]);
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

  expect(output).toEqual({
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

  expect(output).toEqual({
    FOO: "foo",
    BAR: 42,
    BAZ: true,
  });
});
