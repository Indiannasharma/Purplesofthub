# GA4 Release B — browser verification only

Date: 2026-10-14. Existing local production build served at http://127.0.0.1:3112/. Expected measurement ID: G-3P76SJXKGS. No implementation edits, installations, configuration changes, commits, pushes or deployment.

## Environment
In-app browser bootstrap failed with EPERM while resolving C:/Users/HP/.codex/plugins/cache/openai-bundled/browser-use/0.1.0-alpha2/scripts/browser-client.mjs. The file exists. Existing Chrome extension integration was accessible and used instead. Local Playwright/Puppeteer packages were not resolvable. Chrome had no existing remote-debugging-port argument. No network-capture capability was advertised, and performance was undefined in the integration's read-only evaluation scope. No HAR or outgoing GA4 payload was captured.

## Passed observable UI/DOM checks
- Homepage rendered with consent initially unknown; no googletagmanager script in DOM.
- Reject analytics collapsed the panel, persisted through reload, displayed Analytics rejected when reopened, and left no GA script in the reloaded document.
- Accept analytics appended exactly one script with https://www.googletagmanager.com/gtag/js?id=G-3P76SJXKGS. This proves the requested script URL, not successful SDK execution or collection.
- Accepted state displayed Analytics allowed and Withdraw consent.
- Withdrawal persisted through reload, displayed Analytics rejected, and left no GA script in the fresh document. Network silence immediately after withdrawal was not measurable.
- Accepted consent persisted across document reload and public SPA navigation. Homepage, Services, Portfolio, Insights listing and the published WhatsApp article rendered. One GA script remained across the sampled public navigation; this is not page_view deduplication evidence.
- Fresh unauthenticated /admin and /dashboard visits redirected to /sign-in, with zero GA scripts while consent was accepted on the same origin. Authenticated destinations were not inspected.
- /auth/callback without a code redirected to http://localhost:3112/sign-in?error=auth_failed; no GA script was present. The hostname change creates a different storage origin, so this is not an accepted-consent callback transport test.
- Consent controls were visible in dark and light themes at desktop 1440x900 and mobile 390x844. Panel rect: desktop dark x16 y649.9 w520 h234.1; mobile dark x16 y527.5 w358 h300.5. No panel clipping observed. The open panel overlays lower page content.

## Failed clean-console checks
- React production error #418 occurred on initial loads/reloads. React identifies this as a hydration mismatch: https://react.dev/errors/418. Relationship to GA4 changes is unproven; extensions could contribute and no clean-profile baseline was run.
- Paystack Inline error: Please put your Paystack Inline javascript file inside of a form element.
- Portfolio error: Could not find the table public.portfolio_projects in the schema cache. Portfolio still displayed fallback content.
No unrelated fixes were applied.

## Untested / blocked
Actual GA requests before consent, after rejection or withdrawal; exactly one initial page_view; SPA page_view deduplication; transmitted URL/query/fragment and referrer sanitization; authenticated Admin/Workspace exclusion; payment and unpublished preview transport exclusion; cross-tab consent synchronization; browser storage denial; GA4 Realtime. No production collection claim is made.

## Evidence and cleanup
Desktop/mobile dark/light screenshots and console-errors.json are stored alongside this report. Temporary viewport override was reset; original dark theme restored; test consent left rejected. The local server is stopped after verification. Release remains blocked pending transport evidence and hydration-error investigation.
