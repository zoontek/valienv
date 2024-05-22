import { MockInstance } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Mock<T extends (...args: any[]) => any> =
  | MockInstance<Parameters<T>, ReturnType<T>>
  | undefined;
