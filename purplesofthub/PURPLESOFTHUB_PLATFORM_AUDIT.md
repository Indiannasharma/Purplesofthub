# PurpleSoftHub Platform Audit

**Audit date:** 2026-09-24  
**Mode:** Read-only repository and supplied-browser-evidence audit  
**Scope:** `/admin/**`, `/dashboard/**`, shared infrastructure, API/data/auth/security, and delivery setup.  
**Evidence labels:** **VERIFIED** = source or supplied screenshot inspected; **INFERRED** = strongly indicated by source but needs deployed/runtime confirmation; **UNVERIFIED** = cannot be established without authenticated production access, Supabase console access, or provider consoles.

## Executive summary

PurpleSoftHub is a substantial Next.js SaaS/agency application with real Supabase-backed admin and client areas, payment verification, a client dashboard, Cloudinary uploads, Nova, and several public service purchase flows. It is not a mockup. The strongest architectural assets are its server-side admin dashboard aggregation, the authenticated admin layout gate, dedicated `requireAdmin()` API guards, and verified-payment checkout logic.

However, the platform currently has three urgent security/data-protection concerns and several material product-completeness and design-system concerns:

1. **[CRITICAL] Account-recovery identity documents are uploaded with service-role authority and converted to public URLs.** The public recovery endpoint accepts uploaded files without demonstrated MIME/size validation and stores links from a bucket migration configured for public reads. See `app/api/account-recovery/route.ts:35-121` and `scripts/supabase-account-recovery-migration.sql:52-68`. This is inappropriate for identity documents.
2. **[CRITICAL] Public account recovery uses privileged writes without request validation, abuse controls, or authenticated-admin verification.** The endpoint creates a service-role client, but `auth.getUser()` is called with an intentionally empty cookie adapter, so its `created_by_admin_id` is effectively unauthenticated. See `app/api/account-recovery/route.ts:35-65`. It also accepts `admin_notes` from a public form at `:18` and persists it at `:110`.
3. **[MAJOR] The universal checkout path can rewrite an existing signed-in profile to `client` while processing payment.** This must be confirmed against the full route before remediation, but the checkout’s service-role profile upsert/update path is an authorization-sensitive boundary. See `app/api/checkout/universal/route.ts:12-27` and the checked implementation history. Treat profile-role changes as auth-only operations.
4. **[MAJOR] The provided live `/admin` screenshots still show the old card-heavy “Admin Command Center” UI**, even though `main` contains a newer typography-led dashboard implementation. This is a real release-verification failure: source changes are not enough without authenticated, deployed visual QA. Screenshot evidence is **VERIFIED**; the exact deployment mismatch cause is **UNVERIFIED**.
5. **[MAJOR] Database schema/policy history is fragmented.** `lib/supabase/schema.sql`, `scripts/*.sql`, and `supabase/migrations/*.sql` all contain schema/policy setup. There is no demonstrated single migration authority or proof every production migration has run. **INFERRED** from file layout; production schema/RLS state remains **UNVERIFIED**.

No code, migration, configuration, commit, or deployment was changed by this audit. Only this report was created.

---

## Repository baseline and delivery

| Item | Finding | Evidence |
|---|---|---|
| Repository root | `C:\Users\HP\Documents\Code\Softwork\purplesofthub` | **VERIFIED** |
| Branch / HEAD | `main` / `aca1359e61fcf1c27f50e7c8c1638ee22771a981` | **VERIFIED** |
| Worktree at audit start | Clean | **VERIFIED** (`git status --short` emitted no changes) |
| Framework | Next.js `16.1.6`, React `19.2.4`, TypeScript 5, Tailwind 4 | **VERIFIED** (`package.json`) |
| UI stack | Radix/shadcn-style primitives, Lucide, ApexCharts, FullCalendar, TanStack Query/Table, Tiptap, Framer Motion | **VERIFIED** (`package.json`, `components.json`) |
| Data/auth | Supabase SSR and browser clients; service-role server client | **VERIFIED** (`lib/supabase/{server,client,admin}.ts`, `lib/auth.ts`) |
| Build | `next build`; Node `>=20.9.0` | **VERIFIED** (`package.json:5-12`) |
| Deployment config | Vercel config invokes `npm ci` + `next build`; no GitHub Actions found | **VERIFIED** (`vercel.json:1-10`, no `.github/workflows`) |
| Automated tests | No unit/e2e test files found by filename scan | **VERIFIED** |
| Authenticated rendered QA | Not available to this audit session | **UNVERIFIED** |

### Static-verification status

The interrupted prior audit had completed TypeScript and lint checks according to its tool transcript, but the gateway restarted while the production build was pending. No final build result was recoverable after restart; `.next/build-manifest.json` was absent when resumed. Therefore the production build result for this audit is **UNVERIFIED**, not failed and not passed.

---

## Route inventory

### Admin routes

All routes below are physically present under `app/admin`; access is wrapped by the admin layout gate, which rejects unauthenticated users and redirects non-admin users to `/dashboard` (**VERIFIED**, `app/admin/layout.tsx:5-15`). Implementation status is based on source inspection, not a successful authenticated browser run.

| Route(s) | Status | Data / behavior |
|---|---|---|
| `/admin` | **PARTIAL** | Server component; real aggregation through `getAdminDashboardData()` and dashboard components (`app/admin/page.tsx:30-69`, `lib/admin/dashboard.ts:1242-1258`). Supplied live screenshot shows old visual composition rather than the committed hairline layout. |
| `/admin/clients`, `/admin/clients/[id]` | **WORKING (source)** | Browser Supabase queries/mutations; detail route loads individual records. RLS must be trusted. |
| `/admin/leads` | **WORKING (source)** | Browser-side reads of contacts/chat lead data; ownership/RLS needs production validation. |
| `/admin/projects`, `/admin/projects/new` | **WORKING (source)** | Browser-side listing/create workflow. |
| `/admin/projects/[id]` | **PARTIAL** | Server-gated project record route; restoration/feature completeness concern noted in code history. |
| `/admin/services`, `/admin/services/new` | **WORKING (source)** | Dedicated admin API routes use `requireAdmin()` (`app/api/admin/services/route.ts:9-48`). |
| `/admin/invoices`, `/admin/invoices/new` | **PARTIAL** | List/new flow exists; no physical `app/admin/invoices/[id]` page despite list links referencing invoice detail in prior source inspection. |
| `/admin/payments` | **WORKING (source)** | Browser Supabase-backed payment list. |
| `/admin/portfolio`, `/admin/portfolio/new`, `/admin/portfolio/[id]` | **WORKING (source)** | Mix of browser client and form component; separate `/api/portfolio` CRUD route exists. |
| `/admin/blog`, `/admin/blog/create`, `/admin/blog/edit/[id]` | **WORKING (source)** | Browser-side CRUD; policy and sanitization require production/RLS review. |
| `/admin/comments` | **PARTIAL** | Moderation UI exists; direct browser data access. |
| `/admin/resources` | **PARTIAL** | Part of catalogue/workflow is stored in browser `localStorage`; not durable multi-user data. See `app/admin/resources/page.tsx` and local-storage scan. |
| `/admin/ads`, `/admin/ads/[clientId]` | **PARTIAL** | UI exists; inspect service integrations before calling production-ready. |
| `/admin/subscribers` | **WORKING (source)** | Newsletter/subscriber manager UI. |
| `/admin/music` | **WORKING (source)** | Client-side Supabase administration of music campaigns. |
| `/admin/promotions` | **PLACEHOLDER** | Explicit placeholder component (`app/admin/promotions/page.tsx:1`). |
| `/admin/recovery` | **PARTIAL / HIGH RISK** | Admin UI directly mutates recovery records from browser client; public intake and document handling require remediation first. |
| `/admin/settings` | **PARTIAL** | Settings UI exists; persistence/scope requires product-level confirmation. |
| TailAdmin legacy/demo routes: `/admin/calendar`, `/admin/profile`, `/admin/blank`, chart routes, form elements, basic tables, alerts, avatars, badges, buttons, images, modals, videos | **PLACEHOLDER / LEGACY** | Physical routes remain mounted but are not part of the product navigation. They create design-system and attack-surface clutter. |

### Client dashboard routes

`/dashboard/**` checks only that a Supabase user exists (`app/dashboard/layout.tsx:10-15`); individual data isolation depends on RLS/API ownership filters.

| Route | Status | Data / behavior |
|---|---|---|
| `/dashboard` | **WORKING (source)** | Server dashboard overview. |
| `/dashboard/projects` | **WORKING (source)** | Server client-project view. |
| `/dashboard/invoices` | **WORKING (source)** | Server invoice view + client component. |
| `/dashboard/services` | **PARTIAL** | Subscription/service visibility. |
| `/dashboard/files` | **WORKING (source)** | `/api/dashboard/files` list/upload/delete boundary; requires ownership/RLS runtime tests. |
| `/dashboard/ads` | **PARTIAL** | Browser Supabase query; verification of client filter/RLS required. |
| `/dashboard/music` | **PARTIAL** | Client campaign view. |
| `/dashboard/recovery` | **PARTIAL** | Recovery tracking UI; sensitive-data model must be redesigned. |
| `/dashboard/settings` | **PARTIAL** | Settings UI. |
| `/dashboard/connect-meta` | **PLACEHOLDER** | Explicit coming-soon/disabled integration. |

### Shared/public/API surface

Important public routes include service catalogue/detail/pricing/checkout routes, blog/portfolio, contact, newsletter, music, academy, donate, auth, and platform shell routes. The API surface includes admin CRUD, checkout/payment verification, contact/newsletter, dashboard files/project creation, account recovery, Cloudinary upload, Nova/chat, auth, and health/exchange-rate endpoints (`app/api/**`). The complete physical route list is generated by `rg --files app` and should be maintained as an automated route inventory in CI.

---

## Architecture and data flow

### Admin dashboard

The intended architecture is sound: `app/admin/page.tsx` authenticates and authorizes first, calls the server-only aggregation module, then renders presentation components (`app/admin/page.tsx:30-69`). `lib/admin/dashboard.ts` combines session-scoped and service-role reads to avoid silent RLS-filtered aggregates (`lib/admin/dashboard.ts:21-22`, `:1234-1258`). This is materially better than client-side dashboard aggregation.

**Risk:** the rest of the admin area is inconsistent. Many pages query or mutate Supabase directly from browser clients (`app/admin/projects/page.tsx:4`, `app/admin/leads/page.tsx:4`, `app/admin/recovery/page.tsx:4`, etc.). That is acceptable only when production RLS policies are complete, tested, and migration-consistent. The repository does not establish that reliably.

### Authentication and authorization

* **VERIFIED:** `/admin` is server-gated and role-checked (`app/admin/layout.tsx:5-15`); API routes under `app/api/admin/**` consistently use `requireAdmin()` in inspected files.
* **VERIFIED:** `getAuthenticatedProfile()` reads identity from the session and role from a service-role profile lookup (`lib/auth.ts:30-161`).
* **MAJOR / VERIFIED:** `getAuthenticatedProfile()` logs user IDs and emails (`lib/auth.ts:34-39`, `:67-72`, `:129-132`). This increases PII exposure in production logs. Replace with structured, redacted audit events.
* **INFERRED:** role bootstrap is email allowlist based (`lib/auth.ts:78-97`, `app/auth/callback/route.ts:46-110`), which is workable for a small operator team but does not scale to robust RBAC or separation of duties.

### Supabase schema and RLS

`lib/supabase/schema.sql` enables RLS for profiles, projects, invoices, files, and music campaigns and defines client/admin policies (`:1-6`, `:114-145`). Newer migrations also define notification and Nova policies. This is positive, but repository evidence shows several independent schema sources:

* `lib/supabase/schema.sql`
* `scripts/supabase-setup.sql`
* `scripts/supabase-account-recovery-*.sql`
* `supabase/*.sql`
* `supabase/migrations/*.sql`

**MAJOR / INFERRED:** without a single migration lineage and a deployed migration ledger, the actual production schema, triggers, storage policies, and RLS state cannot be inferred safely from source.

### Payments and subscriptions

The universal checkout route verifies Paystack/Flutterwave payment references server-side before plan fulfillment (`app/api/checkout/universal/route.ts:32-58`), a strong baseline. Google Ads/service pricing is maintained in `lib/payments/service-plans.ts` and current checkout logic includes weekly support from recent commits.

**MAJOR / INFERRED:** payment webhooks, idempotency records, replay prevention, and reconciliation were not established by the inspected route list. Verify provider dashboard webhooks and database constraints before relying on the system for revenue-critical fulfillment.

### Integrations

| Integration | Assessment |
|---|---|
| Supabase | Core data/auth; schema/RLS deployment state **UNVERIFIED**. |
| Paystack / Flutterwave | Server verification exists; webhook/reconciliation coverage **UNVERIFIED**. |
| Cloudinary | Upload route has authentication/purpose checks (`app/api/upload/cloudinary/route.ts:34-90`); file type/size enforcement needs endpoint review and tests. |
| Email / Nodemailer | Used by contact/recovery flows; availability and deliverability **UNVERIFIED**. |
| Nova | API and migrations exist (`app/api/nova/route.ts`, `supabase/migrations/20260615155000_add_nova_agent_tables.sql`); abuse controls/model-key handling **UNVERIFIED**. |
| Turnstile | UI component explicitly says integration TODO (`components/TurnstileWidget.tsx:10`); contact route accepts token but source inspected did not show server verification. **MAJOR / VERIFIED**. |
| Vercel | Config exists; production deployment linkage/status **UNVERIFIED**. |

---

## UI/UX and accessibility audit

### Verified browser evidence

The supplied live screenshots show:

* `/admin` still has the old large KPI-card grid, oversized greeting, loud micro-headings (“ADMIN COMMAND CENTER”, “LIVE BUSINESS PULSE”), high border density, and generic sidebar treatment. **VERIFIED from supplied screenshots.**
* Services dark mode still has low-contrast category labels, despite source commits intended to correct this. **VERIFIED from supplied screenshot.**
* Browser state/URL indicates these are production pages, but the deployed Git SHA cannot be determined from screenshot alone. **UNVERIFIED.**

### Root causes of prior admin redesign failure

1. **Release verification failure — VERIFIED:** visual work was assessed from source/local builds without authenticated production screenshots at the target viewport. The supplied production screenshot contradicts the intended source composition in `app/admin/page.tsx:22-25, :45-68` and `components/admin/dashboard/MetricsStrip.tsx:14-17`.
2. **Two design systems — VERIFIED:** TailAdmin demo pages/components coexist with the custom admin shell and public “cyber/purple” styling. Legacy classes and separate global rules leave visual drift likely.
3. **Global token ambiguity — VERIFIED:** prior Services contrast fixes were necessary because the same accent concept was used with incompatible surface/text semantics. This is a design-token governance issue, not simply a missed hex color.
4. **Visual judgment/process — INFERRED:** composition changes were treated as isolated component edits without a protected visual-regression baseline for 1440×900 light/dark, tablet, and mobile.

### Accessibility

Positive: admin shell provides a skip link (`components/admin/AdminShell.tsx:26-31`); metric links have visible-focus support (`MetricsStrip.tsx:60-77`).

Gaps: no automated accessibility test suite found; contrast defects were observed in production; keyboard, screen-reader, and responsive QA are **UNVERIFIED**. Build a component-level contrast/token test and Playwright/Axe route suite.

---

## Security risk register

| Severity | Finding | Evidence | Remediation acceptance criterion |
|---|---|---|---|
| **CRITICAL** | Public recovery documents are accessible through public URLs/bucket policy. | `app/api/account-recovery/route.ts:68-101`; `scripts/supabase-account-recovery-migration.sql:52-68` | Bucket is private; only short-lived signed URLs issued after admin authorization; old public objects remediated. |
| **CRITICAL** | Recovery upload endpoint uses service role for an unauthenticated public request, with no demonstrated MIME, byte-limit, anti-malware, CSRF, CAPTCHA, or rate-limit checks. | `app/api/account-recovery/route.ts:8-121` | Server validates schema, max bytes/type/signature; authenticated admin creation split from public submission; abuse controls and audit logs tested. |
| **CRITICAL** | Public form can submit `admin_notes`. | `app/api/account-recovery/route.ts:18, :110` | Public API schema rejects internal fields; admin notes writable only through admin API/RLS. |
| **MAJOR** | Contact route receives Turnstile token but inspected source does not verify it server-side. | `app/api/contact/route.ts:64-104`; `components/TurnstileWidget.tsx:10` | Server calls Turnstile Siteverify; invalid/missing tokens fail closed when enabled; automated tests cover bypass attempts. |
| **MAJOR** | RLS/schema history fragmented; actual deployed policies unknown. | Multiple SQL roots listed above | One versioned migration authority; CI validates a clean database migration; production migration state reconciled. |
| **MAJOR** | Direct browser Supabase admin mutations rely entirely on RLS correctness. | Multiple admin pages importing `lib/supabase/client` | Sensitive mutations use guarded API/server actions, or policy tests prove least privilege for every table/action. |
| **MAJOR** | Payment identity/profile mutation boundary needs a dedicated authorization review. | `app/api/checkout/universal/route.ts:12-27` and fulfillment path | Payment fulfillment never changes roles; idempotency/replay tests and webhook reconciliation exist. |
| **MINOR** | PII-rich auth debug logs. | `lib/auth.ts:34-39, :67-72, :129-132` | No user email/ID in normal production logs; security events are structured and access-controlled. |
| **MINOR** | Legacy/demo admin routes expand maintenance and exposure. | `app/admin/(others-pages)/**`, `app/admin/(ui-elements)/**` | Remove, redirect, or explicitly gate demo routes; navigation and route tests ensure no orphaned surfaces. |

---

## Performance, testing, and delivery

* **VERIFIED:** dashboard aggregation uses parallelized server-side data loading in `lib/admin/dashboard.ts:1242-1258`.
* **INFERRED:** client-side admin pages can issue broad/unpaginated browser queries; audit actual row limits and indexes against production query plans.
* **VERIFIED:** no test suite was located. TypeScript/ESLint/build commands exist, but no test script exists in `package.json`.
* **VERIFIED:** no GitHub Actions workflow was found. Vercel builds from `npm ci` and `next build` (`vercel.json:1-10`).
* **MAJOR / INFERRED:** no CI-enforced type, lint, build, migration, security, or visual regression gate protects `main`.

---

## Dependency-aware remediation roadmap

### Phase 0 — Contain sensitive-data risk (0–2 days)

1. Disable or restrict public recovery document uploads; make bucket private.
2. Remove public `admin_notes`; split public recovery intake and internal staff workflow.
3. Add server schema validation, size/MIME/signature checks, rate limits, CAPTCHA verification, and safe error handling to recovery/contact endpoints.
4. Remove PII debug logs.

**Acceptance:** an unauthenticated requester cannot retrieve any identity document, submit internal fields, exceed upload limits, or bypass abuse checks; security tests demonstrate all four cases.

### Phase 1 — Establish truth for data/auth (1–2 weeks)

1. Declare `supabase/migrations` the only schema source; fold/reconcile script SQL into versioned migrations.
2. Export production schema/policies and compare against migrations in a safe staging review.
3. Inventory every browser-side table mutation; migrate high-risk flows to guarded routes/server actions.
4. Formalize roles (at least admin/client; potentially super-admin) and prohibit role writes from checkout/profile self-service flows.

**Acceptance:** clean database can be created by migrations; policy tests prove client isolation and admin-only writes; payment fulfillment cannot modify roles.

### Phase 2 — Product completeness (2–4 weeks)

1. Replace or remove Promotions, Connect Meta, and legacy TailAdmin demo routes.
2. Complete project/invoice detail flows and move Resources persistence from local storage to Supabase.
3. Define ownership/empty/loading/error contracts for every admin/client route.

**Acceptance:** route inventory contains no accidental placeholders; each nav link resolves to a production-ready route with a tested empty/error state.

### Phase 3 — Design system and visual QA (parallel after Phase 1)

1. Consolidate tokens: separate brand accent, text, surface, border, interactive, and chart values for light/dark themes.
2. Finish the admin redesign only after deployment commit verification and authenticated visual review.
3. Add Playwright screenshots at 1440×900 light/dark, 1024×768, 768×1024, and 375×812 for `/admin`, `/services`, and client dashboard fundamentals.
4. Add Axe/keyboard checks and contrast guardrails.

**Acceptance:** production screenshot baseline matches approved composition; all tested viewports have no overflow, contrast failure, or Nova collision; production SHA is recorded against the approved build.

### Phase 4 — Reliability and delivery (ongoing)

1. Add CI: `tsc --noEmit`, ESLint, build, route smoke tests, migration/policy tests, dependency audit, and visual regression checks.
2. Add provider webhook validation, idempotency ledger, failed-payment reconciliation, and operational alerting.
3. Define backup/restore, secret rotation, log-retention, and incident-response procedures.

**Acceptance:** every merge to `main` has reproducible green checks; payment retries do not duplicate fulfillment; restore drill and deployment rollback are documented and tested.

---

## Audit limitations

This audit did **not** access Supabase, Vercel, payment-provider, Cloudinary, email, or production environment consoles; did not run migrations; did not make network mutations; and did not authenticate into the live admin/client UI. Findings about deployed RLS, storage access, live provider configuration, and runtime rendering are therefore marked appropriately. The supplied screenshots are treated as valid visual evidence but do not prove the deployed commit SHA.

## Stop point

**Review this report before implementation. No code changes, migrations, commits, or pushes were made.**
