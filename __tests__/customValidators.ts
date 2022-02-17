import { EnvValidationError, validateEnv, Validator } from "../src";

const nodeEnv: Validator<"development" | "test" | "production"> = (input) => {
  if (input === "development" || input === "test" || input === "production")
    return input;
};

const email: Validator<string> = (input) => {
  if (/.+@.+\..+/.test(input)) return input;
};

const url: Validator<string> = (input) => {
  try {
    new URL(input);
    return input;
  } catch (_error) {} // eslint-disable-line no-empty
};

const port: Validator<number> = (input) => {
  const parsed = parseInt(input);
  if (parsed > 0 && parsed < 65536) return parsed;
};

test("with valid input", () => {
  const input = {
    NODE_ENV: "test",
    USER_EMAIL: "zoontek@github.com",
    SERVER_URL: "https://github.com",
    SERVER_PORT: "3000",
  };

  const output = validateEnv({
    env: input,
    validators: {
      NODE_ENV: nodeEnv,
      USER_EMAIL: email,
      SERVER_URL: url,
      SERVER_PORT: port,
    },
  });

  expect(output).toEqual({
    NODE_ENV: "test",
    USER_EMAIL: "zoontek@github.com",
    SERVER_URL: "https://github.com",
    SERVER_PORT: 3000,
  });
});

test("with invalid input", () => {
  const input = {
    NODE_ENV: "staging",
    SERVER_PORT: "three thousand",
  };
  try {
    validateEnv({
      env: input,
      validators: {
        NODE_ENV: nodeEnv,
        USER_EMAIL: email,
        SERVER_URL: url,
        SERVER_PORT: port,
      },
    });
  } catch (error) {
    expect(error).toBeInstanceOf(EnvValidationError);

    expect((error as EnvValidationError).invalidVariables).toEqual([
      "NODE_ENV",
      "SERVER_PORT",
    ]);

    expect((error as EnvValidationError).missingVariables).toEqual([
      "USER_EMAIL",
      "SERVER_URL",
    ]);
  }
});

test("with invalid overrides", () => {
  // overrides are not validated, it will not throw
  const input = {
    SERVER_URL: "https://github.com",
    SERVER_PORT: "3000",
  };

  const output = validateEnv({
    env: input,
    validators: {
      SERVER_URL: url,
      SERVER_PORT: port,
    },
    overrides: {
      SERVER_URL: "",
      SERVER_PORT: 0,
    },
  });

  expect(output).toEqual({
    SERVER_URL: "",
    SERVER_PORT: 0,
  });
});
