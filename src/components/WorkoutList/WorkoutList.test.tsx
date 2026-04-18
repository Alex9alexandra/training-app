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
    render(
    <WorkoutList
      workouts={{ data: mockWorkouts, totalPages: 2 }}
      page={1}
      onSelect={() => {}}
      onPageChange={() => {}}
    />
  );
    expect(screen.getByText("W1")).toBeInTheDocument();
    expect(screen.queryByText("W6")).toBeInTheDocument();
  });

  it("calls onPageChange with next page", () => {
    const onPageChange = vi.fn();

    render(
      <WorkoutList
        workouts={{ data: mockWorkouts, totalPages: 2 }}
        page={1}
        onSelect={() => {}}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByText(/next/i));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onSelect when a workout is clicked", () => {
    const onSelect = vi.fn();
    render(
      <WorkoutList
        workouts={{ data: mockWorkouts, totalPages: 2 }}
        page={1}
        onSelect={onSelect}
        onPageChange={() => {}}
      />
    );
    
    // 1. Find the element containing the text
    const workoutItem = screen.getByText("W1");
    
    // 2. Click it
    fireEvent.click(workoutItem);
    
    // 3. Verify the callback was called
    expect(onSelect).toHaveBeenCalledWith(1);
    
    expect(workoutItem).toHaveClass("selected");
  });

  it("calls onPageChange with previous page when clicking Prev", () => {
    const onPageChange = vi.fn();

    render(
      <WorkoutList
        workouts={{ data: mockWorkouts, totalPages: 2 }}
        page={2} 
        onSelect={() => {}}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByText(/prev/i));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("disables Next button on last page", () => {
    render(
      <WorkoutList
        workouts={{ data: mockWorkouts, totalPages: 2 }}
        page={2}
        onSelect={() => {}}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText(/next/i)).toBeDisabled();
  });

  it("disables Prev button on first page", () => {
    render(
      <WorkoutList
        workouts={{ data: mockWorkouts, totalPages: 2 }}
        page={1}
        onSelect={() => {}}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText(/prev/i)).toBeDisabled();
  });

  it("updates selected item when another workout is clicked", () => {
    render(
      <WorkoutList
        workouts={{ data: mockWorkouts, totalPages: 2 }}
        page={1}
        onSelect={() => {}}
        onPageChange={() => {}}
      />
    );

    const first = screen.getByText("W1");
    const second = screen.getByText("W2");

    fireEvent.click(first);
    expect(first).toHaveClass("selected");

    fireEvent.click(second);
    expect(second).toHaveClass("selected");
    expect(first).not.toHaveClass("selected");
  });

  it("renders no list items when workouts are empty", () => {
    render(
      <WorkoutList
        workouts={{ data: [], totalPages: 1 }}
        page={1}
        onSelect={() => {}}
        onPageChange={() => {}}
      />
    );

    expect(screen.queryByRole("listitem")).toBeNull();
  });
});