import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as router from "react-router-dom"; // 1. Import everything as 'router'
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AddWorkoutPage from "./AddWorkoutPage";

// 2. Setup Navigation Mock
const mockNavigate = vi.fn();

// 3. Mock the router module
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(), // Make this a mock function we can control
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



vi.mock("../../context/AppContext", () => ({ useAppContext: () => ({service:mockService, tracker:mockTracker}) }));

describe("AddWorkoutPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(Date, "now").mockReturnValue(999);
    
    // Set default return values
    vi.mocked(router.useParams).mockReturnValue({ clientId: "1", workoutId: "999" });
    mockService.getClient.mockReturnValue({ id: 1, name: "Test Client" });
    mockService.getWorkouts.mockReturnValue([]);
    mockService.addWorkout.mockReturnValue(true); 
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

  it("renders 'Client not found' when client is null (Lines 30-31)", () => {
    mockService.getClient.mockReturnValue(null);
    renderPage();
    expect(screen.getByText(/client not found/i)).toBeInTheDocument();
  });

  it("saves workout and updates workoutId (Lines 45-50)", () => {
    renderPage();
    const input = screen.getByLabelText(/workout name/i);
    fireEvent.change(input, { target: { value: "Leg Day" } });
    
    const saveBtn = screen.getByTestId("saveWorkoutButton");
    fireEvent.click(saveBtn);

    expect(mockService.addWorkout).toHaveBeenCalled();
  });

  it("handles failed workout addition (Line 50 logic)", () => {
    mockService.addWorkout.mockReturnValue(false); 
    renderPage();
    
    const nameInput = screen.getByLabelText(/workout name/i);
    fireEvent.change(nameInput, { target: { value: "Fail Workout" } });
    
    const saveBtn = screen.getByTestId("saveWorkoutButton");
    fireEvent.click(saveBtn);
    
    expect(window.alert).toHaveBeenCalledWith("Failed to save workout!");
  });

  it("alerts if adding exercise before saving workout (Lines 54-61)", () => {
    // 4. Use vi.mocked instead of require
    vi.mocked(router.useParams).mockReturnValue({ clientId: "1", workoutId: undefined });
    
    renderPage();
    const addExBtn = screen.getByText(/add exercise/i);
    fireEvent.click(addExBtn);
    expect(window.alert).toHaveBeenCalledWith("Save workout first!");
  });

  it("alerts if deleting exercise without selection (Branch Coverage)", () => {
    renderPage();
    const deleteBtn = screen.getByText(/delete exercise/i);
    fireEvent.click(deleteBtn);
    expect(window.alert).toHaveBeenCalledWith("Select an exercise first!");
  });

  it("covers the happy path for saving name", () => {
    renderPage();
    const input = screen.getByLabelText(/workout name/i);
    fireEvent.change(input, { target: { value: "New Workout" } });
    expect(input).toHaveValue("New Workout");
  });
});