"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { browserRuntime, guardNavigation } from "@/lib/analytics/browser";
import { CONSENT_KEY, PRIVACY_PREFERENCES_EVENT, eligiblePage, readPreference, validMeasurementId, type AnalyticsChoice } from "@/lib/analytics/policy";
import { saveConsent } from "@/lib/analytics/preferences";
import type { AnalyticsRuntime } from "@/lib/analytics/runtime";
import styles from "./AnalyticsPreferences.module.css";

export default function AnalyticsPreferences({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const runtime = useRef<AnalyticsRuntime | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [choice, setChoice] = useState<AnalyticsChoice>("unknown");
  const [open, setOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [restored, setRestored] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const visible = Boolean(eligiblePage(pathname || "")) || pathname === "/privacy";

  useEffect(() => {
    const current = runtime.current || browserRuntime(measurementId);
    runtime.current = current;
    const restore = () => {
      let saved: AnalyticsChoice = "unknown";
      try { saved = readPreference(localStorage.getItem(CONSENT_KEY)); } catch { /* Fail closed. */ }
      setChoice(saved);
      setRestored(true);
      setDismissed(saved !== "unknown");
      setExiting(false);
      setSaveError(false);
      current.choose(saved);
      current.rendered(window.location.pathname);
    };
    restore();
    const cleanup = guardNavigation(current);
    const storage = (event: StorageEvent) => { if (event.key === CONSENT_KEY || event.key === null) restore(); };
    window.addEventListener("storage", storage);
    return () => { cleanup(); window.removeEventListener("storage", storage); };
  }, [measurementId]);

  useEffect(() => { runtime.current?.rendered(pathname || ""); }, [pathname]);
  useEffect(() => { if (open) panel.current?.focus(); }, [open]);
  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(() => { setDismissed(true); setExiting(false); }, 240);
    return () => window.clearTimeout(timer);
  }, [exiting]);
  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setAnalyticsEnabled(choice === "accepted");
      setPreferencesOpen(true);
    };
    window.addEventListener(PRIVACY_PREFERENCES_EVENT, show);
    return () => window.removeEventListener(PRIVACY_PREFERENCES_EVENT, show);
  }, [choice]);

  function customize() {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setAnalyticsEnabled(choice === "accepted");
    setPreferencesOpen(true);
  }

  function choose(next: "accepted" | "rejected") {
    let saved = false;
    try { saved = saveConsent(next, window.localStorage, value => runtime.current?.choose(value)); }
    catch { runtime.current?.choose("rejected"); }
    if (!saved) { setChoice("rejected"); setSaveError(true); return; }
    setSaveError(false);
    setChoice(next);
    setOpen(false);
    setPreferencesOpen(false);
    if (!dismissed) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setDismissed(true);
      else setExiting(true);
      if (!preferencesOpen) document.getElementById("privacy-preferences-trigger")?.focus({ preventScroll: true });
    }
  }

  const configured = validMeasurementId(measurementId);
  const expanded = open || choice === "unknown" || saveError || exiting;
  const errorMessage = "Your preference could not be saved. Analytics is off in this tab. Please try again or check your browser storage settings.";
  return <>
    {visible && restored && !dismissed && <div data-privacy-banner className={styles.root + (exiting ? " " + styles.exiting : "")} inert={exiting} aria-hidden={exiting || undefined}>
    <button ref={trigger} type="button" className={styles.trigger} aria-expanded={expanded} aria-controls="analytics-preferences" onClick={() => setOpen(value => !value)}>Analytics preferences</button>
    {expanded && <div ref={panel} id="analytics-preferences" className={styles.panel} role="region" aria-label="Analytics preferences" tabIndex={-1} onKeyDown={event => { if (event.key === "Escape" && choice !== "unknown") { setOpen(false); trigger.current?.focus(); } }}>
      <h2>Optional website analytics</h2>
      <p>Optional Google Analytics helps us understand visits to public pages. It stays off until you agree. Rejecting it does not affect website features. <Link href="/privacy">Privacy policy</Link></p>
      <p className={styles.status} role="status">{!configured ? "Analytics is not configured. No tracking is loaded." : choice === "accepted" ? "Analytics allowed. You can withdraw at any time." : choice === "rejected" ? "Analytics rejected." : "Analytics is off until you choose to allow it."}</p>
      {saveError && <p role="alert">{errorMessage}</p>}
      <div className={styles.actions}>
        <button type="button" disabled={!configured} onClick={() => choose("accepted")}>Accept All</button>
        <button type="button" onClick={() => choose("rejected")}>Reject Optional</button>
        <button type="button" aria-haspopup="dialog" onClick={customize}>Customize</button>
      </div>
    </div>}
    </div>}
    <Dialog.Root open={preferencesOpen} onOpenChange={setPreferencesOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.preferencesOverlay} />
        <Dialog.Content className={styles.preferencesDialog} onCloseAutoFocus={event => {
          event.preventDefault();
          const original = returnFocus.current;
          const fromBanner = original?.closest('[data-privacy-banner]');
          const target = original?.isConnected && !(fromBanner && (exiting || dismissed)) ? original : document.getElementById("privacy-preferences-trigger");
          target?.focus({ preventScroll: true });
        }}>
          <Dialog.Close className={styles.close} aria-label="Close privacy preferences">×</Dialog.Close>
          <Dialog.Title className={styles.preferencesTitle}>Privacy preferences</Dialog.Title>
          <Dialog.Description className={styles.preferencesDescription}>Choose whether to allow optional analytics. To withdraw, turn analytics off and save, or select Reject Optional. Your website access stays the same.</Dialog.Description>
          <div className={styles.preferenceItem}>
            <div><h3>Strictly necessary</h3><p>Security, requested sign-in and checkout functions, and remembering your privacy choice. These cannot be turned off here.</p></div>
            <span className={styles.alwaysOn}>Always on</span>
          </div>
          <div className={styles.preferenceItem}>
            <div>
              <label className={styles.categoryLabel} htmlFor="privacy-analytics">Optional analytics</label>
              <p id="privacy-analytics-description">Google Analytics 4 measures visits to public marketing pages using cookies. We exclude private pages and remove URL queries and fragments. Advertising storage, personalization and Google signals stay disabled.</p>
            </div>
            <input id="privacy-analytics" type="checkbox" checked={analyticsEnabled} disabled={!configured} aria-describedby="privacy-analytics-description" onChange={event => setAnalyticsEnabled(event.target.checked)} />
          </div>
          <p className={styles.preferencesDescription}>Your choice is remembered for up to 180 days in this browser. Analytics cookies are configured for 30 days. Withdrawal stops future GA4 collection and removes accessible GA4 cookies; it does not delete data already received by Google. <Link href="/privacy">Read our privacy policy</Link>.</p>
          {!configured && <p role="status" className={styles.status}>Analytics is not configured. No GA4 tracking is loaded.</p>}
          {saveError && <p role="alert">{errorMessage}</p>}
          <div className={styles.actions}>
            <button type="button" disabled={!configured} onClick={() => choose("accepted")}>Accept All</button>
            <button type="button" onClick={() => choose("rejected")}>Reject Optional</button>
            <button type="button" onClick={() => choose(analyticsEnabled && configured ? "accepted" : "rejected")}>Save Preferences</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
