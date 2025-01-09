import { render, screen } from "@testing-library/react";
import ProductForm from "../../src/components/ProductForm";
import AllProviders from "../AllProviders";
import { Category, Product } from "../../src/entities";
import { db } from "../mocks/db";
import userEvent from "@testing-library/user-event";

describe("ProductForm", () => {
  let categories: Category[] = [];

  beforeAll(() => {
    [1, 2, 3].forEach((item) => {
      categories.push(db.category.create({ name: "Category" + item }));
    });
  });

  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });
  });

  const renderProductForm = (props = {}) => {
    render(<ProductForm {...props} onSubmit={vi.fn()} />, {
      wrapper: AllProviders,
    });

    return {
      getInput: async () => {
        await screen.findByRole("form");
        return {
          comboBox: screen.getByRole("combobox", { name: /category/i }),
          name: screen.getByPlaceholderText(/name/i),
          price: screen.getByPlaceholderText(/price/i),
        };
      },
      user: userEvent.setup(),
    };
  };
  test("should render form fields", async () => {
    const { getInput, user } = renderProductForm();

    const { name, price, comboBox } = await getInput();

    expect(name).toBeInTheDocument();
    expect(price).toBeInTheDocument();
    expect(comboBox).toBeInTheDocument();

    await user.click(comboBox);

    categories.forEach((category) => {
      expect(
        screen.getByRole("option", { name: category.name })
      ).toBeInTheDocument();
    });
  });

  test("should render the correct data", async () => {
    const product: Product = {
      id: 1,
      name: "Bread",
      price: 1,
      categoryId: categories[0].id,
    };

    const { getInput } = renderProductForm({ product });

    const { name, price, comboBox } = await getInput();

    expect(name).toHaveValue(product.name);
    expect(price).toHaveValue(product.price.toString());
    expect(comboBox).toHaveTextContent(categories[0].name);
  });

  test("should focus on the name field", async () => {
    const { getInput } = renderProductForm();

    const { name } = await getInput();
    expect(name).toHaveFocus();
  });
});
