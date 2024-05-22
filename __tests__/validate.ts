import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";
import {
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
    FRED: "72000",
    THUD: "john-doe.com",
  };

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

  expect(mockLog).toHaveBeenCalledWith(
    "Some environment variables cannot be validated: BAR, BAZ, QUX, QUUX, FRED, THUD",
  );

  expect(mockExit).toHaveBeenCalledOnce();
  expect(mockExit).toHaveBeenCalledWith(1);
});

test("with missing env variables", () => {
  const input = {
    FOO: "foo",
    BAR: "", // empty strings means not set
  };

  validate({
    env: input,
    validators: {
      FOO: string,
      BAR: string,
      BAZ: boolean,
    },
  });

  expect(mockLog).toHaveBeenCalledWith(
    "Some environment variables cannot be validated: BAR, BAZ",
  );

  expect(mockExit).toHaveBeenCalledOnce();
  expect(mockExit).toHaveBeenCalledWith(1);
});

test("with invalid and missing env variables", () => {
  const input = {
    FOO: "foo",
    BAR: "bar",
  };

  validate({
    env: input,
    validators: {
      FOO: string,
      BAR: number,
      BAZ: boolean,
    },
  });

  expect(mockLog).toHaveBeenCalledWith(
    "Some environment variables cannot be validated: BAR, BAZ",
  );

  expect(mockExit).toHaveBeenCalledOnce();
  expect(mockExit).toHaveBeenCalledWith(1);
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
