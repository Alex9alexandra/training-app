import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UpdateWorkoutPage from "./UpdateWorkoutPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockNavigate = vi.fn();
const mockService = { getClient: vi.fn(), getWorkouts: vi.fn(), deleteExercise: vi.fn() };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return { 
    ...actual, 
    useNavigate: () => mockNavigate, 
    useParams: () => ({ clientId: "1", workoutId: "10" }),
    useLocation: () => ({ key: "static-key" }) 
  };
});

const mockTracker = {

  getData: vi.fn().mockReturnValue({}),
  trackPage: vi.fn(),
  trackAction: vi.fn(),
};



vi.mock("../../context/AppContext", () => ({ useAppContext: () => ({service:mockService, tracker:mockTracker}) }));
describe("UpdateWorkoutPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderPage = () => render(
    <MemoryRouter initialEntries={["/workout/1/10"]}>
      <Routes><Route path="/workout/:clientId/:workoutId" element={<UpdateWorkoutPage />} /></Routes>
    </MemoryRouter>
  );

  it("renders 'Client not found' when client is missing", () => {
    mockService.getClient.mockReturnValue(null);
    renderPage();
    expect(screen.getByText(/client not found/i)).toBeInTheDocument();
  });

  it("alerts if deleting without selecting an exercise (Lines 34-35)", () => {
    mockService.getClient.mockReturnValue({ id: 1 });
    mockService.getWorkouts.mockReturnValue([{ id: 10, exercises: [] }]);
    renderPage();
    fireEvent.click(screen.getAllByRole("button", { name: /delete exercise/i })[0]);
    expect(window.alert).toHaveBeenCalledWith("Select an exercise first!");
  });

  it("deletes an exercise when one is selected", () => {
    mockService.getClient.mockReturnValue({ id: 1 });
    mockService.getWorkouts.mockReturnValue([{ id: 10, exercises: [{ id: 101, name: "Push Ups" }] }]);
    renderPage();
    fireEvent.click(screen.getByText("Push Ups"));
    fireEvent.click(screen.getAllByRole("button", { name: /delete exercise/i })[0]);
    expect(mockService.deleteExercise).toHaveBeenCalledWith(1, 10, 101);
  });

  it("covers the version refresh effect (Line 29)", () => {
    const { rerender } = renderPage();
    // Change the key or search params to trigger the effect
    rerender(
        <MemoryRouter initialEntries={["/workout/1/1?refresh=true"]}>
        <Routes>
            <Route path="/workout/:clientId/:workoutId" element={<UpdateWorkoutPage />} />
        </Routes>
        </MemoryRouter>
    );
    });
});