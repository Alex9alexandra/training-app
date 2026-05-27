import { describe, it, expect, vi, beforeEach } from "vitest";
import { startInactivityTimer, stopInactivityTimer } from "./inactivityTimer";
import { authStore } from "./authStore";

describe("inactivityTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  it("logs out after inactivity", () => {
    const clear = vi.spyOn(authStore, "clear");
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    startInactivityTimer();

    vi.advanceTimersByTime(2 * 60 * 1000);

    expect(clear).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("resets timer on activity", () => {
    const clear = vi.spyOn(authStore, "clear");

    startInactivityTimer();

    window.dispatchEvent(new Event("mousemove"));

    vi.advanceTimersByTime(2 * 60 * 1000 - 1);

    expect(clear).not.toHaveBeenCalled();
  });

  it("stops timer", () => {
    const clear = vi.spyOn(authStore, "clear");

    startInactivityTimer();
    stopInactivityTimer();

    vi.advanceTimersByTime(2 * 60 * 1000);

    expect(clear).not.toHaveBeenCalled();
  });
});