let accessToken: string | null = null;
let refreshToken: string | null = null;

export const authStore = {
  setTokens(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh;
    sessionStorage.setItem('accessToken', access);
    sessionStorage.setItem('refreshToken', refresh);
  },
  getAccessToken() {
    return accessToken ?? sessionStorage.getItem('accessToken');
  },
  getRefreshToken() {
    return refreshToken ?? sessionStorage.getItem('refreshToken');
  },
  clear() {
    accessToken = null;
    refreshToken = null;
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  }
};