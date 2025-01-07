import { test, expect, describe } from "vitest";
import { faker } from "@faker-js/faker";
import { db } from "./mocks/db";

describe("test suite", () => {
  test("should", () => {
    const product = db.product.create({ name: "Apple" });
    console.log(product);
  });
});
