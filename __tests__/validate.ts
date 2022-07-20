import { expect, test } from "vitest";
import {
  boolean,
  EnvValidationError,
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

test("with prefix", () => {
  const input = {
    REACT_APP_FOO: "foo",
    REACT_APP_BAR: "42",
    REACT_APP_BAZ: "true",
  };

  const output = validate({
    env: input,
    prefix: "REACT_APP_",
    validators: {
      FOO: string,
      BAR: number,
      BAZ: boolean,
    },
  });

  expect(output).toEqual({
    FOO: "foo",
    BAR: 42,
    BAZ: true,
  });
});

test("with prefix and env variables without it", () => {
  const input = {
    REACT_APP_FOO: "foo",
    BAR: "42",
    BAZ: "true",
  };

  try {
    validate({
      env: input,
      prefix: "REACT_APP_",
      validators: {
        FOO: string,
        BAR: number,
        BAZ: boolean,
      },
    });
  } catch (error) {
    expect(error).toBeInstanceOf(EnvValidationError);

    expect((error as EnvValidationError).invalidVariables).toEqual([]);
    expect((error as EnvValidationError).missingVariables).toEqual([
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

test("with prefix and overrides", () => {
  const input = {
    REACT_APP_FOO: "foo",
  };

  const output = validate({
    env: input,
    prefix: "REACT_APP_",
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
