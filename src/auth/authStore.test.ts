import { describe, it, expect, beforeEach } from "vitest";
import { authStore } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("stores tokens", () => {
    authStore.setTokens("a", "r");

    expect(sessionStorage.getItem("accessToken")).toBe("a");
    expect(sessionStorage.getItem("refreshToken")).toBe("r");
  });

  it("retrieves tokens from memory", () => {
    authStore.setTokens("a", "r");

    expect(authStore.getAccessToken()).toBe("a");
    expect(authStore.getRefreshToken()).toBe("r");
  });

  it("retrieves tokens from sessionStorage", () => {
    sessionStorage.setItem("accessToken", "a");
    sessionStorage.setItem("refreshToken", "r");

    expect(authStore.getAccessToken()).toBe("a");
    expect(authStore.getRefreshToken()).toBe("r");
  });

  it("clears tokens", () => {
    authStore.setTokens("a", "r");
    authStore.clear();

    expect(sessionStorage.getItem("accessToken")).toBeNull();
    expect(sessionStorage.getItem("refreshToken")).toBeNull();
  });
});