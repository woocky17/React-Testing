import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import { db } from "../mocks/db";
import AllProviders from "../AllProviders";

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
    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

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
    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

    const message = await screen.findByText(/not found/i);
    expect(message).toBeInTheDocument();
  });

  test("should render an error for invalid product id", async () => {
    render(<ProductDetail productId={0} />, { wrapper: AllProviders });

    const error = await screen.findByText(/invalid/i);
    expect(error).toBeInTheDocument();
  });

  test("should render an error message when fetch fails", async () => {
    server.use(
      http.get("/products/:id", () => {
        return HttpResponse.error();
      })
    );

    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

    const error = await screen.findByText(/error/i);
    expect(error).toBeInTheDocument();
  });

  test("should render a loading indicator when is loading", async () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  test("should remove the loading indicator once is finish loading", async () => {
    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  test("should remove the loading indicator if the loading fails", async () => {
    server.use(
      http.get("/products", () => {
        return HttpResponse.error();
      })
    );
    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
