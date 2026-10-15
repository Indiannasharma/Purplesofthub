"use client";

import { PRIVACY_PREFERENCES_EVENT } from "@/lib/analytics/policy";
import styles from "./AnalyticsPreferences.module.css";

/** Opens the existing consent controller; owns no consent state or storage. */
export default function PrivacyPreferencesButton() {
  return <button type="button" className={styles.footerTrigger} aria-haspopup="dialog" onClick={() => window.dispatchEvent(new Event(PRIVACY_PREFERENCES_EVENT))}>Privacy Preferences</button>;
}
