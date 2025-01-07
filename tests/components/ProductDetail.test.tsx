import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { products } from "../mocks/data";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

describe("ProductDetail", () => {
  const firstProduct = 0;
  test("should render the list of products", async () => {
    render(<ProductDetail productId={products[firstProduct].id} />);

    expect(
      await screen.findByText(new RegExp(products[firstProduct].name))
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        new RegExp(products[firstProduct].price.toString())
      )
    ).toBeInTheDocument();
  });

  test("should render message if product not found", async () => {
    server.use(
      http.get("/products/:id", () => {
        return HttpResponse.json(null);
      })
    );
    render(<ProductDetail productId={products[firstProduct].id} />);

    const message = await screen.findByText(/not found/i);
    expect(message).toBeInTheDocument();
  });

  test("should render an error for invalid product id", async () => {
    render(<ProductDetail productId={0} />);

    const error = await screen.findByText(/invalid/i);
    expect(error).toBeInTheDocument();
  });
});
