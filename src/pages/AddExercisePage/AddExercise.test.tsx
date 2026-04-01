import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddExercisePage from "./AddExercisePage";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { useAppContext } from "../../context/AppContext";

const mockNavigate = vi.fn();
const mockService = { addExercise: vi.fn() };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ clientId: "1", workoutId: "10" }) };
});

const mockTracker = {
  getData: vi.fn().mockReturnValue({}),
  trackPage: vi.fn(),
  trackAction: vi.fn(),
};

vi.mock("../../context/AppContext", () => ({ useAppContext: () => ({service:mockService, tracker:mockTracker}) }));

describe("AddExercisePage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(Date, "now").mockReturnValue(123);
  });

  const renderPage = () => render(
    <MemoryRouter initialEntries={["/workout/1/10/add-exercise"]}>
      <Routes>
        <Route path="/workout/:clientId/:workoutId/add-exercise" element={<AddExercisePage />} />
      </Routes>
    </MemoryRouter>
  );

  it("shows alert if fields are missing (Line 20-21)", () => {
    renderPage();
    fireEvent.click(screen.getAllByRole("button", { name: /save/i })[0]);
    expect(window.alert).toHaveBeenCalledWith("All fields are required!");
    expect(mockService.addExercise).not.toHaveBeenCalled();
  });

  it("saves exercise and navigates back", () => {
    renderPage();
    fireEvent.change(screen.getAllByLabelText(/Name:/i)[0], { target: { value: "Squat" } });
    fireEvent.change(screen.getAllByLabelText(/Sets:/i)[0], { target: { value: "3" } });
    fireEvent.change(screen.getAllByLabelText(/Reps:/i)[0], { target: { value: "10" } });
    fireEvent.change(screen.getAllByLabelText(/Weight/i)[0], { target: { value: "100" } });

    fireEvent.click(screen.getAllByRole("button", { name: /save/i })[0]);

    expect(mockService.addExercise).toHaveBeenCalledWith(1, 10, {
      id: 123, name: "Squat", sets: 3, reps: 10, weight: 100
    });
    expect(mockNavigate).toHaveBeenCalledWith("/workout/1/10", { state: { refresh: true } });
  });
});