import { describe, test, expect, beforeEach, vi } from "vitest";
import ActivityTracker from "./ActivityTracker";
import CookieManager from "./CookieManager";

vi.mock("./CookieManager");

describe("ActivityTracker", () => {
  let tracker: ActivityTracker;
  const cookieName = "userActivity";

  beforeEach(() => {
    vi.clearAllMocks();
    
    
    vi.mocked(CookieManager.getCookie).mockReturnValue(undefined);
    
    tracker = new ActivityTracker(cookieName);
  });

  test("should initialize with empty data if no cookie exists", () => {
    const data = tracker.getData();
    expect(data.pageVisits).toEqual({});
    expect(data.actions).toEqual([]);
  });

  test("should track page visits and increment counts", () => {
    
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

  test("should debounce rapid page tracking (spam protection)", () => {
    const page = "dashboard";
    tracker.trackPage(page);
    tracker.trackPage(page); 

    expect(tracker.getData().pageVisits[page]).toBe(1);
  });

  test("should track actions correctly", () => {
    tracker.trackAction("add", "item-123");

    const data = tracker.getData();
    expect(data.actions).toHaveLength(1);
    expect(data.actions[0].type).toBe("add");
    expect(data.actions[0].item).toBe("item-123");
    expect(data.lastAction).toEqual(data.actions[0]);
  });

  test("should load existing data from cookies on initialization", () => {
    const existingData = JSON.stringify({
      pageVisits: { "old-page": 5 },
      actions: []
    });
    
    
    vi.mocked(CookieManager.getCookie).mockReturnValue(existingData);

    const newTracker = new ActivityTracker(cookieName);
    expect(newTracker.getData().pageVisits["old-page"]).toBe(5);
  });
});