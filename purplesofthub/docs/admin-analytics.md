# Admin Analytics & Intelligence Center

## Scope and access

Built on main after newsletter release `8acb51595aea827142feff06c633c6e17f129cf5`. Routes: `/admin/analytics` (overview), `/admin/analytics/pages` (page performance), and read-only `GET /api/admin/analytics`. The existing shared navigation supplies desktop/mobile menus, search and breadcrumbs.

Every page and API entry calls `authorizedAnalytics`, which verifies the existing server-side `requireAdmin()` before parsing report inputs, contacting providers or reading the cache. The existing admin layout remains an additional guard. Authorization is never cached. API responses are `private, no-store`; anonymous/non-admin requests return 401/403 with no report data. No authentication logic or subscriber behavior was changed. Provider modules import `server-only`; keys, tokens and subscriber emails never enter the response model.

## GA4 setup (currently disconnected)

The public measurement ID is not a reporting credential. A deployment administrator must supply the following server-only configuration after obtaining the correct values from the owner:

| Variable | Required value |
| --- | --- |
| `GA4_PROPERTY_ID` | Numeric GA4 property ID. Confirm that its web stream is the intended PurpleSoftHub stream; do not use a `G-` measurement ID. |
| `GA4_SERVICE_ACCOUNT_EMAIL` | Dedicated Google Cloud service-account email granted Viewer access in GA4 Property access management. |
| `GA4_PRIVATE_KEY` | Corresponding private key, stored as a Vercel Production secret. Literal escaped newlines and actual PEM newlines are supported. |

Enable the Google Analytics Data API in the service account's Cloud project. Grant least-privilege GA4 Viewer access at property level; no Google Cloud project-wide Editor role or domain-wide delegation is needed. Do not paste keys into tickets, browser forms or this guide. Do not add a NEXT_PUBLIC prefix. This task does not change environment settings.

The server implements Google's documented service-account OAuth JWT exchange using Node's built-in RSA signing and fetch (no added dependency). Access tokens are held only in server memory with expiration and in-flight deduplication. Seven reports are grouped into batches of five and two through the official GA4 Data API: current/prior totals, daily trends, pages, acquisition channels, countries and devices. The API is not considered connected until real requests succeed and report headers/metrics/timezone normalize successfully. Permission errors, quotas, malformed reports, missing configuration and timeouts have distinct honest unavailable states; raw Google responses/errors are not returned.

The intended web stream has measurement ID `G-3P76SJXKGS`; use this only to identify the correct property/stream in GA4, never as authentication. A read-only Vercel Production metadata check confirmed the two existing Supabase variables are present and all three new reporting variables above are absent. No values were displayed and no environment settings changed. The disconnected release is intentional and permitted by the task; no live Google reporting success is claimed.

Official references: [service-account OAuth](https://developers.google.com/identity/protocols/oauth2/service-account), [batchRunReports](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/batchRunReports), [dimensions and metrics](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema).

All report requests restrict production hostnames and allowlisted public paths, additionally excluding preview/draft, payment, callback and account-recovery paths. Normalization rejects sensitive/private paths and URLs carrying queries/fragments before displaying page records. Page-view share uses the verified overall public-view total, not a sum of the top 100 rows. Active-user totals come from Google and are never summed across daily/page breakdowns. Pages search/sort/pagination operate on at most the top 100 reported paths, explicitly labeled; the UI shows 20 rows per page. Google sampling/thresholding/grouping flags are surfaced and missing dates are not zero-filled for such limited reports.

This adds reporting only. It does not change GA4 collection, consent, cookies, tracking eligibility, the newsletter popup, Paystack, authentication or Portfolio.

## Newsletter data and resource bounds

The existing `public.newsletter_subscribers` schema was inspected through the applied migration and real zero-row metadata requests. The analytics provider uses only id (HEAD counts), status filtering and selected-period created_at timestamps. Postgres computes exact all-time, active, selected-period and prior-period counts; no subscriber email/name is selected. The daily trend is aggregated server-side from selected-period timestamps in pages of 1,000, capped at 10,000 records. Above that bound, exact counts remain visible while daily detail explicitly becomes unavailable. A changed row count during a multi-page read suppresses inconsistent daily detail.

No table, index, RPC or database migration was introduced for analytics. Four exact-count requests and bounded timestamp reads run only on a cache miss. Aggregates are cached for ten minutes per server process with a maximum of 20 range/configuration entries and in-flight deduplication. Cold serverless instances can re-fetch; this is not a globally shared persistent cache. Configuration fingerprints invalidate cache entries after credential changes without storing secrets in cache keys. Totals are snapshots, not an atomic transactional read across multiple requests. For large datasets, a separately approved indexed/materialized aggregation can replace bounded detail without changing the response contract.

## Dates, comparisons and data interpretation

Presets are the last 7, 30 or 90 **completed calendar days**, ending yesterday according to UTC at request time. Custom ranges allow 1–90 completed dates, with an equal-length immediately preceding comparison. All-time newsletter totals include today; new-subscriber/trend data follows the selected completed period. A zero prior period has no percentage baseline; it never displays infinity or a fabricated percentage.

Newsletter timestamp boundaries and buckets are explicitly UTC (`>= start midnight`, `< day after end midnight`). GA4 uses the same selected calendar-date strings in its property's reporting timezone, returned by Google and labeled beside traffic charts. These are independent calendar-day reports, not merged timestamp series: cross-source daily ratios/conversion rates are not calculated. Near timezone boundaries, GA4's local calendar day may differ from UTC; administrators should interpret each labeled source separately. Google reports may lag collection and represent consented traffic, not all visitors. No business revenue/conversion values are inferred from traffic.

## UI and verification

The interface reuses AdminPage/AdminPageHeader, Command Center typography/tokens, lucide icons and the installed ApexCharts dependency, loaded only for chart rendering. Light/dark styling uses existing themes. Chart animation is disabled; accessible daily tables accompany charts. Page tables have headers/captions, controlled search/sort and bounded pagination. Date controls are labeled, sources and last-checked UTC timestamps are explicit, and loading placeholders never display invented metrics.

Focused tests cover authentication before cached/uncached data, page redirects, navigation, missing GA4 configuration, correctly signed readonly OAuth assertions, batches of at most five, API permission/quota/network errors, response-header normalization, empty and thresholded results, UTC/date validation, previous-period calculations, newsletter exact counts/pagination bounds and privacy exclusions. These use isolated test reports and generated ephemeral RSA keys; they are not evidence of live GA4 collection/reporting.

Live read-only newsletter verification matched independent Supabase HEAD counts: total 1, active 1, selected completed 30-day period 0, previous period 0. The current-period zero is verified and expected because the retained test signup was created today. No subscriber was created or changed. Local anonymous checks returned 401 from the new API and 307 redirects to /sign-in from both new admin routes. GA4 reporting credentials are absent locally; no real Google report success is claimed.

Authenticated browser verification depends on an existing administrator session. The normal Chrome integration currently reports an inaccessible request-header policy; do not bypass authentication or mint a session to work around it. Isolated rendering checks, if used, must be clearly distinguished from authenticated end-to-end checks. Production authenticated owner smoke testing remains appropriate after release. No private-key values, subscriber lists or auth cookies should be saved as QA artifacts.

Fourteen focused tests passed. Independent TypeScript checks passed. The actual dashboard component and installed native ApexCharts rendered in an isolated loopback-only SSR harness with the verified Supabase snapshot, at 1440px and 390px in light and dark themes. All four cases had no horizontal overflow, valid chart geometry, accessible daily tables and no captured runtime exceptions. Visual inspection identified inherited marketing section padding on the KPI grid; a scoped override corrected it and all four checks passed again. These checks do not prove React hydration or interaction in a signed-in administrator session. No authentication bypass or preview route was added to the application.

Newsletter reporting has a shared 15-second deadline across its count/detail queries, rather than a separate timeout for every page. Google exchanges have per-request 12-second timeouts and the reporting operation has a 25-second deadline. Network failures remain source-specific unavailable states. The rendering harness and its isolated Chrome instance were closed before the final production build; existing user processes were preserved.

Final changed-file ESLint and staged diff checks passed with no diagnostics. A staged scan found no actual configured secrets, private-key/token literals, environment files or generated QA/build artifacts. Preservation checks found no changes to the deployed newsletter, GA4 collection/consent, Paystack, theme, Navbar or Portfolio files. The first build attempt passed compilation, TypeScript and page generation but failed standalone packaging with Windows EBUSY on a generated Noto Sans font. Both source and destination then passed exclusive read-only handle checks; a build retry was necessary after the lock cleared. No files were deleted and no user process was stopped.

The retry completed successfully (exit code 0): compilation in 93 seconds, TypeScript, 133 generated entries and final standalone packaging. Both analytics pages and the guarded API appear in the production route table. No application source changed after this successful build; only this verification record was appended. Production release is permitted with an accurate GA4 disconnected state and verified newsletter aggregates; real GA4 reporting and signed-in administrator interaction/hydration remain unverified as described above.
