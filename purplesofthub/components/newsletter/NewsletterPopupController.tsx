'use client';

import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CHANGE_EVENT, EngagementClock, newsletterEligible, PREFERENCE_KEY } from '@/lib/newsletter/policy';
import { newsletterPreferences } from '@/lib/newsletter/client';

const Popup = lazy(() => import('./NewsletterPopup'));
class PopupBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function visible(element: Element) {
  const style = getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && element.getBoundingClientRect().height > 0;
}
export function browsingInterrupted(baselineHeight = innerHeight) {
  const focus = document.activeElement;
  if (focus instanceof HTMLElement && (focus.matches('input,textarea,select,[contenteditable="true"],[role="textbox"]') || focus.closest('form'))) return true;
  if (document.querySelector('meta[name="robots"][content*="noindex"]')) return true;
  if ([...document.querySelectorAll('[role="dialog"],[role="alertdialog"],[aria-modal="true"],dialog[open],[aria-label="Analytics preferences"][role="region"]')].some(visible)) return true;
  if ([...document.querySelectorAll('iframe[src*="paystack"],iframe[src*="checkout.flutterwave"]')].some(visible)) return true;
  // Older checkout overlays do not have dialog semantics. Recognize their full-screen fixed shell.
  if ([...document.querySelectorAll('body div[style]')].some(element => {
    if (!(element instanceof HTMLElement) || element.style.position !== 'fixed' || !visible(element)) return false;
    const style = getComputedStyle(element);
    if (style.pointerEvents === 'none' || Number(style.zIndex) < 0) return false;
    const rect = element.getBoundingClientRect();
    return rect.width >= innerWidth * .85 && rect.height >= innerHeight * .65 && rect.top <= 10;
  })) return true;
  const viewport = window.visualViewport;
  return innerWidth < 768 && Boolean(viewport && viewport.scale === 1 && Math.max(baselineHeight, innerHeight) - viewport.height > 150);
}

export default function NewsletterPopupController() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      const connection = new BroadcastChannel('purplesofthub-newsletter');
      channel.current = connection;
      connection.onmessage = event => {
        if (event.data === 'shown') { newsletterPreferences().shown(); setOpen(false); }
        if (event.data === 'subscribed') { newsletterPreferences().save(true); setOpen(false); }
        if (event.data === 'query' && !newsletterPreferences().canShow()) connection.postMessage('shown');
      };
      connection.postMessage('query');
      return () => { connection.close(); channel.current = null; };
    } catch { /* Session storage still prevents repeat display in this tab. */ }
  }, []);

  useEffect(() => {
    if (!pathname || !newsletterEligible(pathname, location.search)) return;
    const preferences = newsletterPreferences();
    if (!preferences.canShow()) return;
    const active = () => document.visibilityState === 'visible' && document.hasFocus();
    const clock = new EngagementClock(performance.now(), active());
    const viewportHeight = innerHeight;
    const request = new AbortController();
    let canceled = false, checking = false, available: boolean | undefined;
    const tick = async () => {
      clock.sample(performance.now(), active());
      const distance = document.documentElement.scrollHeight - innerHeight;
      const scroll = distance > 0 ? scrollY / distance : 0;
      if (canceled || checking || available === false || !preferences.canShow() || !newsletterEligible(pathname, location.search) || !clock.qualifies(scroll, active(), browsingInterrupted(viewportHeight))) return;
      checking = true;
      try {
        if (available === undefined) {
          const response = await fetch('/api/newsletter', { signal: request.signal, cache: 'no-store' });
          available = response.ok && (await response.json()).available === true;
        }
        if (!available) { clearInterval(timer); return; }
        if (canceled || !active() || browsingInterrupted(viewportHeight) || !preferences.canShow()) return;
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        preferences.shown();
        channel.current?.postMessage('shown');
        setOpenedOnPath(pathname);
        setOpen(true);
        clearInterval(timer);
      } catch { available = false; /* Never advertise a working signup when capability is unavailable. */ }
      finally { checking = false; }
    };
    const timer = window.setInterval(tick, 1000);
    const sample = () => { void tick(); };
    const storageChanged = (event: StorageEvent) => {
      if (event.key !== PREFERENCE_KEY && event.key !== null) return;
      if (!preferences.canShow()) setOpen(false);
      else void tick();
    };
    const stopAfterSubscription = () => { setOpen(false); };
    document.addEventListener('visibilitychange', sample);
    window.addEventListener('focus', sample);
    window.addEventListener('blur', sample);
    window.addEventListener('scroll', sample, { passive: true });
    window.addEventListener('storage', storageChanged);
    window.addEventListener(CHANGE_EVENT, stopAfterSubscription);
    return () => {
      canceled = true;
      request.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', sample);
      window.removeEventListener('focus', sample);
      window.removeEventListener('blur', sample);
      window.removeEventListener('scroll', sample);
      window.removeEventListener('storage', storageChanged);
      window.removeEventListener(CHANGE_EVENT, stopAfterSubscription);
    };
  }, [pathname]);

  // A route transition unmounts the dialog instead of exposing it on a private destination.
  if (!openedOnPath || openedOnPath !== pathname || !newsletterEligible(pathname || '')) return null;
  return <PopupBoundary><Suspense fallback={null}><Popup open={open} onClose={() => { newsletterPreferences().save(false); setOpen(false); }} onSubscribed={() => { newsletterPreferences().save(true); channel.current?.postMessage('subscribed'); }} returnFocus={returnFocus} /></Suspense></PopupBoundary>;
}
