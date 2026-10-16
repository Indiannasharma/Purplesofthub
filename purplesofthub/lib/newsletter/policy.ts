export const DISMISS_FOR = 14 * 24 * 60 * 60 * 1000;
export const PREFERENCE_KEY = 'purplesofthub-newsletter-v1';
export const SESSION_KEY = 'purplesofthub-newsletter-shown';
export const CHANGE_EVENT = 'purplesofthub:newsletter';

const publicPages = new Set(['/', '/about', '/contact', '/services', '/portfolio', '/blog', '/insights', '/academy', '/music']);
export function newsletterEligible(path: string, search = ''): boolean {
  const query = new URLSearchParams(search);
  if (['preview', 'draft', 'token', 'code', 'session', 'payment'].some(key => query.has(key))) return false;
  const normalized = path.replace(/\/+$/, '') || '/';
  if (publicPages.has(normalized)) return true;
  const parts = normalized.split('/').slice(1);
  if (parts.some(part => /^(checkout|payment|callback|preview|draft|account-recovery)$/.test(part))) return false;
  if (!/^[a-z0-9-]+$/.test(parts[1] || '')) return false;
  return (parts[0] === 'insights' && parts[1] === 'category' && parts.length === 3 && /^[a-z0-9-]+$/.test(parts[2])) ||
    (['blog', 'insights', 'portfolio'].includes(parts[0]) && parts.length === 2) ||
    (parts[0] === 'services' && (parts.length === 2 || (parts.length === 3 && parts[2] === 'pricing')));
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 200 || !/^[^\s@<>"\\]+@[^\s@<>"\\]+\.[^\s@<>"\\]+$/.test(email)) return null;
  return email;
}

export function suppressed(raw: string | null, now = Date.now()): boolean {
  try {
    const record = JSON.parse(raw || 'null');
    return record?.version === 1 && (record.subscribed === true ||
      (Number.isFinite(record.dismissedAt) && record.dismissedAt <= now && now - record.dismissedAt < DISMISS_FOR));
  } catch { return false; }
}

export class EngagementClock {
  elapsed = 0;
  private last: number;
  private active: boolean;
  constructor(now: number, active: boolean) { this.last = now; this.active = active; }
  sample(now: number, active: boolean) {
    if (this.active) this.elapsed += Math.max(0, now - this.last);
    this.last = now;
    this.active = active;
  }
  qualifies(scroll: number, active: boolean, blocked: boolean): boolean {
    return active && !blocked && (this.elapsed >= 45000 || (this.elapsed >= 20000 && scroll >= .6));
  }
}

export interface PreferenceStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export class NewsletterPreferences {
  private fallback: string | null = null;
  private seen = false;
  private subscribed = false;
  constructor(private local: () => PreferenceStorage, private session: () => PreferenceStorage) {}
  canShow(now = Date.now()) {
    let raw = this.fallback;
    try { raw = this.local().getItem(PREFERENCE_KEY) || raw; } catch { /* Memory fallback. */ }
    try { this.seen ||= this.session().getItem(SESSION_KEY) === '1'; } catch { /* Memory fallback. */ }
    try { const record = JSON.parse(raw || 'null'); this.subscribed ||= record?.version === 1 && record.subscribed === true; } catch { /* Ignore malformed storage. */ }
    return !this.seen && !this.subscribed && !suppressed(raw, now);
  }
  shown() { this.seen = true; try { this.session().setItem(SESSION_KEY, '1'); } catch { /* Memory fallback. */ } }
  save(subscribed: boolean, now = Date.now()) {
    if (!subscribed) this.canShow(now); // Preserve a confirmed subscription saved by another tab.
    if (!subscribed && this.subscribed) { this.shown(); return; }
    this.subscribed ||= subscribed;
    this.fallback = JSON.stringify({ version: 1, subscribed, dismissedAt: subscribed ? null : now });
    try { this.local().setItem(PREFERENCE_KEY, this.fallback); } catch { /* Memory fallback. */ }
    this.shown();
  }
}
