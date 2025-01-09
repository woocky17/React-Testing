import { render, screen } from "@testing-library/react";
import CategoryList from "../../src/components/CategoryList";
import { simulateDelay, simulateError } from "../utils";
import AllProviders from "../AllProviders";
import { Category } from "../../src/entities";
import { db } from "../mocks/db";

describe("CategoryList", () => {
  const categories: Category[] = [];
  beforeAll(() => {
    [1, 2, 3].forEach((item) => {
      categories.push(db.category.create({ name: "Category" + item }));
    });
  });

  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });
  });

  const renderCategoryList = () => {
    render(<CategoryList />, { wrapper: AllProviders });
  };

  test("should return an error if the fetch fails", async () => {
    simulateError("/categories");
    renderCategoryList();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  test("should render a loading message whe fetching categories", async () => {
    simulateDelay("/categories");
    renderCategoryList();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("should render a list of categories", async () => {
    renderCategoryList();

    await screen.findByText(/loading/i);

    categories.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });
});
