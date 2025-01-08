import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Category, Product } from "../../src/entities";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import AllProviders from "../AllProviders";
import { db, getProductsByCategory } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";

describe("BrowseProducts", () => {
  const categories: Category[] = [];
  const products: Product[] = [];

  beforeAll(() => {
    [1, 2].forEach((item) => {
      const category = db.category.create({ name: "Category" + item });
      categories.push(category);
      products.push(db.product.create({ categoryId: category.id }));
    });
  });

  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });

    const productIds = products.map((p) => p.id);
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  const renderBrowseProducts = () => {
    render(<BrowseProducts />, { wrapper: AllProviders });

    const getCategoriesSkeletons = () =>
      screen.queryByRole("progressbar", { name: /categories/i });

    const getProductSkeletons = () =>
      screen.queryByRole("progressbar", { name: /products/i });

    const getCategoriesComboBox = () => screen.queryByRole("combobox");

    const user = userEvent.setup();

    const selectCategory = async (name: RegExp | string) => {
      await waitForElementToBeRemoved(getCategoriesSkeletons);
      const combobox = getCategoriesComboBox();
      await user.click(combobox!);

      const option = screen.getByRole("option", {
        name,
      });
      await user.click(option);
    };

    const expectProductsToBeInTheDocument = (products: Product[]) => {
      const rows = screen.getAllByRole("row");
      const dataRows = rows.slice(1);
      expect(dataRows).toHaveLength(products.length);

      products.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    };

    return {
      getCategoriesSkeletons,

      getProductSkeletons,

      getCategoriesComboBox,

      user,

      selectCategory,

      expectProductsToBeInTheDocument,
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
    const { getCategoriesSkeletons, getCategoriesComboBox, user } =
      renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeletons);

    const combobox = getCategoriesComboBox();
    expect(combobox).toBeInTheDocument;

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

  test("should filter products by category", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderBrowseProducts();

    const selectedCategory = categories[0];
    await selectCategory(selectedCategory.name);

    const products = getProductsByCategory(selectedCategory.id);
    expectProductsToBeInTheDocument(products);
  });

  test("should render all products if All is selected", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderBrowseProducts();

    await selectCategory(/all/i);

    const products = db.product.getAll();
    expectProductsToBeInTheDocument(products);
  });
});
