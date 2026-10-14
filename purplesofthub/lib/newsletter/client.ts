import { CHANGE_EVENT, NewsletterPreferences, normalizeEmail } from './policy';

let preferences: NewsletterPreferences | undefined;
export function newsletterPreferences() {
  return preferences ||= new NewsletterPreferences(() => window.localStorage, () => window.sessionStorage);
}
export function recordNewsletterSuccess() {
  newsletterPreferences().save(true);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** No email is stored, logged or sent anywhere except the existing subscription API. */
export class NewsletterSubmission {
  pending = false;
  async submit(input: unknown, source: string, transport: typeof fetch = fetch, signal?: AbortSignal): Promise<string | null> {
    if (this.pending) return null;
    const email = normalizeEmail(input);
    if (!email) throw new Error('Please enter a valid email address.');
    this.pending = true;
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, 15000);
    try {
      const response = await transport('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source }), signal: controller.signal });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('We couldn’t complete your subscription. Please try again.');
      return typeof result.message === 'string' ? result.message : 'You’re subscribed.';
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      this.pending = false;
    }
  }
}
