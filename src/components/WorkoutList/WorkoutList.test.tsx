import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkoutList from "./WorkoutList";

describe("WorkoutList", () => {
  const mockWorkouts = [
    { id: 1, name: "W1" }, { id: 2, name: "W2" }, { id: 3, name: "W3" },
    { id: 4, name: "W4" }, { id: 5, name: "W5" }, { id: 6, name: "W6" }
  ];

  beforeEach(cleanup);

  it("renders first page of workouts", () => {
    render(<WorkoutList workouts={mockWorkouts} onSelect={() => {}} />);
    expect(screen.getByText("W1")).toBeInTheDocument();
    expect(screen.queryByText("W6")).not.toBeInTheDocument();
  });

  it("paginates to the next page", () => {
    render(<WorkoutList workouts={mockWorkouts} onSelect={() => {}} />);
    fireEvent.click(screen.getByText(/next/i));
    expect(screen.getByText("W6")).toBeInTheDocument();
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("calls onSelect when a workout is clicked", () => {
    const onSelect = vi.fn();
    render(<WorkoutList workouts={mockWorkouts} onSelect={onSelect} />);
    
    // 1. Find the element containing the text
    const workoutItem = screen.getByText("W1");
    
    // 2. Click it
    fireEvent.click(workoutItem);
    
    // 3. Verify the callback was called
    expect(onSelect).toHaveBeenCalledWith(1);
    
    expect(workoutItem).toHaveClass("selected");
  });

  it("covers the pagination decrement branch (Line 43)", () => {
    render(<WorkoutList workouts={mockWorkouts} onSelect={() => {}} />);
    
    fireEvent.click(screen.getByText(/next/i)); // Go to page 2
    fireEvent.click(screen.getByText(/prev/i)); // Go back to page 1 (Line 43)
    
    expect(screen.getByText("1/2")).toBeInTheDocument();
    });
});