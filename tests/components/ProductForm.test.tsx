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

    const user = userEvent.setup();

    return {
      expectErrorToBeInTheDocument: (errorMessage: RegExp) => {
        const error = screen.getByRole("alert");
        expect(error).toBeInTheDocument;
        expect(error).toHaveTextContent(errorMessage);
      },

      getInput: async () => {
        await screen.findByRole("form");

        const comboBox = screen.getByRole("combobox", { name: /category/i });
        const name = screen.getByPlaceholderText(/name/i);
        const price = screen.getByPlaceholderText(/price/i);
        const submitButton = screen.getByRole("button");

        type FormData = { [K in keyof Product]: any };

        const validData: FormData = {
          id: 1,
          name: "a",
          price: 1,
          categoryId: 1,
        };

        const fill = async (product: FormData) => {
          if (product.name !== undefined) await user.type(name, product.name);
          if (product.price !== undefined)
            await user.type(price, product.price.toString());

          await user.click(comboBox);
          const option = screen.getAllByRole("option");
          await user.click(option[0]);
          await user.click(submitButton);
        };
        return {
          comboBox,
          name,
          price,
          submitButton,
          fill,
          validData,
        };
      },
      user,
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

  test.each([
    {
      scenario: "missing",
      errorMessage: /required/i,
    },
    {
      scenario: "longer than 255 characters",
      name: "a".repeat(256),
      errorMessage: /255/i,
    },
  ])(
    "should display an error if name is $scenario",
    async ({ name, errorMessage }) => {
      const { getInput, expectErrorToBeInTheDocument } = renderProductForm();

      const form = await getInput();
      const product = { ...form.validData, name };
      await form.fill(product);

      expectErrorToBeInTheDocument(errorMessage);
    }
  );

  test.each([
    {
      scenario: "missing",
      errorMessage: /required/,
    },
    {
      scenario: "greater than 1000",
      price: 1001,
      errorMessage: /1000/,
    },
    {
      scenario: "0",
      price: 0,
      errorMessage: /1/,
    },
    {
      scenario: "less than 0",
      price: -1,
      errorMessage: /1/,
    },
    {
      scenario: "NaN",
      price: "a",
      errorMessage: /required/,
    },
  ])(
    "should display an error if price is $scenario",
    async ({ price, errorMessage }) => {
      const { getInput, expectErrorToBeInTheDocument } = renderProductForm();

      const form = await getInput();
      const product = { ...form.validData, price };
      await form.fill(product);

      expectErrorToBeInTheDocument(errorMessage);
    }
  );
});
