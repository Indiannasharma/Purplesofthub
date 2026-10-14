# Release C — targeted stability remediation

Baseline: main/HEAD `2e6098241dc19114145eb4f74357dac5ea09670d`. All changes remain local and uncommitted. No push, deployment, package installation, payment transaction or database mutation was performed.

## Initial state and preservation

Release A already modified `app/layout.tsx` and `app/privacy/page.tsx`, and added:

- `components/analytics/AnalyticsPreferences.tsx`
- `components/analytics/AnalyticsPreferences.module.css`
- `lib/analytics/browser.ts`, `policy.ts`, `runtime.ts`
- `tests/analytics/ga4.test.mjs`
- `docs/ga4-release-a.md`

Existing `docs/qa/` browser evidence and the three untracked platform/portfolio audit documents are preserved. Ignored local environment files were not edited. Before Release C, Navbar, ThemeContext, checkout controllers, Portfolio client/page and SQL were unchanged from the baseline. Release C does not edit the GA4 modules, consent controls, privacy disclosure or existing GA4 tests. The shared root layout retains exactly the same AnalyticsPreferences integration and environment-based ID.

## Hydration

The pre-existing theme bridge resolves an unknown server theme as light, while the browser can initially resolve a stored dark theme. Navbar conditionally renders different SVG children and also uses theme-dependent styles and button titles. This is a confirmed source-level mismatch risk; the earlier minified React stack did not conclusively identify the failing component.

`components/Navbar.tsx` now uses a stable `useSyncExternalStore` hydration snapshot. Server rendering and initial hydration both use the existing light fallback; saved/system theme controls and styles resolve afterwards. Navigation remains rendered, and theme preference storage/toggling is unchanged. ThemeContext and Nova were not edited. Rendering both icons with CSS alone was not selected because it would leave the other theme-dependent initial attributes inconsistent. A brief transition from fallback navbar colors to the resolved theme remains possible.

## Paystack

The existing root-level Next Script loader added `data-nscript` and appended the SDK to body. Paystack v1 interprets any data attribute as automatic form embedding and throws when the parent is not a form. This integration predates Release A.

- `app/layout.tsx`: remove only the global Paystack Script. Retain GA4 preferences and the existing Flutterwave loader.
- `lib/payments/paystack-loader.ts`: load the existing v1 SDK only on inline payment request, without data attributes; share pending loads; validate readiness; enforce a 15-second timeout; clean up failed script nodes and allow retry. Reuse an already ready SDK. No script is loaded merely by importing the module. Referrer policy is no-referrer.
- `components/checkout/UniversalCheckoutModal.tsx`: await SDK readiness before setup, prevent duplicate in-flight openings, recover loader/setup errors, and avoid opening a late iframe after the checkout unmounts.

UniversalCheckoutModal is the sole PaystackPop consumer, including its service-pricing and dashboard-music callers. The existing payment configuration was AST-compared with HEAD and matched after removal of TypeScript-only callback annotations. Amounts, currency, references, metadata and payment callbacks are preserved. Payment APIs, authorization/verification code, authentication prefill logic and Flutterwave checkout logic were not modified.

The service CheckoutModal redirect controller is unchanged and covered by a normalized baseline fingerprint. Live SDK behavior, popup/browser policy compatibility and successful payment completion have not been verified. Tests simulate the SDK and forbid real request transport. No payment transaction was initiated.

## Portfolio read-only verification

A zero-row GET against the configured Supabase REST endpoint requested only `id` with `limit=0`, using the existing anonymous configuration without displaying credentials. Result: HTTP 404, code `PGRST205`, message `Could not find the table 'public.portfolio_projects' in the schema cache`. No records were requested or returned.

This confirms the configured API cannot resolve the relation. It does not establish whether the physical table is absent, its schema exposure/cache is incorrect, or the configured project differs from the intended production project. No privileged database catalog connection or production-configuration comparison was available for this audit.

The repository's standalone SUPABASE_PORTFOLIO_SETUP.sql declares the table at line 171. It also references it from portfolio_testimonials at line 132, before creation, which is unsafe on a fresh database. The inspected versioned migrations contain no portfolio_projects creation. Do not run the setup SQL automatically. Portfolio source, SQL, database configuration and existing bundled fallback projects remain unchanged.

Next database step: separately review the intended project, exposed schema and physical relation read-only with appropriate access. Choose any configuration correction, cache remedy or migration only after establishing the cause and obtaining approval.

## Validation

- 10 new focused stability tests: passed.
- 12 existing GA4 tests: passed.
- 18 existing public-rendering regressions: passed.
- Independent TypeScript: passed.
- Changed-file ESLint: passed after correcting two diagnostics in the newly added test fixture; zero final diagnostics.
- Existing rendering fixture emits its previously observed React warning about the test-only jsx attribute; tests pass.
- git diff --check: passed.
- Production build: passed (exit 0), including 133 generated entries; compiled in 82 seconds. Validation ran sequentially with one build and no browser session.

Tests cover initial navbar markup under light/dark preferences, resolved theme controls, SDK readiness/concurrent loading, network failure/timeout/missing SDK/retry, inline payload/callback preservation, duplicate opening prevention, modal closure during loading, setup error recovery, preserved consent/Flutterwave integration and redirect independence.

No additional browser sessions were launched for Release C. Browser hydration-error clearance, real Paystack SDK integration and outgoing GA4 requests remain release gates. Release B's network-verification blocker is not resolved by these source fixes. Stop for review; do not commit or deploy automatically.
