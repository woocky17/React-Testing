import { test, expect, describe } from "vitest";
import { faker } from "@faker-js/faker";

describe("test suite", () => {
  test("should", () => {
    console.log({
      name: faker.commerce.productName(),
      price: faker.commerce.price({ min: 1, max: 100 }),
    });
  });
});
