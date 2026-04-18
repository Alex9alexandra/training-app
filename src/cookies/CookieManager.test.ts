import { describe, test, expect, beforeEach, vi } from "vitest";
import CookieManager from "./CookieManager";

describe("CookieManager", () => {
  beforeEach(() => {
    document.cookie = "";
    vi.restoreAllMocks();
  });

  // 🔹 BASIC SET/GET

  test("sets and gets a cookie value", () => {
    CookieManager.setCookie("testKey", "testValue", 1);

    expect(CookieManager.getCookie("testKey")).toBe("testValue");
  });

  // 🔹 DEFAULT DAYS PARAMETER

  test("uses default expiration when days not provided", () => {
    CookieManager.setCookie("defaultDays", "value");

    expect(document.cookie).toContain("defaultDays=");
  });

  // 🔹 ENCODING / DECODING

  test("handles special characters using URI encoding", () => {
    const complexValue = "value with spaces & symbols!";

    CookieManager.setCookie("complex", complexValue);

    // verify encoded in cookie string
    expect(document.cookie).toContain(encodeURIComponent(complexValue));

    // verify decoded when retrieved
    expect(CookieManager.getCookie("complex")).toBe(complexValue);
  });

  // 🔹 MULTIPLE COOKIES PARSING

  test("parses multiple cookies correctly", () => {
    CookieManager.setCookie("a", "1");
    CookieManager.setCookie("b", "2");

    expect(CookieManager.getCookie("a")).toBe("1");
    expect(CookieManager.getCookie("b")).toBe("2");
  });

  // 🔹 MISSING COOKIE

  test("returns undefined for non-existent cookies", () => {
    expect(CookieManager.getCookie("missing")).toBeUndefined();
  });

  // 🔹 DELETE COOKIE

  test("deletes a cookie", () => {
    CookieManager.setCookie("toDelete", "gone");

    CookieManager.deleteCookie("toDelete");

    expect(CookieManager.getCookie("toDelete")).toBeUndefined();
  });

  // 🔹 DELETE CALLS setCookie WITH -1

  test("deleteCookie calls setCookie with negative expiry", () => {
    const spy = vi.spyOn(CookieManager, "setCookie");

    CookieManager.deleteCookie("test");

    expect(spy).toHaveBeenCalledWith("test", "", -1);
  });

  // 🔹 EDGE: TRIMMING COOKIE KEYS

  test("handles cookie string trimming correctly", () => {
    // simulate browser cookie format manually
    document.cookie = "x=1";
    document.cookie = "y=2";

    expect(CookieManager.getCookie("x")).toBe("1");
    expect(CookieManager.getCookie("y")).toBe("2");
  });
});