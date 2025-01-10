import { render, screen } from "@testing-library/react";
import AuthStatus from "../../src/components/AuthStatus";
import { mockAuthState } from "../utils";

describe("AuthStatus", () => {
  const renderAuthStatus = () => {
    render(<AuthStatus />);
  };

  test("should render a loading indicator while fetching auth status", () => {
    mockAuthState({ isAuthenticated: false, isLoading: true, user: undefined });

    renderAuthStatus();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("should render the login button if the user is not authenticated", () => {
    mockAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    });

    renderAuthStatus();

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /log out/i })
    ).not.toBeInTheDocument();
  });

  test("should render the user name if authenticated", () => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "David Ortet" },
    });

    renderAuthStatus();

    expect(screen.getByText(/David/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log out/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /log in/i })
    ).not.toBeInTheDocument();
  });
});
