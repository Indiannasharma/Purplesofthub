"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { browserRuntime, guardNavigation } from "@/lib/analytics/browser";
import { CONSENT_KEY, eligiblePage, preferenceRecord, readPreference, validMeasurementId, type AnalyticsChoice } from "@/lib/analytics/policy";
import type { AnalyticsRuntime } from "@/lib/analytics/runtime";
import styles from "./AnalyticsPreferences.module.css";

export default function AnalyticsPreferences({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const runtime = useRef<AnalyticsRuntime | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [choice, setChoice] = useState<AnalyticsChoice>("unknown");
  const [open, setOpen] = useState(false);
  const visible = Boolean(eligiblePage(pathname || "")) || pathname === "/privacy";

  useEffect(() => {
    const current = runtime.current || browserRuntime(measurementId);
    runtime.current = current;
    const restore = () => {
      let saved: AnalyticsChoice = "unknown";
      try { saved = readPreference(localStorage.getItem(CONSENT_KEY)); } catch { /* Fail closed. */ }
      setChoice(saved);
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

  function choose(next: "accepted" | "rejected") {
    // Stop collection synchronously, before any state update or storage operation.
    runtime.current?.choose(next);
    try { localStorage.setItem(CONSENT_KEY, preferenceRecord(next)); } catch { /* Choice applies to this tab only. */ }
    setChoice(next);
    setOpen(false);
    trigger.current?.focus();
  }

  if (!visible) return null;
  const configured = validMeasurementId(measurementId);
  const expanded = open || (choice === "unknown" && configured);
  return <div className={styles.root}>
    <button ref={trigger} type="button" className={styles.trigger} aria-expanded={expanded} aria-controls="analytics-preferences" onClick={() => setOpen(value => !value)}>Analytics preferences</button>
    {expanded && <div ref={panel} id="analytics-preferences" className={styles.panel} role="region" aria-label="Analytics preferences" tabIndex={-1} onKeyDown={event => { if (event.key === "Escape" && choice !== "unknown") { setOpen(false); trigger.current?.focus(); } }}>
      <h2>Optional website analytics</h2>
      <p>Allow Google Analytics to measure visits to our public pages. We exclude private pages and remove query strings. Rejecting analytics does not affect website features. <Link href="/privacy">Privacy policy</Link></p>
      <p className={styles.status} role="status">{!configured ? "Analytics is not configured. No tracking is loaded." : choice === "accepted" ? "Analytics allowed. You can withdraw at any time." : choice === "rejected" ? "Analytics rejected." : "Analytics is off until you choose to allow it."}</p>
      <div className={styles.actions}>
        <button type="button" disabled={!configured} onClick={() => choose("accepted")}>Accept analytics</button>
        <button type="button" onClick={() => choose("rejected")}>Reject analytics</button>
        {choice === "accepted" && <button type="button" onClick={() => choose("rejected")}>Withdraw consent</button>}
      </div>
    </div>}
  </div>;
}
