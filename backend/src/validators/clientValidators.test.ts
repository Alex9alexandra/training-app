
import { describe, it, expect } from "vitest";
import { validateClient } from "./clientValidators";

describe("validateClient", () => {
  it("returns error when client missing", () => {
    expect(validateClient(null)).toBe("Client is required");
  });

  it("returns error when name missing", () => {
    expect(validateClient({})).toBe("Invalid client name");
  });

  it("returns error when name empty", () => {
    expect(
      validateClient({
        name: "   ",
      })
    ).toBe("Invalid client name");
  });

  it("returns null for valid client", () => {
    expect(
      validateClient({
        name: "Alice",
      })
    ).toBeNull();
  });
});