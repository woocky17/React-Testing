import { screen } from "@testing-library/react";
import { db } from "../mocks/db";
import { navigateTo } from "../utils";
import { Product } from "../../src/entities";

describe("ProductDetailPage", () => {
  let product: Product;
  beforeAll(() => {
    product = db.product.create();
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: product.id } } });
  });

  test("should render product details", async () => {
    navigateTo("/products/" + product.id);

    expect(
      await screen.findByRole("heading", { name: product.name })
    ).toBeInTheDocument();
    expect(screen.getByText("$" + product.price)).toBeInTheDocument();
  });
});
