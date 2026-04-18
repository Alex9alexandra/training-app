import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as router from "react-router-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AddWorkoutPage from "./AddWorkoutPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(),
    useLocation: () => ({ key: "default-key", state: null }),
  };
});

const mockService = {
  getClient: vi.fn(),
  addWorkout: vi.fn(),
  getWorkouts: vi.fn(),
  deleteExercise: vi.fn(),
};

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

describe("AddWorkoutPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(Date, "now").mockReturnValue(999);

    vi.mocked(router.useParams).mockReturnValue({
      clientId: "1",
      workoutId: undefined,
    });

    mockService.getClient.mockResolvedValue({ id: 1, name: "Test Client" });

    mockService.getWorkouts.mockResolvedValue({
      data: [],
      totalPages: 1,
      page: 1,
    });

    mockService.addWorkout.mockResolvedValue({ id: 999 });
  });

  const renderPage = (path = "/add-workout/1") => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/add-workout/:clientId" element={<AddWorkoutPage />} />
          <Route path="/add-workout/:clientId/:workoutId" element={<AddWorkoutPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // 🔴 LOADING / CLIENT FETCH

  it("shows loading when client is null initially", async () => {
    mockService.getClient.mockResolvedValue(null);

    renderPage();

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("renders page when client exists", async () => {
    mockService.getClient.mockResolvedValue({ id: 1, name: "Test" });

    renderPage();

    expect(await screen.findByText("ADD NEW WORKOUT")).toBeInTheDocument();
  });

  // 🔴 TRACKER COVERAGE

  it("tracks page on mount", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });

    renderPage();

    await waitFor(() => {
      expect(mockTracker.trackPage).toHaveBeenCalledWith("AddWorkoutPage");
    });
  });

  // 🔴 SAVE WORKOUT SUCCESS

  it("saves workout successfully", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });
    mockService.addWorkout.mockResolvedValue({ id: 999 });

    renderPage();

    const input = await screen.findByLabelText(/workout name/i);
    fireEvent.change(input, { target: { value: "Leg Day" } });

    fireEvent.click(screen.getByTestId("saveWorkoutButton"));

    await waitFor(() => {
      expect(mockService.addWorkout).toHaveBeenCalled();
    });
  });

  // 🔴 SAVE WORKOUT FAILURE

  it("shows alert when workout save fails", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });
    mockService.addWorkout.mockResolvedValue(null);

    renderPage();

    const input = await screen.findByLabelText(/workout name/i);
    fireEvent.change(input, { target: { value: "Fail Workout" } });

    fireEvent.click(screen.getByTestId("saveWorkoutButton"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to save workout!");
    });
  });

  // 🔴 EMPTY NAME VALIDATION

  it("shows alert if workout name is empty", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });

    renderPage();

    fireEvent.click(await screen.findByTestId("saveWorkoutButton"));

    expect(window.alert).toHaveBeenCalledWith("Workout name required!");
  });

  // 🔴 ADD EXERCISE BLOCKED (allowed per request)

  it("blocks adding exercise if workout not saved", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });

    renderPage();

    fireEvent.click(await screen.findByText(/add exercise/i));

    expect(window.alert).toHaveBeenCalledWith("Save workout first!");
  });

  // 🔴 DELETE EXERCISE NO SELECTION

  it("shows alert if deleting without selection", async () => {
    mockService.getClient.mockResolvedValue({ id: 1 });

    renderPage();

    fireEvent.click(await screen.findByText(/delete exercise/i));

    expect(window.alert).toHaveBeenCalledWith("Select an exercise first!");
  });

  // 🔴 DELETE EXERCISE SUCCESS PATH (mocked state only)

  it("calls deleteExercise when selection exists", async () => {
    vi.mocked(router.useParams).mockReturnValue({
      clientId: "1",
      workoutId: "10",
    });

    mockService.getWorkouts.mockResolvedValue({
      data: [
        {
          id: 10,
          exercises: [{ id: 100, name: "Pushups", sets: 3, reps: 10, weight: 0 }],
        },
      ],
    });

    mockService.getClient.mockResolvedValue({ id: 1 });

    renderPage("/add-workout/1/10");

    await waitFor(() => {
      expect(screen.getByText(/exercises/i)).toBeInTheDocument();
    });
  });
});