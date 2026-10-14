export type AnalyticsChoice = "accepted" | "rejected" | "unknown";
export const CONSENT_KEY = "purplesofthub-analytics-preference";
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export const PUBLIC_ORIGIN = "https://www.purplesofthub.com";

const pages = new Set(["/", "/about", "/services", "/portfolio", "/academy", "/music", "/blog", "/contact"]);
const services = new Set([
  "web-development", "mobile-app-development", "digital-marketing", "ui-ux-design", "saas-development",
  "music-promotion", "music-distribution", "branding-design", "branding-creative-design", "logo-design",
  "social-media-management", "seo", "seo-content", "content-creation", "video-content-creation",
  "facebook-and-instagram-ads", "facebook-ads", "google-ads", "ecommerce-development", "account-recovery",
]);

export function canonicalPath(input: string): string {
  return input.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
}

export function eligiblePage(input: string): string | null {
  if (!input || !input.startsWith("/") || input.startsWith("//")) return null;
  const path = canonicalPath(input);
  if (pages.has(path)) return path;
  const segments = path.split("/").slice(1);
  if (segments[0] === "services" && services.has(segments[1]) &&
      (segments.length === 2 || (segments.length === 3 && segments[2] === "pricing"))) return path;
  if ((segments[0] === "blog" || segments[0] === "portfolio") && segments.length === 2 &&
      /^[a-z0-9-]+$/.test(segments[1])) return path;
  return null;
}

export function validMeasurementId(id: string): boolean {
  return /^G-[A-Z0-9]{6,20}$/.test(id) && !/X{3,}/.test(id);
}

export function readPreference(raw: string | null, now = Date.now()): AnalyticsChoice {
  try {
    const record = JSON.parse(raw || "null");
    if (record?.version !== 1 || !["accepted", "rejected"].includes(record.choice) ||
        !Number.isFinite(record.savedAt) || record.savedAt > now || now - record.savedAt >= CONSENT_MAX_AGE) return "unknown";
    return record.choice;
  } catch { return "unknown"; }
}

export function preferenceRecord(choice: Exclude<AnalyticsChoice, "unknown">, now = Date.now()): string {
  return JSON.stringify({ version: 1, choice, savedAt: now });
}

export function safeReferrer(raw: string): string {
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return "";
    if (["purplesofthub.com", "www.purplesofthub.com"].includes(url.hostname)) {
      const path = eligiblePage(url.pathname);
      return path ? PUBLIC_ORIGIN + path : "";
    }
    return url.origin;
  } catch { return ""; }
}

export function pagePayload(path: string, referrer: string) {
  const section = path.split("/")[1];
  const titles: Record<string, string> = { about: "About", services: "Services", portfolio: "Portfolio", academy: "Academy", music: "Music", blog: "Insights", contact: "Contact" };
  return { page_location: PUBLIC_ORIGIN + path, page_title: `PurpleSoftHub — ${titles[section] || "Home"}`, page_referrer: safeReferrer(referrer) };
}
