import { describe, it, expect, vi, beforeEach } from "vitest";
import { authFetch } from "./authFetch";
import { authStore } from "./authStore";

global.fetch = vi.fn();

describe("authFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds Authorization header when token exists", async () => {
    vi.spyOn(authStore, "getAccessToken").mockReturnValue("token");

    (fetch as any).mockResolvedValue({ status: 200 });

    await authFetch("/test");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
      })
    );
  });

  it("does NOT add Authorization if no token", async () => {
    vi.spyOn(authStore, "getAccessToken").mockReturnValue(null);

    (fetch as any).mockResolvedValue({ status: 200 });

    await authFetch("/test");

    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.anything(),
        }),
      })
    );
  });

  it("refreshes token on 401 and retries request", async () => {
    vi.spyOn(authStore, "getAccessToken").mockReturnValue("oldToken");
    vi.spyOn(authStore, "getRefreshToken").mockReturnValue("refresh");
    const setTokens = vi.spyOn(authStore, "setTokens");

    (fetch as any)
      .mockResolvedValueOnce({ status: 401 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "newToken" }),
      })
      .mockResolvedValueOnce({ status: 200 });

    const res = await authFetch("/test");

    expect(setTokens).toHaveBeenCalledWith("newToken", "refresh");
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(res.status).toBe(200);
  });

  it("logs out if no refresh token", async () => {
    vi.spyOn(authStore, "getAccessToken").mockReturnValue("token");
    vi.spyOn(authStore, "getRefreshToken").mockReturnValue(null);
    const clear = vi.spyOn(authStore, "clear");

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    (fetch as any).mockResolvedValue({ status: 401 });

    await authFetch("/test");

    expect(clear).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("logs out if refresh fails", async () => {
    vi.spyOn(authStore, "getAccessToken").mockReturnValue("token");
    vi.spyOn(authStore, "getRefreshToken").mockReturnValue("refresh");

    const clear = vi.spyOn(authStore, "clear");
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    (fetch as any)
      .mockResolvedValueOnce({ status: 401 }) 
      .mockResolvedValueOnce({ ok: false }); 

    await authFetch("/test");

    expect(clear).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });
});