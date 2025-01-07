import { test, expect, describe } from "vitest";

describe("test suite", () => {
  test("should", async () => {
    const response = fetch("/categories");
    const data = await (await response).json();
    console.log(data);

    expect(1).toBe(1);
  });
});
