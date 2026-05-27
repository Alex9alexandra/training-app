import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./LoginPage";
import { authStore } from "../../auth/authStore";

global.fetch = vi.fn();

describe("LoginPage", () => {
  const onLogin = vi.fn();

  it("shows error if login fields empty", () => {
    render(<LoginPage onLogin={onLogin} />);

    fireEvent.click(screen.getByText("Login"));

    expect(screen.getByText("Please enter username and password")).toBeInTheDocument();
  });

  it("moves to step 2 on successful login", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        tempToken: "t",
        securityQuestion: "Pet?",
      }),
    });

    render(<LoginPage onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "u" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "p" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Security verification")).toBeInTheDocument();
    });
  });

  it("shows error if security answer empty", async () => {
    render(<LoginPage onLogin={onLogin} />);

    fireEvent.click(screen.getByText("Login"));

  });

  it("validates PIN format", async () => {
    render(<LoginPage onLogin={onLogin} />);

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        tempToken: "t",
        securityQuestion: "Pet?",
      }),
    });

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "u" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "p" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => screen.getByText("Security verification"));

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ tempToken: "t2" }),
    });

    fireEvent.change(screen.getByPlaceholderText("Your answer"), {
      target: { value: "ans" },
    });

    fireEvent.click(screen.getByText("Verify"));

    await waitFor(() => screen.getByText("Enter your 4-digit PIN"));

    fireEvent.change(screen.getByPlaceholderText("PIN"), {
      target: { value: "12" },
    });

    fireEvent.click(screen.getByText("Verify PIN"));

    expect(screen.getByText("Please enter a valid 4-digit PIN")).toBeInTheDocument();
  });

  it("calls onLogin on successful PIN", async () => {
    vi.spyOn(authStore, "setTokens");

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tempToken: "t",
          securityQuestion: "Pet?",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tempToken: "t2" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "token",
          refreshToken: "refresh",
          id: 1,
          username: "u",
          role: "user",
          permissions: [],
          clientId: null,
        }),
      });

    render(<LoginPage onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "u" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "p" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => screen.getByText("Security verification"));

    fireEvent.change(screen.getByPlaceholderText("Your answer"), {
      target: { value: "ans" },
    });

    fireEvent.click(screen.getByText("Verify"));

    await waitFor(() => screen.getByText("Enter your 4-digit PIN"));

    fireEvent.change(screen.getByPlaceholderText("PIN"), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByText("Verify PIN"));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it("shows error if server connection fails during login step 1", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("Network Error"));

    render(<LoginPage onLogin={onLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "u" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "p" } });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Could not connect to server")).toBeInTheDocument();
    });
  });

  it("shows error on incorrect credentials from server response", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });

    render(<LoginPage onLogin={onLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "u" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "p" } });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
    });
  });

  it("shows error if security answer is incorrect or server throws an error", async () => {
   
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tempToken: "t", securityQuestion: "Pet?" }),
    });

    render(<LoginPage onLogin={onLogin} />);
    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "u" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "p" } });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => screen.getByText("Security verification"));

    (fetch as any).mockResolvedValueOnce({ ok: false });

    fireEvent.change(screen.getByPlaceholderText("Your answer"), { target: { value: "wrong-ans" } });
    fireEvent.click(screen.getByText("Verify"));

    await waitFor(() => {
      expect(screen.getByText("Incorrect answer")).toBeInTheDocument();
    });

    (fetch as any).mockRejectedValueOnce(new Error());
    fireEvent.click(screen.getByText("Verify"));
    await waitFor(() => {
      expect(screen.getByText("Could not connect to server")).toBeInTheDocument();
    });
  });


  it("handles user registration field validation and server conflicts", async () => {
    render(<LoginPage onLogin={onLogin} />);
    
    fireEvent.click(screen.getByText("Don't have an account? Register"));
    
    fireEvent.click(screen.getByRole("button", { name: "Register" }));
    expect(screen.getByText("All fields are required")).toBeInTheDocument();

    const usernameInputs = screen.getAllByPlaceholderText("Username");
    const passwordInputs = screen.getAllByPlaceholderText("Password");

    fireEvent.change(usernameInputs[1], { target: { value: "regUser" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "reg@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Age"), { target: { value: "30" } });
    fireEvent.change(passwordInputs[1], { target: { value: "pass1" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "pass2" } });
    fireEvent.change(screen.getByPlaceholderText("4-digit PIN"), { target: { value: "1234" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "What was the name of your first pet?" } });
    fireEvent.change(screen.getByPlaceholderText("Security Answer"), { target: { value: "fido" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Register" }));
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "pass1" } });
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Username already taken" })
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));
    await waitFor(() => {
      expect(screen.getByText("Username already taken")).toBeInTheDocument();
    });
  });


});