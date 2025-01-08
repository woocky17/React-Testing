import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import { Theme } from "@radix-ui/themes";

describe("BrowseProducts", () => {
  const renderBrowseProducts = () => {
    render(
      <Theme>
        <BrowseProducts />
      </Theme>
    );
  };

  test("should render a skeleton when the page is loading categories", () => {
    server.use(
      http.get("/categories", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderBrowseProducts();

    expect(
      screen.getByRole("progressbar", { name: /categories/i })
    ).toBeInTheDocument();
  });

  test("should hide the skeleton after the page finish loading categories", async () => {
    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /categories/i })
    );
  });

  test("should render a skeleton when the page is loading products", () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderBrowseProducts();

    expect(
      screen.getByRole("progressbar", { name: /products/i })
    ).toBeInTheDocument();
  });

  test("should hide the skeleton after the page finish loading products", async () => {
    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /products/i })
    );
  });

  test("should render null in case that the categories page can't load", async () => {
    server.use(
      http.get("/categories", () => {
        return HttpResponse.error();
      })
    );

    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /categories/i })
    );

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /categories/i })).not
      .toBeInTheDocument;
  });

  test("should render error message in case that the products page can't load", async () => {
    server.use(
      http.get("/products", () => {
        return HttpResponse.error();
      })
    );

    renderBrowseProducts();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
