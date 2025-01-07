import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { db } from "../mocks/db";

describe("ProductDetail", () => {
  let productId: number;

  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const product = db.product.create();
      productId = product.id;
    });
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: productId } } });
  });

  test("should render the product details", async () => {
    const product = db.product.findFirst({
      where: { id: { equals: productId } },
    });
    render(<ProductDetail productId={productId} />);

    expect(
      await screen.findByText(new RegExp(product!.name))
    ).toBeInTheDocument();
    expect(
      await screen.findByText(new RegExp(product!.price.toString()))
    ).toBeInTheDocument();
  });

  test("should render message if product not found", async () => {
    server.use(
      http.get("/products/:id", () => {
        return HttpResponse.json(null);
      })
    );
    render(<ProductDetail productId={productId} />);

    const message = await screen.findByText(/not found/i);
    expect(message).toBeInTheDocument();
  });

  test("should render an error for invalid product id", async () => {
    render(<ProductDetail productId={0} />);

    const error = await screen.findByText(/invalid/i);
    expect(error).toBeInTheDocument();
  });

  test("should render an error message when fetch fails", async () => {
    server.use(
      http.get("/products/:id", () => {
        return HttpResponse.error();
      })
    );

    render(<ProductDetail productId={0} />);

    const error = await screen.findByText(/error/i);
    expect(error).toBeInTheDocument();
  });
});
