//user name render en dom
// use getByText

import { render, screen } from "@testing-library/react";
import UserAccount from "../../src/components/UserAccount";
import { User } from "../../src/entities";

describe("UserAccount", () => {
  test("should render a name if it is provided", () => {
    const user: User = { id: 1, name: "David" };
    render(<UserAccount user={user} />);
    const div = screen.getByText(user.name);
    expect(div).toBeInTheDocument();
  });

  // pass 1 admin user render button edit
  test("should render edit button if the user is admin", () => {
    const user: User = { id: 1, name: "David", isAdmin: true };
    render(<UserAccount user={user} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/edit/i);
  });
  // pass 1 non admin user not render button edit
  // use queryByRole
  // expect().not.toBeInTheDocument

  test("should not render edit button if the user is not a admin", () => {
    const user: User = { id: 1, name: "David" };
    render(<UserAccount user={user} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument;
  });
});
