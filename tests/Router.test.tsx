import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import routes from "../src/routes";

describe("Router", () => {
  test("should render the home page for /", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { name: /home/i })).toBeInTheDocument();
  });
  test("should render the home page for /products", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/products"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { name: /products/i })
    ).toBeInTheDocument();
  });
});
