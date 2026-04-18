import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddExercisePage from "./AddExercisePage";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockNavigate = vi.fn();
const mockService = {
  addExercise: vi.fn(),
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ clientId: "1", workoutId: "10" }),
  };
});

const mockTracker = {
  getData: vi.fn().mockReturnValue({}),
  trackPage: vi.fn(),
  trackAction: vi.fn(),
};

vi.mock("../../context/AppContext", () => ({
  useAppContext: () => ({
    service: mockService,
    tracker: mockTracker,
  }),
}));

describe("AddExercisePage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(Date, "now").mockReturnValue(123);
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/workout/1/10/add-exercise"]}>
        <Routes>
          <Route
            path="/workout/:clientId/:workoutId/add-exercise"
            element={<AddExercisePage />}
          />
        </Routes>
      </MemoryRouter>
    );

  // 🔴 TRACKER COVERAGE

  it("tracks page on mount", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockTracker.trackPage).toHaveBeenCalledWith(
        "AddExercisePage"
      );
    });
  });

  // 🔴 VALIDATION BRANCH (ALL FIELDS EMPTY)

  it("shows alert when fields are missing", () => {
    renderPage();

    fireEvent.click(screen.getByText(/save/i));

    expect(window.alert).toHaveBeenCalledWith("All fields are required!");
    expect(mockService.addExercise).not.toHaveBeenCalled();
  });

  // 🔴 PARTIAL INPUT FAILURE BRANCHES

  it("fails if only name is provided", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Squat" },
    });

    fireEvent.click(screen.getByText(/save/i));

    expect(window.alert).toHaveBeenCalled();
  });

  it("fails if numeric fields are missing", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Squat" },
    });

    fireEvent.change(screen.getByLabelText(/sets/i), {
      target: { value: "3" },
    });

    fireEvent.click(screen.getByText(/save/i));

    expect(window.alert).toHaveBeenCalledWith(
      "All fields are required!"
    );
  });

  // 🔴 SUCCESS PATH

  it("saves exercise and navigates correctly", async () => {
    mockService.addExercise.mockResolvedValue({ id: 123 });

    renderPage();

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Squat" },
    });

    fireEvent.change(screen.getByLabelText(/sets/i), {
      target: { value: "3" },
    });

    fireEvent.change(screen.getByLabelText(/reps/i), {
      target: { value: "10" },
    });

    fireEvent.change(screen.getByLabelText(/weight/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(mockService.addExercise).toHaveBeenCalledWith(1, 10, {
        id: 123,
        name: "Squat",
        sets: 3,
        reps: 10,
        weight: 100,
      });
    });

    expect(mockTracker.trackAction).toHaveBeenCalledWith(
      "add",
      "Exercise: Squat"
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/workout/update/1/10",
      { replace: true, state: { refresh: true } }
    );
  });

  // 🔴 EDGE CASE: EMPTY STRINGS VS ZERO

  it("treats empty strings as invalid input", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "" },
    });

    fireEvent.change(screen.getByLabelText(/sets/i), {
      target: { value: "0" },
    });

    fireEvent.change(screen.getByLabelText(/reps/i), {
      target: { value: "0" },
    });

    fireEvent.change(screen.getByLabelText(/weight/i), {
      target: { value: "0" },
    });

    fireEvent.click(screen.getByText(/save/i));

    expect(window.alert).toHaveBeenCalledWith(
      "All fields are required!"
    );
  });
});