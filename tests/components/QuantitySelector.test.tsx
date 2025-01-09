import { render, screen } from "@testing-library/react";
import { CartProvider } from "../../src/providers/CartProvider";
import QuantitySelector from "../../src/components/QuantitySelector";
import { Product } from "../../src/entities";
import { db } from "../mocks/db";
import userEvent from "@testing-library/user-event";

describe("QuantitySelector", () => {
  let product: Product;

  beforeAll(() => {
    product = db.product.create();
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: product.id } } });
  });

  const renderQuantitySelector = () => {
    render(
      <CartProvider>
        <QuantitySelector product={product} />
      </CartProvider>
    );

    return {
      user: userEvent.setup(),
      getAddButton: () =>
        screen.queryByRole("button", { name: /add to cart/i }),
      getQuantityControls: () => ({
        quantity: () => screen.queryByRole("status"),
        decrementButton: () => screen.queryByRole("button", { name: "-" }),
        incrementButton: () => screen.queryByRole("button", { name: "+" }),
      }),
    };
  };

  test("should render the Add to Cart button", () => {
    const { getAddButton } = renderQuantitySelector();

    expect(getAddButton()).toBeInTheDocument();
  });

  test("should add the product to the cart", async () => {
    const { getAddButton, user, getQuantityControls } =
      renderQuantitySelector();

    await user.click(getAddButton()!);

    const { quantity, incrementButton, decrementButton } =
      getQuantityControls();
    expect(quantity()).toHaveTextContent("1");
    expect(decrementButton()).toBeInTheDocument();
    expect(incrementButton()).toBeInTheDocument();

    expect(getAddButton()!).not.toBeInTheDocument();
  });

  test("should increment the quantity", async () => {
    const { user, getAddButton, getQuantityControls } =
      renderQuantitySelector();
    await user.click(getAddButton()!);

    const { quantity, incrementButton } = getQuantityControls();
    await user.click(incrementButton()!);

    expect(quantity()).toHaveTextContent("2");
  });

  test("should decrement the quantity", async () => {
    const { user, getAddButton, getQuantityControls } =
      renderQuantitySelector();
    await user.click(getAddButton()!);

    const { incrementButton, quantity, decrementButton } =
      getQuantityControls();
    await user.click(incrementButton()!);

    await user.click(decrementButton()!);

    expect(quantity()).toHaveTextContent("1");
  });

  test("should remove the product from the card", async () => {
    const { user, getAddButton, getQuantityControls } =
      renderQuantitySelector();
    await user.click(getAddButton()!);

    const { quantity, decrementButton, incrementButton } =
      getQuantityControls();
    await user.click(decrementButton()!);

    expect(quantity()).not.toBeInTheDocument();
    expect(decrementButton()).not.toBeInTheDocument();
    expect(incrementButton()).not.toBeInTheDocument();
    expect(getAddButton()).toBeInTheDocument();
  });
});
