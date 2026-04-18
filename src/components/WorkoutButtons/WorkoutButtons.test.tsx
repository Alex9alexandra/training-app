import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkoutButtons from "./WorkoutButtons";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("WorkoutButtons", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it("navigates to add workout on click", () => {
    render(<MemoryRouter><WorkoutButtons selectedId={null} clientId={1} onDelete={() => {}} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/workout/add/1");
  });

  it("alerts if updating without selection", () => {
    render(
      <MemoryRouter>
        <WorkoutButtons selectedId={null} clientId={1} onDelete={() => {}} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    expect(window.alert).toHaveBeenCalledWith("Select a workout first!");
    expect(mockNavigate).not.toHaveBeenCalled(); // 🔥 important
  });

  it("navigates to update if selectedId exists", () => {
    render(<MemoryRouter><WorkoutButtons selectedId={100} clientId={1} onDelete={() => {}} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/workout/update/1/100");
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDeleteMock = vi.fn();

    render(
      <MemoryRouter>
        <WorkoutButtons selectedId={1} clientId={1} onDelete={onDeleteMock} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDeleteMock).toHaveBeenCalled();
  });

  it("renders all buttons", () => {
    render(
      <MemoryRouter>
        <WorkoutButtons selectedId={1} clientId={1} onDelete={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  });

});