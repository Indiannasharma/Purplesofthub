# GA4 Release A — local review

Starting main/HEAD/origin main: 2e6098241dc19114145eb4f74357dac5ea09670d. No commit, push, deployment, Vercel setting change or production data operation is authorized for this release. Existing untracked audits are preserved.

## Implementation

The installed @next/third-parties GoogleAnalytics component queues gtag config with the default automatic page view and exposes no custom config prop for send_page_view, sanitized locations or consent. Its root-layout instance is replaced by one consent-managed tag loader; the dependency is retained and no second tracker is added. NEXT_PUBLIC_GA_ID is supplied by the server layout. The approved measurement ID is set only in ignored .env.local; no production ID is hardcoded in application source.

Accept and Reject have equal button styling, keyboard focus indicators, a non-modal region and a persistent Analytics preferences control. Accepted users can withdraw in one action. Consent is versioned and expires after 180 days on restore; broken/unavailable storage defaults to no analytics. Storage failures retain an explicit choice only in the current tab. Cross-tab preference changes are observed. No Google script or command is loaded/queued before explicit consent. Withdrawal immediately disables the tag, cancels a pending loader and clears accessible _ga and this measurement ID cookie only. Existing auth/theme/preferences are untouched. A previously executed external script cannot be unloaded, so the GA disable flag remains the collection gate; withdrawal does not delete events Google already received.

## Route and payload rules

Allowlisted static marketing pages: /, /about, /services, /portfolio, /academy, /music, /blog, /contact. Known informational service slugs and pricing pages are allowed. Blog and portfolio detail paths accept exactly one slug segment. Private/admin/dashboard/platform, auth/callback, checkout, recovery submission/success, donate success, design/test and nested preview routes are excluded. Pages marked noindex are skipped. /privacy exposes preferences without being tracked.

Locations use the approved canonical production origin and pathname only. Query strings and fragments are dropped, not allowlisted for campaign collection in Release A. Titles are controlled section labels, avoiding transient private titles. Same-site private referrers are omitted; external referrers are origin-only. No form values or business/account identifiers are read for events.

## Navigation and Google prerequisite

Manual mode uses send_page_view:false on initialization, one page_view per rendered canonical pathname and shared runtime state to prevent duplicate React effect/Strict Mode initialization. Public return visits count again after another path. Query/fragment-only changes do not create another view. History mutations and capture-phase link navigation disable the tag before URL transitions; only an eligible committed route enables it. Late script completion rechecks consent, current path and page availability, preventing stale queued page views. Blocked scripts do not block website functionality.

REQUIRED BEFORE ANY RELEASE: GA4 Enhanced Measurement must be disabled for the intended web stream, including history-based page views and automatic form/outbound events. Google documents that send_page_view:false alone does not disable history measurement: https://developers.google.com/analytics/devguides/collection/ga4/views. Stream settings were not accessed or changed. Unit tests prove application command intent and browser-adapter gates; they do not prove Google SDK transmission or property processing.

Advertising storage/user-data/personalization are denied; Google signals and ad personalization are disabled. This is explicit opt-in basic collection, not pre-consent cookieless ping collection. The privacy disclosure is updated without changing form/auth/payment logic.

## Files

Modified: app/layout.tsx, app/privacy/page.tsx. Added: components/analytics/AnalyticsPreferences.tsx and .module.css; lib/analytics/policy.ts, runtime.ts, browser.ts; tests/analytics/ga4.test.mjs; this document. Local ignored configuration: .env.local. No dependency, lockfile, database, auth, payment, theme, Nova or newsletter change.

## Validation

12 focused tests passed, including consent rejection/withdrawal, expiry/persistence serialization, accepted-after-render initialization, client navigation/deduplication, late-load races, exclusions, sensitive URL redaction, missing/example IDs, blocked scripts, Strict Mode restart, browser history ordering/cookie isolation, and server-rendered accessible controls. Existing public visible-first rendering tests: 18/18 passed. Independent TypeScript passed. Changed-file ESLint passed with zero diagnostics. Production build passed (exit 0), including all 133 generated entries and standalone packaging. git diff --check passed.

Live browser visual/network, physical device, browser storage refresh, and Realtime/DebugView checks were unavailable: the browser tool fails before opening a page. Light/dark styling uses existing semantic tokens; responsive bounds and 44px controls are in the isolated stylesheet, with no animations. These source/SSR checks are not a substitute for live visual/accessibility QA. No Google property data was generated during tests: the tag transport is simulated.

Local built-server HTML smoke: / and /privacy returned HTTP 200, retained essential content and preference controls, and contained no Google tag script. HTML fetching executed no JavaScript and generated no Google events. Local server stopped afterward.

Supplemental repository-wide ESLint was attempted with JSON diagnostics redirected to a temporary file, but produced no report before being stopped. This is not reported as a pass; the focused changed-file ESLint completed with zero diagnostics. No existing lint/test snapshots were altered. React best-practices review covered deferred tag loading, versioned storage, listener cleanup, stable runtime refs, accessible controls and keeping essential content independent of analytics initialization.
