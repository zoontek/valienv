import { expect, test } from "vitest";
import { EnvValidationError, Validator, validate } from "../src";

const nodeEnv: Validator<"development" | "test" | "production"> = (value) => {
  if (value === "development" || value === "test" || value === "production") {
    return value;
  }
};

const email: Validator<string> = (value = "") => {
  if (/.+@.+\..+/.test(value)) {
    return value;
  }
};

const url: Validator<URL> = (value = "") => {
  try {
    return new URL(value);
  } catch {} // eslint-disable-line no-empty
};

const port: Validator<number> = (value = "") => {
  const number = Number.parseInt(value, 10);

  if (number > 0 && number < 65536) {
    return number;
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

  expect(output).toStrictEqual({
    NODE_ENV: "test",
    USER_EMAIL: "zoontek@github.com",
    SERVER_URL: new URL("https://github.com"),
    SERVER_PORT: 3000,
  });
});

test("with invalid input", () => {
  const input = {
    NODE_ENV: "staging",
    USER_EMAIL: "mathieu",
    SERVER_URL: "youtube",
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
      "Some environment variables cannot be validated: NODE_ENV, USER_EMAIL, SERVER_URL, SERVER_PORT",
    );

    expect((error as EnvValidationError).variables).toStrictEqual([
      "NODE_ENV",
      "USER_EMAIL",
      "SERVER_URL",
      "SERVER_PORT",
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
      SERVER_URL: new URL("https://github.com"),
      SERVER_PORT: 0,
    },
  });

  expect(output).toStrictEqual({
    SERVER_URL: new URL("https://github.com"),
    SERVER_PORT: 0,
  });
});
