import { bool, EnvValidationError, nbr, str, validateEnv } from "../src";

test("with valid input", () => {
  const input = {
    FOO: "foo",
    BAR: "42",
    BAZ: "true",
  };

  const output = validateEnv({
    env: input,
    validators: {
      FOO: str,
      BAR: nbr,
      BAZ: bool,
    },
  });

  expect(output).toEqual({
    FOO: "foo",
    BAR: 42,
    BAZ: true,
  });
});

test("with valid input (as mixed literals)", () => {
  const input = {
    FOO: "foo",
    BAR: 42,
    BAZ: true,
  };

  const output = validateEnv({
    env: input,
    validators: {
      FOO: str,
      BAR: nbr,
      BAZ: bool,
    },
  });

  expect(output).toEqual({
    FOO: "foo",
    BAR: 42,
    BAZ: true,
  });
});

test("with extra env variables", () => {
  const input = {
    FOO: "foo",
    BAR: "42",
    BAZ: "true",
  };

  const output = validateEnv({
    env: input,
    validators: {
      FOO: str,
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
  };

  try {
    validateEnv({
      env: input,
      validators: {
        FOO: str,
        BAR: nbr,
        BAZ: bool,
      },
    });
  } catch (error) {
    expect(error).toBeInstanceOf(EnvValidationError);

    expect((error as EnvValidationError).invalidVariables).toEqual([
      "BAR",
      "BAZ",
    ]);
    expect((error as EnvValidationError).missingVariables).toEqual([]);
  }
});

test("with missing env variables", () => {
  const input = {
    FOO: "foo",
  };

  try {
    validateEnv({
      env: input,
      validators: {
        FOO: str,
        BAR: nbr,
        BAZ: bool,
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

test("with invalid and missing env variables", () => {
  const input = {
    FOO: "foo",
    BAR: "bar",
  };

  try {
    validateEnv({
      env: input,
      validators: {
        FOO: str,
        BAR: nbr,
        BAZ: bool,
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

  const output = validateEnv({
    env: input,
    prefix: "REACT_APP_",
    validators: {
      FOO: str,
      BAR: nbr,
      BAZ: bool,
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
    validateEnv({
      env: input,
      prefix: "REACT_APP_",
      validators: {
        FOO: str,
        BAR: nbr,
        BAZ: bool,
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

  const output = validateEnv({
    env: input,
    validators: {
      FOO: str,
      BAR: nbr,
      BAZ: bool,
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

  const output = validateEnv({
    env: input,
    validators: {
      FOO: str,
      BAR: nbr,
      BAZ: bool,
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

  const output = validateEnv({
    env: input,
    prefix: "REACT_APP_",
    validators: {
      FOO: str,
      BAR: nbr,
      BAZ: bool,
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
