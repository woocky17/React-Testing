import { screen } from "@testing-library/react";
import { navigateTo } from "./utils";

describe("Router", () => {
  test("should render the home page for /", () => {
    navigateTo("/");

    expect(screen.getByRole("heading", { name: /home/i })).toBeInTheDocument();
  });
  test("should render the home page for /products", () => {
    navigateTo("/products");

    expect(
      screen.getByRole("heading", { name: /products/i })
    ).toBeInTheDocument();
  });
});
