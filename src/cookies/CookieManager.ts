export default class CookieManager {
  static setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  static getCookie(name: string): string | undefined {
    const cookies = document.cookie.split("; ").reduce<Record<string, string>>((acc, curr) => {
      const [k, v] = curr.split("=");
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});
    return cookies[name];
  }

  static deleteCookie(name: string): void {
    this.setCookie(name, "", -1);
  }
}