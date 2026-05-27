import { authStore } from "./authStore";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = authStore.getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  let res = await fetch(`${API_URL}${input}`, { ...init, headers });

  if (res.status === 401) {
    const refreshToken = authStore.getRefreshToken();
    if (!refreshToken) {
      authStore.clear();
      window.dispatchEvent(new Event("auth:logout"));
      return res;
    }

    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });

    if (refreshRes.ok) {
      const { token: newToken } = await refreshRes.json();
      authStore.setTokens(newToken, refreshToken);

      res = await fetch(`${API_URL}${input}`, {
        ...init,
        headers: { ...headers, Authorization: `Bearer ${newToken}` }
      });
    } else {
      authStore.clear();
      window.dispatchEvent(new Event("auth:logout"));
    }
  }

  return res;
}