import { describe, test, expect, beforeEach, vi } from "vitest";
import ActivityTracker from "./ActivityTracker";
import CookieManager from "./CookieManager";

vi.mock("./CookieManager");

describe("ActivityTracker", () => {
  let tracker: ActivityTracker;
  const cookieName = "userActivity";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    vi.mocked(CookieManager.getCookie).mockReturnValue(undefined);
    tracker = new ActivityTracker(cookieName);
  });

  // 🔹 INIT

  test("initializes with empty data if no cookie exists", () => {
    const data = tracker.getData();

    expect(data.pageVisits).toEqual({});
    expect(data.actions).toEqual([]);
  });

  test("loads existing data from cookies on initialization", () => {
    const existingData = JSON.stringify({
      pageVisits: { "old-page": 5 },
      actions: []
    });

    vi.mocked(CookieManager.getCookie).mockReturnValue(existingData);

    const newTracker = new ActivityTracker(cookieName);

    expect(newTracker.getData().pageVisits["old-page"]).toBe(5);
  });

  test("initializes missing fields from cookie data", () => {
    const partialData = JSON.stringify({}); // missing both fields

    vi.mocked(CookieManager.getCookie).mockReturnValue(partialData);

    const newTracker = new ActivityTracker(cookieName);
    const data = newTracker.getData();

    expect(data.pageVisits).toEqual({});
    expect(data.actions).toEqual([]);
  });

  // 🔹 PAGE TRACKING

  test("tracks page visits and increments counts", () => {
    vi.useFakeTimers();

    tracker.trackPage("home");

    vi.advanceTimersByTime(501);

    tracker.trackPage("home");
    tracker.trackPage("about");

    const data = tracker.getData();

    expect(data.pageVisits["home"]).toBe(2);
    expect(data.pageVisits["about"]).toBe(1);
    expect(CookieManager.setCookie).toHaveBeenCalled();

    vi.useRealTimers();
  });

  test("debounces rapid page tracking (same page within 500ms)", () => {
    const page = "dashboard";

    tracker.trackPage(page);
    tracker.trackPage(page); // should be ignored

    expect(tracker.getData().pageVisits[page]).toBe(1);
  });

  test("allows tracking same page after debounce interval", () => {
    vi.useFakeTimers();

    tracker.trackPage("home");
    vi.advanceTimersByTime(600); // beyond debounce
    tracker.trackPage("home");

    expect(tracker.getData().pageVisits["home"]).toBe(2);

    vi.useRealTimers();
  });

  test("tracks different pages without debounce restriction", () => {
    tracker.trackPage("home");
    tracker.trackPage("about");

    const data = tracker.getData();

    expect(data.pageVisits["home"]).toBe(1);
    expect(data.pageVisits["about"]).toBe(1);
  });

  // 🔹 ACTION TRACKING

  test("tracks actions correctly", () => {
    tracker.trackAction("add", "item-123");

    const data = tracker.getData();

    expect(data.actions).toHaveLength(1);
    expect(data.actions[0].type).toBe("add");
    expect(data.actions[0].item).toBe("item-123");
    expect(data.lastAction).toEqual(data.actions[0]);
    expect(data.actions[0].timestamp).toBeDefined();

    expect(CookieManager.setCookie).toHaveBeenCalled();
  });

  test("tracks multiple actions and updates lastAction", () => {
    tracker.trackAction("add", "item-1");
    tracker.trackAction("delete", "item-2");

    const data = tracker.getData();

    expect(data.actions).toHaveLength(2);
    expect(data.lastAction?.type).toBe("delete");
    expect(data.lastAction?.item).toBe("item-2");
  });

  // 🔹 SAVE FUNCTION (indirect coverage)

  test("calls save (setCookie) when tracking page", () => {
    tracker.trackPage("home");

    expect(CookieManager.setCookie).toHaveBeenCalledWith(
      cookieName,
      expect.any(String),
      30
    );
  });

  test("calls save (setCookie) when tracking action", () => {
    tracker.trackAction("add", "item");

    expect(CookieManager.setCookie).toHaveBeenCalledWith(
      cookieName,
      expect.any(String),
      30
    );
  });
});