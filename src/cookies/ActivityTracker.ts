import CookieManager from "./CookieManager";

interface PageVisits {
  [pageName: string]: number;
}

interface Action {
  type: "add" | "delete";
  item: string;
  timestamp: string;
}

interface ActivityData {
  pageVisits: PageVisits;
  actions: Action[];
  lastAction?: Action;
}

export default class ActivityTracker {
  private cookieName: string;
  private data: ActivityData;
  private lastTrackedPage: string | null = null;
  private lastTrackedTime: number = 0;

  constructor(cookieName: string = "userActivity") {
    this.cookieName = cookieName;
    this.data = JSON.parse(CookieManager.getCookie(cookieName) || "{}") as ActivityData;

    if (!this.data.pageVisits) this.data.pageVisits = {};
    if (!this.data.actions) this.data.actions = [];
  }

  trackPage(pageName: string): void {
    const now = Date.now();

    if (
      this.lastTrackedPage === pageName &&
      now - this.lastTrackedTime < 500
    ) {
      return;
    }

    this.lastTrackedPage = pageName;
    this.lastTrackedTime = now;

    if (!this.data.pageVisits) this.data.pageVisits = {};
    if (!this.data.pageVisits[pageName]) {
      this.data.pageVisits[pageName] = 0;
    }

    this.data.pageVisits[pageName] += 1;
    this.save();
  }

  trackAction(type: Action["type"], item: string): void {
    const action: Action = {
      type,
      item,
      timestamp: new Date().toISOString()
    };
    this.data.actions.push(action);
    this.data.lastAction = action;
    this.save();
  }

  private save(): void {
    CookieManager.setCookie(this.cookieName, JSON.stringify(this.data), 30);
  }

  getData(): ActivityData {
    return this.data;
  }
}