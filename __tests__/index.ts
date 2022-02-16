import { hello } from "../src";

test("hello", () => {
  expect(hello()).toBe("Hello world!");
});
