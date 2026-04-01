import { describe, test, expect, beforeEach } from "vitest";
import CookieManager from "./CookieManager";

describe("CookieManager", () => {
  beforeEach(() => {
    document.cookie = "";
    
  });

  test("should set and get a cookie value", () => {
    CookieManager.setCookie("testKey", "testValue", 1);
    expect(CookieManager.getCookie("testKey")).toBe("testValue");
  });

  test("should return undefined for non-existent cookies", () => {
    expect(CookieManager.getCookie("missing")).toBeUndefined();
  });

  test("should handle special characters using URI encoding", () => {
    const complexValue = "value with spaces & symbols!";
    CookieManager.setCookie("complex", complexValue);
    expect(CookieManager.getCookie("complex")).toBe(complexValue);
  });

  test("should delete a cookie", () => {
    CookieManager.setCookie("toDelete", "gone");
    CookieManager.deleteCookie("toDelete");
    expect(CookieManager.getCookie("toDelete")).toBeUndefined();
  });
});