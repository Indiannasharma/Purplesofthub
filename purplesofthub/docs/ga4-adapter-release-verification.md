# GA4 adapter correction and release verification

Date: 2026-10-14. Saved implementation commit: `c843bbbbd84ab130fc07c41dc75a111135be6476`. Production/main baseline: `2e6098241dc19114145eb4f74357dac5ea09670d`.

## Correction

`lib/analytics/browser.ts` now forwards native `arguments` objects through Google's documented gtag adapter rather than pushing arrays. The actual Google SDK loaded with HTTP 200 but ignored the previous command format; an isolated diagnostic using the native format emitted a real collection request. Consent gating, eligibility, URL/referrer policy, manual page-view configuration and deduplication are unchanged.

The new focused regression test executes the browser adapter and checks every queued command is `[object Arguments]`, not an array, while preserving measurement ID and `send_page_view:false`. The old adapter fails this assertion. Reference: https://developers.google.com/tag-platform/devguides/datalayer.

## Real network verification

Installed Chrome was run headlessly with an isolated temporary profile, a 430px viewport and reduced motion. Its loopback debugging interface captured actual, unmocked Google requests from the local production build on port 3113. The normal browser profile was untouched. No packages were installed.

| Scenario | Collection requests | Page views |
| --- | ---: | ---: |
| Before consent | 0 | 0 |
| Initial acceptance | 1 | 1 |
| SPA Services | 1 | 1 |
| SPA Portfolio | 1 | 1 |
| SPA Insights | 1 | 1 |
| Unchanged pathname | 0 | 0 |
| Document navigation with query/fragment | 1 | 1 |
| External referrer with a query | 1 | 1 |
| After withdrawal | 0 | 0 |
| After rejection | 0 | 0 |
| Admin, Dashboard, sign-in, callback, checkout success | 0 each | 0 each |

Observed page-view payloads used `tid=G-3P76SJXKGS` and `en=page_view`. Locations were canonical public URLs without query strings or fragments. The external referrer became `https://external.example`, excluding its path/query. All successful page-view collection responses were HTTP 204. This is transport evidence, not GA4 Realtime/property-processing evidence. Private-route checks used an unauthenticated isolated profile; protected destinations redirected to sign-in. Authenticated application screens were not exercised.

An earlier development navigation stalled and an earlier harness DOM condition attempted to serialize a React-owned element. Neither is treated as a successful check. The final complete production-build run used boolean conditions and completed without runtime exceptions. Earlier release documents describe historical validation stages; this report supersedes their outgoing-GA4 verification limitation for the scenarios above.

## Paystack

The actual unchanged scoped loader was transpiled into an isolated blank Chrome document. A deliberately paused SDK download exercised the real 15-second timeout: it rejected after about 15 seconds and removed the script. After restoring network access, concurrent retry calls shared one promise and resolved to the real Paystack SDK. A later call reused that SDK; exactly one script remained, with no data attributes, initialization exceptions or Paystack iframe. No SDK setup/openIframe call, credentials, payment API call or transaction was made.

Existing automated checkout tests cover timeout/network failure, retries, preserved inline configuration, duplicate opening prevention, closure during loading and error recovery. Real payment-popup behavior and successful transactions are not claimed verified.

## Validation and release prerequisites

- GA4 focused tests: 13 passed.
- Existing checkout/stability tests: 10 passed.
- TypeScript and changed-file ESLint: passed.
- Diff checks: passed.
- One production build: passed, including all 133 generated entries. No build configuration was changed.
- Owner confirmed the exact Vercel Production `NEXT_PUBLIC_GA_ID=G-3P76SJXKGS` value and disabled GA4 Enhanced Measurement in this conversation. These confirmations are not presented as API inspection.
- Vercel CLI returned a ready Production deployment matching the baseline SHA: `https://purplesofthub-jutckz6yh-purplesofthub-9836s-projects.vercel.app`.

Rollback target is the baseline deployment above. If Vercel rollback access is unavailable, reverting the release commits on main and pushing normally restores the baseline code through the existing Git deployment workflow, without rewriting history. Neither rollback method was executed during verification.

Portfolio's existing Supabase relation issue remains unchanged, with fallback content preserved. No database migration, payment configuration, authentication, Nova or newsletter change is included in the adapter correction. Unrelated audits and generated browser captures remain excluded from release commits.
