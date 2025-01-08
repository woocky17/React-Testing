import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";
import { db } from "../mocks/db";
import { Category, Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";
import { simulateDelay, simulateError } from "../utils";

describe("BrowseProducts", () => {
  const categories: Category[] = [];
  const products: Product[] = [];

  beforeAll(() => {
    [1, 2].forEach((item) => {
      categories.push(db.category.create({ name: "Category" + item }));
    });
    [1, 2, 3].forEach(() => {
      products.push(db.product.create());
    });
  });

  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });

    const productIds = products.map((p) => p.id);
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  const renderBrowseProducts = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>
    );
    return {
      getCategoriesSkeletons: () =>
        screen.queryByRole("progressbar", { name: /categories/i }),
      getProductSkeletons: () =>
        screen.queryByRole("progressbar", { name: /products/i }),
      getCategoriesComboBox: () => screen.queryByRole("combobox"),
    };
  };

  test("should render a skeleton when the page is loading categories", () => {
    simulateDelay("/categories");

    renderBrowseProducts();

    expect(
      screen.getByRole("progressbar", { name: /categories/i })
    ).toBeInTheDocument();
  });

  test("should hide the skeleton after the page finish loading categories", async () => {
    const { getCategoriesSkeletons } = renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeletons);
  });

  test("should render a skeleton when the page is loading products", () => {
    simulateDelay("/products");

    renderBrowseProducts();

    expect(
      screen.getByRole("progressbar", { name: /products/i })
    ).toBeInTheDocument();
  });

  test("should hide the skeleton after the page finish loading products", async () => {
    const { getProductSkeletons } = renderBrowseProducts();

    await waitForElementToBeRemoved(getProductSkeletons);
  });

  test("should not render an error in case that the categories page can't load", async () => {
    simulateError("/categories");

    const { getCategoriesSkeletons, getCategoriesComboBox } =
      renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeletons);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(getCategoriesComboBox()).not.toBeInTheDocument;
  });

  test("should render error message in case that the products page can't load", async () => {
    simulateError("/products");

    renderBrowseProducts();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  test("should render categories", async () => {
    const { getCategoriesSkeletons, getCategoriesComboBox } =
      renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeletons);

    const combobox = getCategoriesComboBox();
    expect(combobox).toBeInTheDocument;

    const user = userEvent.setup();
    await user.click(combobox!);

    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((category) => {
      expect(
        screen.getByRole("option", { name: category.name })
      ).toBeInTheDocument();
    });
  });

  test("should render products", async () => {
    const { getProductSkeletons } = renderBrowseProducts();

    await waitForElementToBeRemoved(getProductSkeletons);

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });
});