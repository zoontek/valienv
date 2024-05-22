import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";
import { Validator, validate } from "../src";
import { Mock } from "./types";

let mockLog: Mock<typeof console.error> = undefined;
let mockExit: Mock<typeof process.exit> = undefined;

beforeAll(() => {
  mockLog = vi.spyOn(console, "error").mockImplementation(() => {});
  mockExit = vi.spyOn(process, "exit").mockImplementation(() => ({}) as never);
});

afterEach(() => {
  mockLog?.mockReset();
  mockExit?.mockReset();
});

afterAll(() => {
  mockLog?.mockRestore();
  mockExit?.mockRestore();
});

const nodeEnv: Validator<"development" | "test" | "production"> = (value) => {
  if (value === "development" || value === "test" || value === "production") {
    return value;
  }
};

const hex: Validator<string> = (value = "") => {
  if (/^[A-F\d]+$/i.test(value)) {
    return value;
  }
};

const url: Validator<URL> = (value = "") => {
  try {
    return new URL(value);
  } catch {} // eslint-disable-line no-empty
};

test("with valid input", () => {
  const input = {
    NODE_ENV: "test",
    COOKIE_KEY: "aba4a6fb2222ef28d81e4be445a51fba",
    SERVER_URL: "https://github.com",
  };

  const output = validate({
    env: input,
    validators: {
      NODE_ENV: nodeEnv,
      COOKIE_KEY: hex,
      SERVER_URL: url,
    },
  });

  expect(output).toStrictEqual({
    NODE_ENV: "test",
    COOKIE_KEY: "aba4a6fb2222ef28d81e4be445a51fba",
    SERVER_URL: new URL("https://github.com"),
  });
});

test("with invalid input", () => {
  const input = {
    NODE_ENV: "staging",
    SERVER_URL: "youtube",
    COOKIE_KEY: "invalid hex",
  };

  validate({
    env: input,
    validators: {
      NODE_ENV: nodeEnv,
      SERVER_URL: url,
      COOKIE_KEY: hex,
    },
  });

  expect(mockLog).toHaveBeenCalledWith(
    "Some environment variables cannot be validated: NODE_ENV, SERVER_URL, COOKIE_KEY",
  );

  expect(mockExit).toHaveBeenCalledOnce();
  expect(mockExit).toHaveBeenCalledWith(1);
});

test("with invalid overrides", () => {
  // overrides are not validated, it will not throw
  const input = {
    COOKIE_KEY: "aba4a6fb2222ef28d81e4be445a51fba",
    SERVER_URL: "https://github.com",
  };

  const output = validate({
    env: input,
    validators: {
      COOKIE_KEY: hex,
      SERVER_URL: url,
    },
    overrides: {
      COOKIE_KEY: "invalid hex",
      SERVER_URL: new URL("https://github.com"),
    },
  });

  expect(output).toStrictEqual({
    COOKIE_KEY: "invalid hex",
    SERVER_URL: new URL("https://github.com"),
  });
});
