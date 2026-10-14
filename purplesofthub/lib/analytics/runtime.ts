import { eligiblePage, pagePayload, validMeasurementId, type AnalyticsChoice } from "./policy";

export interface AnalyticsHost {
  path(): string;
  referrer(): string;
  available(): boolean;
  disable(disabled: boolean): void;
  load(ready: () => void, failed: () => void): void;
  cancelPending(): void;
  send(...args: unknown[]): void;
  clearCookies(): void;
}

/** Manual page views require Enhanced Measurement to be disabled in the GA4 stream. */
export class AnalyticsRuntime {
  private choice: AnalyticsChoice = "unknown";
  private loading = false;
  private ready = false;
  private configured = false;
  private lastPage: string | null = null;
  private renderedPath: string | null = null;

  constructor(private id: string, private host: AnalyticsHost) { host.disable(true); }

  choose(choice: AnalyticsChoice) {
    this.choice = choice;
    if (choice !== "accepted") {
      this.host.disable(true);
      this.host.cancelPending();
      this.loading = false;
      this.host.clearCookies();
      return;
    }
    this.refresh();
  }

  beforeNavigation() { this.host.disable(true); this.renderedPath = null; }
  stop() { this.host.disable(true); this.renderedPath = null; }

  rendered(path: string) {
    this.renderedPath = path;
    if (!eligiblePage(path)) this.lastPage = null;
    this.refresh();
  }

  private refresh() {
    const path = eligiblePage(this.host.path());
    if (!validMeasurementId(this.id) || this.choice !== "accepted" || !path ||
        this.renderedPath !== this.host.path() || !this.host.available()) {
      this.host.disable(true);
      return;
    }
    if (!this.ready) {
      this.host.disable(true);
      if (!this.loading) {
        this.loading = true;
        this.host.load(() => { this.loading = false; this.ready = true; this.refresh(); }, () => { this.loading = false; });
      }
      return;
    }
    this.host.disable(false);
    const payload = pagePayload(path, this.lastPage ? pagePayload(this.lastPage, "").page_location : this.host.referrer());
    if (!this.configured) {
      this.host.send("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      this.host.send("js", new Date());
      this.host.send("config", this.id, { ...payload, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 30 * 24 * 60 * 60 });
      this.configured = true;
    }
    if (this.lastPage === path) return;
    this.host.send("set", payload);
    this.host.send("event", "page_view", { ...payload, send_to: this.id });
    this.lastPage = path;
  }
}
