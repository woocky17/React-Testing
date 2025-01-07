import { render, screen } from "@testing-library/react";
import OrderStatusSelector from "../../src/components/OrderStatusSelector";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";

describe("OrderStatusSelector", () => {
  const renderOrderStatusSelector = () => {
    const onChange = vi.fn();
    render(
      <Theme>
        <OrderStatusSelector onChange={onChange} />
      </Theme>
    );

    return {
      button: screen.getByRole("combobox"),
      user: userEvent.setup(),
      getOptions: () => screen.findAllByRole("option"),
      getOption: (label: RegExp) =>
        screen.findByRole("option", { name: label }),
      onChange,
    };
  };
  test("should render New as the default value", () => {
    const { button } = renderOrderStatusSelector();

    expect(button).toHaveTextContent(/new/i);
  });

  test("should render correct statuses", async () => {
    const { button, user, getOptions } = renderOrderStatusSelector();

    await user.click(button);

    const options = await getOptions();
    expect(options).toHaveLength(3);
    const labels = options.map((option) => option.textContent);
    expect(labels).toEqual(["New", "Processed", "Fulfilled"]);
  });

  test.each([
    { label: /processed/i, value: "processed" },
    { label: /fulfilled/i, value: "fulfilled" },
  ])(
    "should call onChange with $value when the $label option is selected",
    async ({ label, value }) => {
      const { button, user, onChange, getOption } = renderOrderStatusSelector();

      await user.click(button);

      const option = await getOption(label);
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith(value);
    }
  );
  test("should call onChange with 'new' when the /new/i option is selected", async () => {
    const { button, user, onChange, getOption } = renderOrderStatusSelector();

    await user.click(button);

    const processedOption = await getOption(/processed/i);
    await user.click(processedOption);

    await user.click(button);

    const newOption = await getOption(/new/i);
    await user.click(newOption);

    expect(onChange).toHaveBeenCalledWith("new");
  });
});
