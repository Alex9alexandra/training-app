
class ActivityTracker {
  constructor(cookieName = "userActivity") {
    this.cookieName = cookieName;
    this.data = JSON.parse(CookieManager.getCookie(cookieName) || "{}");
    if (!this.data.visitedPages) this.data.visitedPages = [];
    if (!this.data.actions) this.data.actions = [];
  }

  trackPage(pageName) {
    if (!this.data.visitedPages.includes(pageName)) {
      this.data.visitedPages.push(pageName);
      this.save();
    }
  }

  trackAction(type, item) {
    const action = {
      type,
      item,
      timestamp: new Date().toISOString()
    };
    this.data.actions.push(action);
    this.data.lastAction = action;
    this.save();
  }

  save() {
    CookieManager.setCookie(this.cookieName, JSON.stringify(this.data), 30);
  }

  getData() {
    return this.data;
  }
}