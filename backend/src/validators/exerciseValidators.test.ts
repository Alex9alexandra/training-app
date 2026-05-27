
import { describe, it, expect } from "vitest";
import { validateExercise } from "./exerciseValidators";

describe("validateExercise", () => {
  it("returns error when exercise missing", () => {
    expect(validateExercise(null)).toBe("Exercise is required");
  });

  it("returns error for invalid name", () => {
    expect(
      validateExercise({
        name: "",
        sets: 3,
        reps: 10,
        weight: 50,
      })
    ).toBe("Invalid name");
  });

  it("returns error for invalid sets", () => {
    expect(
      validateExercise({
        name: "Bench",
        sets: 0,
        reps: 10,
        weight: 50,
      })
    ).toBe("Invalid sets");
  });

  it("returns error for invalid reps", () => {
    expect(
      validateExercise({
        name: "Bench",
        sets: 3,
        reps: 0,
        weight: 50,
      })
    ).toBe("Invalid reps");
  });

  it("returns error for invalid weight", () => {
    expect(
      validateExercise({
        name: "Bench",
        sets: 3,
        reps: 10,
        weight: -1,
      })
    ).toBe("Invalid weight");
  });

  it("returns null for valid exercise", () => {
    expect(
      validateExercise({
        name: "Bench",
        sets: 3,
        reps: 10,
        weight: 50,
      })
    ).toBeNull();
  });
});