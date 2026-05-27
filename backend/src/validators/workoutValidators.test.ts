

import { describe, it, expect } from "vitest";
import { validateWorkout } from "./workoutValidators";

describe("validateWorkout", () => {
  it("returns error when workout missing", () => {
    expect(validateWorkout(null)).toBe(
      "Workout is required"
    );
  });

  it("returns error when workout name invalid", () => {
    expect(
      validateWorkout({
        name: "",
      })
    ).toBe("Invalid workout name");
  });

  it("returns null for valid workout", () => {
    expect(
      validateWorkout({
        name: "Push Day",
      })
    ).toBeNull();
  });
});