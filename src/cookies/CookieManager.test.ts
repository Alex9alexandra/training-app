import { describe, test, expect, beforeEach, vi } from "vitest";
import CookieManager from "./CookieManager";

describe("CookieManager", () => {
  beforeEach(() => {
    document.cookie = "";
    vi.restoreAllMocks();
  });


  test("sets and gets a cookie value", () => {
    CookieManager.setCookie("testKey", "testValue", 1);

    expect(CookieManager.getCookie("testKey")).toBe("testValue");
  });


  test("uses default expiration when days not provided", () => {
    CookieManager.setCookie("defaultDays", "value");

    expect(document.cookie).toContain("defaultDays=");
  });


  test("handles special characters using URI encoding", () => {
    const complexValue = "value with spaces & symbols!";

    CookieManager.setCookie("complex", complexValue);

    expect(document.cookie).toContain(encodeURIComponent(complexValue));

    expect(CookieManager.getCookie("complex")).toBe(complexValue);
  });


  test("parses multiple cookies correctly", () => {
    CookieManager.setCookie("a", "1");
    CookieManager.setCookie("b", "2");

    expect(CookieManager.getCookie("a")).toBe("1");
    expect(CookieManager.getCookie("b")).toBe("2");
  });


  test("returns undefined for non-existent cookies", () => {
    expect(CookieManager.getCookie("missing")).toBeUndefined();
  });


  test("deletes a cookie", () => {
    CookieManager.setCookie("toDelete", "gone");

    CookieManager.deleteCookie("toDelete");

    expect(CookieManager.getCookie("toDelete")).toBeUndefined();
  });


  test("deleteCookie calls setCookie with negative expiry", () => {
    const spy = vi.spyOn(CookieManager, "setCookie");

    CookieManager.deleteCookie("test");

    expect(spy).toHaveBeenCalledWith("test", "", -1);
  });


  test("handles cookie string trimming correctly", () => {
    
    document.cookie = "x=1";
    document.cookie = "y=2";

    expect(CookieManager.getCookie("x")).toBe("1");
    expect(CookieManager.getCookie("y")).toBe("2");
  });
});