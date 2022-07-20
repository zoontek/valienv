import { expect, test } from "vitest";
import { EnvValidationError, validate, Validator } from "../src";

const nodeEnv: Validator<"development" | "test" | "production"> = (value) => {
  if (value === "development" || value === "test" || value === "production") {
    return value;
  }
};

const email: Validator<string> = (value) => {
  if (/.+@.+\..+/.test(value)) {
    return value;
  }
};

const url: Validator<string> = (value) => {
  try {
    new URL(value);
    return value;
  } catch (_error) {} // eslint-disable-line no-empty
};

const port: Validator<number> = (value) => {
  const parsed = parseInt(value);

  if (parsed > 0 && parsed < 65536) {
    return parsed;
  }
};

test("with valid input", () => {
  const input = {
    NODE_ENV: "test",
    USER_EMAIL: "zoontek@github.com",
    SERVER_URL: "https://github.com",
    SERVER_PORT: "3000",
  };

  const output = validate({
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
    validate({
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

    expect((error as EnvValidationError).message).toBe(
      [
        "Some environment variables cannot be validated",
        "Invalid variables: NODE_ENV, SERVER_PORT",
        "Missing variables: USER_EMAIL, SERVER_URL",
      ].join("\n"),
    );

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

  const output = validate({
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
