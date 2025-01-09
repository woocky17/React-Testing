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

    const getAddButton = () =>
      screen.queryByRole("button", { name: /add to cart/i });

    const getQuantityControls = () => ({
      quantity: () => screen.queryByRole("status"),
      decrementButton: () => screen.queryByRole("button", { name: "-" }),
      incrementButton: () => screen.queryByRole("button", { name: "+" }),
    });

    const user = userEvent.setup();

    const addToCart = async () => {
      const button = getAddButton();
      await user.click(button!);
    };
    const incrementQuantity = async () => {
      const button = getQuantityControls().incrementButton;
      await user.click(button()!);
    };
    const decrementQuantity = async () => {
      const button = getQuantityControls().decrementButton;
      await user.click(button()!);
    };
    return {
      getAddButton,
      getQuantityControls,
      addToCart,
      incrementQuantity,
      decrementQuantity,
    };
  };

  test("should render the Add to Cart button", () => {
    const { getAddButton } = renderQuantitySelector();

    expect(getAddButton()).toBeInTheDocument();
  });

  test("should add the product to the cart", async () => {
    const { addToCart, getAddButton, getQuantityControls } =
      renderQuantitySelector();

    await addToCart();

    const { quantity, incrementButton, decrementButton } =
      getQuantityControls();
    expect(quantity()).toHaveTextContent("1");
    expect(decrementButton()).toBeInTheDocument();
    expect(incrementButton()).toBeInTheDocument();

    expect(getAddButton()!).not.toBeInTheDocument();
  });

  test("should increment the quantity", async () => {
    const { addToCart, incrementQuantity, getQuantityControls } =
      renderQuantitySelector();

    await addToCart();

    await incrementQuantity();

    const { quantity } = getQuantityControls();
    expect(quantity()).toHaveTextContent("2");
  });

  test("should decrement the quantity", async () => {
    const {
      addToCart,
      incrementQuantity,
      decrementQuantity,
      getQuantityControls,
    } = renderQuantitySelector();

    await addToCart();

    await incrementQuantity();

    await decrementQuantity();

    const { quantity } = getQuantityControls();
    expect(quantity()).toHaveTextContent("1");
  });

  test("should remove the product from the card", async () => {
    const { getAddButton, addToCart, decrementQuantity, getQuantityControls } =
      renderQuantitySelector();

    await addToCart();

    await decrementQuantity();

    const { quantity, decrementButton, incrementButton } =
      getQuantityControls();
    expect(quantity()).not.toBeInTheDocument();
    expect(decrementButton()).not.toBeInTheDocument();
    expect(incrementButton()).not.toBeInTheDocument();
    expect(getAddButton()).toBeInTheDocument();
  });
});
