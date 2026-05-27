
import { describe, it, expect } from "vitest";
import { validateMeasurement } from "./measurementValidators";

const validMeasurement = {
  id: 1,
  height: 180,
  weight: 75,
  muscularMassPercent: 40,
  fatMassPercent: 15,
  boneMassPercent: 5,
  leanBodyMassPercent: 80,
  date: "2024-01-15",
};

describe("validateMeasurement", () => {
  it("returns error when measurement missing", () => {
    expect(validateMeasurement(null)).toBe(
      "Measurement is required"
    );
  });

  it("returns error for invalid id", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        id: 0,
      })
    ).toBe("Invalid measurement id");
  });

  it("returns error for invalid height", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        height: 0,
      })
    ).toBe("Invalid height");
  });

  it("returns error for invalid weight", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        weight: 0,
      })
    ).toBe("Invalid weight");
  });

  it("returns error for invalid muscular mass percent", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        muscularMassPercent: 101,
      })
    ).toBe("Invalid muscular mass percent");
  });

  it("returns error for invalid fat mass percent", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        fatMassPercent: -1,
      })
    ).toBe("Invalid fat mass percent");
  });

  it("returns error for invalid bone mass percent", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        boneMassPercent: 101,
      })
    ).toBe("Invalid bone mass percent");
  });

  it("returns error for invalid lean body mass percent", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        leanBodyMassPercent: -1,
      })
    ).toBe("Invalid lean body mass percent");
  });

  it("returns error for invalid date", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        date: "",
      })
    ).toBe("Invalid date");
  });

  it("returns error for invalid date format", () => {
    expect(
      validateMeasurement({
        ...validMeasurement,
        date: "not-a-date",
      })
    ).toBe("Invalid date format");
  });

  it("returns null for valid measurement", () => {
    expect(
      validateMeasurement(validMeasurement)
    ).toBeNull();
  });
});