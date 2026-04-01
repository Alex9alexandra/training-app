
class CookieManager {
  static setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  static getCookie(name) {
    const cookies = document.cookie.split("; ").reduce((acc, curr) => {
      const [k, v] = curr.split("=");
      acc[k] = decodeURIComponent(v);
      return acc;
    }, {});
    return cookies[name];
  }

  static deleteCookie(name) {
    this.setCookie(name, "", -1);
  }
}