
import { describe, it, expect } from "vitest";
import { validateId } from "./idValidators";

describe("validateId", () => {
  it("returns error for non number", () => {
    expect(validateId("abc")).toBe("Invalid ID");
  });

  it("returns error for zero", () => {
    expect(validateId(0)).toBe("Invalid ID");
  });

  it("returns error for negative", () => {
    expect(validateId(-1)).toBe("Invalid ID");
  });

  it("returns null for valid id", () => {
    expect(validateId(1)).toBeNull();
  });

  it("returns null for numeric string", () => {
    expect(validateId("5")).toBeNull();
  });
});