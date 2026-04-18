export default class CookieManager {
  static setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  static getCookie(name: string): string | undefined {
    const raw=document.cookie;
    
    const pairs=raw.split(";");
    for(let pair of pairs){
      const[k,v]=pair.split("=");

      if(k && k.trim()===name){
        return v? decodeURIComponent(v.trim()):"";
      }
    }
    return undefined;
  }

  static deleteCookie(name: string): void {
    this.setCookie(name, "", -1);
  }
}