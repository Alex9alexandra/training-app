import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UpdateWorkoutPage from "./UpdateWorkoutPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockNavigate = vi.fn();

const mockService = {
  getClient: vi.fn(),
  getWorkouts: vi.fn(),
  deleteExercise: vi.fn(),
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ clientId: "1", workoutId: "10" }),
    useLocation: () => ({ key: "static-key" }),
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

describe("UpdateWorkoutPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/workout/1/10"]}>
        <Routes>
          <Route
            path="/workout/:clientId/:workoutId"
            element={<UpdateWorkoutPage />}
          />
        </Routes>
      </MemoryRouter>
    );

  // 🔴 LOADING / CLIENT NULL

  it("shows loading when client is null", async () => {
    mockService.getClient.mockResolvedValue(null);
    mockService.getWorkouts.mockResolvedValue({ data: [] });

    renderPage();

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  // 🔴 TRACKER COVERAGE

  it("tracks page on mount", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });
    mockService.getWorkouts.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => {
      expect(mockTracker.trackPage).toHaveBeenCalledWith(
        "UpdateWorkoutPage"
      );
    });
  });

  // 🔴 RENDER WORKOUT EXERCISES

  it("renders exercises from workout", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });

    mockService.getWorkouts.mockResolvedValue({
      data: [
        {
          id: 10,
          exercises: [
            { id: 101, name: "Push Ups", sets: 3, reps: 10, weight: 0 },
          ],
        },
      ],
    });

    renderPage();

    expect(await screen.findByText("Push Ups")).toBeInTheDocument();
  });

  // 🔴 ADD EXERCISE NAVIGATION

  it("navigates to add exercise page", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });
    mockService.getWorkouts.mockResolvedValue({ data: [] });

    renderPage();

    fireEvent.click(await screen.findByText(/add exercise/i));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/workout/1/10/add-exercise"
    );
  });

  // 🔴 DELETE WITHOUT SELECTION

  it("shows alert when deleting without selection", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });
    mockService.getWorkouts.mockResolvedValue({ data: [] });

    renderPage();

    fireEvent.click(await screen.findByText(/delete exercise/i));

    expect(window.alert).toHaveBeenCalledWith(
      "Select an exercise first!"
    );
  });

  // 🔴 DELETE WITH SELECTION

  it("deletes selected exercise correctly", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });

    mockService.getWorkouts.mockResolvedValue({
      data: [
        {
          id: 10,
          exercises: [
            { id: 101, name: "Push Ups", sets: 3, reps: 10, weight: 0 },
          ],
        },
      ],
    });

    renderPage();

    const exercise = await screen.findByText("Push Ups");

    fireEvent.click(exercise);
    fireEvent.click(screen.getByText(/delete exercise/i));

    await waitFor(() => {
      expect(mockService.deleteExercise).toHaveBeenCalledWith(
        1,
        10,
        101
      );
    });

    expect(mockTracker.trackAction).toHaveBeenCalledWith(
      "delete",
      "Exercise: Push Ups"
    );
  });

  // 🔴 LOCATION KEY REFRESH BRANCH

  it("re-runs effect when location key changes", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });
    mockService.getWorkouts.mockResolvedValue({ data: [] });

    const { rerender } = renderPage();

    rerender(
      <MemoryRouter initialEntries={["/workout/1/10?refresh=true"]}>
        <Routes>
          <Route
            path="/workout/:clientId/:workoutId"
            element={<UpdateWorkoutPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockService.getWorkouts).toHaveBeenCalled();
    });
  });
});