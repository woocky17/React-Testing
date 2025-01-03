import { render, screen } from "@testing-library/react";
import ExpandableText from "../../src/components/ExpandableText";
import userEvent from "@testing-library/user-event";

describe("ExpandableText", () => {
  const longText = "a".repeat(256);
  const truncatedText = longText.substring(0, 255) + "...";

  test("should render the full text it it is a short text", () => {
    const text = "Short text";
    render(<ExpandableText text={text} />);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument;
  });

  test("should truncate the text if it is to long ", () => {
    render(<ExpandableText text={longText} />);

    const button = screen.getByRole("button");

    expect(screen.getByText(truncatedText)).toBeInTheDocument();
    expect(button).toHaveTextContent(/more/i);
  });

  test("should show all the text if the user clicks the Show more button ", async () => {
    render(<ExpandableText text={longText} />);

    const showMoreButton = screen.getByRole("button");
    const user = userEvent.setup();
    await user.click(showMoreButton);

    expect(screen.getByText(longText)).toBeInTheDocument();
    expect(showMoreButton).toHaveTextContent(/less/i);
  });

  test("should collapse the text if the user clicks the Show Less button ", async () => {
    render(<ExpandableText text={longText} />);

    const showMoreButton = screen.getByRole("button", { name: /more/i });
    const user = userEvent.setup();
    await user.click(showMoreButton);

    const showLessButton = screen.getByRole("button", { name: /less/i });
    await user.click(showLessButton);

    expect(screen.getByText(truncatedText)).toBeInTheDocument();
    expect(showMoreButton).toHaveTextContent(/more/i);
  });
});
