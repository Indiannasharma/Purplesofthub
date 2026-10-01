# Customer Workspace Phase 2

Scope: the authenticated customer shell and the /dashboard Overview only. Starting main and fetched origin/main were 3ab627602a60b5d4bd6d358dfe958fe59bbc864d. The three existing untracked audits were preserved. The full platform audit and Phase 1 foundation report were read before editing.

## Delivered behavior

The customer frame uses Phase 1 CC semantic tokens, Inter/Space Grotesk font variables, WorkspaceRoot, the exported WorkspaceNavigation, shared headers, buttons, states, badges, theme control and portalled Radix Sheet content. It keeps the old fixed viewport and independently scrolling main contract so the nine other customer route bodies keep their existing layout and controllers. Sidebar groups separate account work from service discovery; desktop begins at 1024px. Mobile uses a scrollable Radix Sheet with an accessible title and description, focus containment, Escape and focus return. No collapse controller, fake search or analytics was added.

The server layout still uses the same cookie-session createClient(), auth.getUser(), and redirect('/sign-in') condition. It passes only the already-verified user's id, name metadata and email to the presentation shell, replacing a duplicate browser getUser() effect. It adds no role exclusion, profile bootstrap or privilege. The real UserNotificationBell is reused without changing any read/subscription/localStorage logic. Sign out calls the existing browser Supabase auth.signOut() and routes to /sign-in; its new account menu reports an unsuccessful sign-out instead of navigating away. Theme uses the existing next-themes bridge and storage key.

The Overview is a server-rendered pure view behind the same existing page auth guard. Its Suspense boundary begins after authentication and uses WorkspaceLoadingState. It shows a profile-name greeting, one contextual action, recent projects, recent invoices, recent music campaigns, Files access, service discovery, honest public Academy discovery and actual WhatsApp/Nova guidance. No totals, charts, active-subscription claim or cross-domain activity feed appears.

## Exact data contracts

All four reads use the existing session-scoped SSR Supabase client. They start in parallel. Domain queries never use a service-role client or the role-dependent /api/dashboard aggregator.

| Source | Fields selected | Ownership | Order / bound | Display |
| --- | --- | --- | --- | --- |
| profiles | full_name | id = current auth user.id | maybeSingle() | First name; validated auth name metadata is a fallback; email is not the greeting |
| projects | id, title, service_type, status, progress, created_at | client_id = current auth user.id | created_at descending, limit 5 | Title, recorded service/status, valid 0–100 progress, explicitly labelled created date |
| invoices | id, invoice_number, amount, currency, status, due_date, created_at | client_id = current auth user.id | created_at descending, limit 5 | Recorded number/status, native currency amount, due date or issued date |
| music_campaigns | id, track_title, artist_name, plan_name, status, created_at | client_id = current auth user.id | created_at descending, limit 3 | Track, artist, actual plan/status, created/submission date |

These reuse the ownership contracts already present in Overview, Projects, Invoices, Music and the dashboard API. Projects and invoices change from select('*') to explicit columns and from sequential to parallel reads. The profile read selects only full_name; music is a new bounded Overview read using the existing Music ownership contract. No nested task/update joins, N+1 reads or full-table scans for counts are introduced. No API or existing module query is changed.

Bounded lists are labelled recent; they are never summed or counted into account-wide metrics. Dates use an explicit UTC formatter and have an unavailable state for absent/invalid values. Invoice zero remains zero; missing amounts/currencies remain unavailable, and no regional conversion, total fallback or NGN assumption is made. The known amount-versus-total schema disagreement is not solved here. If a requested column is unavailable in a deployment, that domain shows unavailable instead of inventing an amount. Existing statuses are displayed without changing stored semantics. No invoice Pay action or missing project-detail destination is exposed.

The next action checks the recent invoice statuses pending/sent/overdue, then a recent in_progress project, then a music record. It links to the real existing list route. Otherwise it offers service discovery; it never claims that all account work is clear or fabricates a due task. Recovery, files, ads and subscriptions are not queried for Overview metrics. Recovery's email/user_id disagreement and purchase/subscription reconciliation remain later functional work.

## Routes and future products

The navigation inventory remains separate from authorization and can accept future destinations/groups without a new identity or capability model. Current groups are Your workspace (Overview, Projects, Invoices, Files), Grow with us (Services, Advertising, Music, Account Recovery plus the manual Meta access guide), and Explore & account (public Academy and Settings). WhatsApp support uses the existing https://wa.me/qr/L36LMHQ4RLP2B1 destination and announces a new tab. Academy links to /academy with public tracks/waitlist copy; there is no My Courses, progress, enrollment or certificate UI. Marketplace and Creator Hub stay out of operational navigation.

The existing global Nova controller, AI request, conversation/handoff/lead persistence and support link remain unchanged. A reserved lane below the scrolling main keeps its closed launcher from obscuring links at every tested width. Nova is hidden while the mobile modal Sheet blocks the workspace. The assistant's open panel retains its existing behavior.

## State and accessibility contracts

A successful empty read renders an explained shared empty state with useful real destinations. Failed reads render a shared alert and refresh guidance; missing schema/null data is unavailable; permission/session errors are access unavailable. Failures in one domain or the profile read cannot erase other successful domain records. Raw database error details are not exposed. Loading has aria-busy. Profile-name failure yields an honest generic greeting without exposing email.

The shell has a working skip link and focusable main; navigation uses segment-aware active matching and aria-current. Icon controls have names, Radix owns Sheet/account/theme keyboard behavior, record sections have headings and accessible labels, progress bars expose their actual value, and scoped focus/reduced-motion rules are retained. Legacy notification accessibility remains its existing implementation; it was not represented as newly verified.

## Isolated visual QA

/design/command-center/customer renders the actual CustomerShell and pure Overview with clearly labelled synthetic fixtures for populated/empty/failed/unavailable/unauthorized/loading views. It inherits the existing parent noindex/nofollow and production-disabled preview guard; it is never linked from product navigation. It imports no production data loader, never mounts UserNotificationBell with a fictitious user, and creates no database test records. DESIGN_PREVIEW_ENABLED was set only in a task-owned local process, not in deployment config or environment files. Fixture records are never used as production fallbacks.

The local compiled server was used because this environment's browser session did not provide an authenticated customer. Authenticated live-data visual QA and production writes/payment/auth E2E are not claimed. The browser skill's primary bridge was unavailable, so the supported computer-use browser API opened a permitted local HTTP tab. An existing browser error page could not be bound due to URL protocol policy; that error page was not bypassed.

## Validation record

- TypeScript: npx --no-install tsc --noEmit passed; production build TypeScript also passed.
- Changed/new JavaScript and TypeScript ESLint: 12 files, zero errors and zero warnings under the unchanged config.
- Tests: 74 passing (63 existing, 11 new). New tests cover query ownership/limits/explicit columns, partial failure, native currencies and zero, missing progress, profile greeting, actionable recent status, honest Academy and real-route preservation. No large HTML snapshots.
- Production build: Next 16.1.6 / Turbopack passed, 145 pages generated. Existing edge-runtime and standalone-start notices were retained.
- Repository-wide lint: 1,897 inputs, 2,454 errors and 19,141 warnings. Baseline: 1,890 inputs, 2,457 errors and 19,141 warnings. Strict diagnostic multiset comparison: zero added diagnostics, three removed historical errors in replaced app/dashboard/page.tsx. Seven new JS/TS inputs; no omitted baseline input. ESLint config SHA-256 remains 54cb3f18cb19a84da22b2a65420cec659db700cab6f7e00d2fa4a510489b2bb9. Historical lint debt remains; no exclusions, rule weakening or broad cleanup.
- Responsive/theme matrix: populated, empty, errors and loading at 375/390/430/768/1024/1280/1440 in both themes, 56 DOM layout checks plus representative screenshots. No document/main horizontal overflow. Long customer/project/track names and a USD 1,234,567,890.75 fixture were inspected. Nova geometry stayed below the scrolling main. Final CSS refinements were rechecked after rebuilding.
- Keyboard: mobile Sheet focus containment for 16 Tab steps, Escape dismissal, trigger focus return, scrollable navigation, named dialog, active route and hidden Nova during modal; account Escape/return; theme menus; skip-link activation focused main with a visible outline.
- Public/runtime and deployment results are recorded in the final delivery message after the commit/push; the report is not amended with a self-referential commit hash.

## Preservation and retained legacy

Before editing, SHA-256 hashes were captured for all 768 tracked files plus the three existing audits (771 total). Only five baseline files changed: app/dashboard/layout.tsx, app/dashboard/layout-client.tsx, app/dashboard/page.tsx, components/workspace/workspace-shell.tsx and lib/customer-navigation.ts. The other 766 baseline files were byte-identical, including every API/mutation/payment/auth/proxy/Supabase/schema/RLS/theme/global CSS/package/deployment file, all other customer bodies and all Admin bodies. No file was deleted.

The older components/dashboard/Header.tsx and Sidebar.tsx, components/client/ClientHeader.tsx and ClientSidebar.tsx, old --cmd and TailAdmin compatibility styles, and every template/demo dependency remain intact. They are candidates for a separately authorized usage audit, not deletion targets. UserNotificationBell and MusicSubmitForm/ServicePlanModal are intentionally retained operational controllers.

Known limits: authenticated visual/live-schema verification unavailable; invoice amount/total disagreement, missing customer project/invoice detail and Pay routes, music payment/fulfilment gaps, recovery ownership disagreement, notification localStorage scoping/custom-menu behavior and other historical issues remain unchanged. The Overview deliberately avoids misleading aggregates and unsupported workflows around these boundaries.

Recommended Phase 3: modernize the read-only Projects and Invoices bodies one at a time using this shell and shared state patterns, with explicit query scope/status/currency checks and safe authenticated fixtures. Consider notification presentation/accessibility in a separate preservation-tested slice. Do not mix file/music/recovery mutations, payment reconciliation, LMS/Marketplace/Creator capabilities or TailAdmin retirement into that phase. Phase 3 was not started.

## File inventory

Modified: app/dashboard/layout.tsx; app/dashboard/layout-client.tsx; app/dashboard/page.tsx; components/workspace/workspace-shell.tsx (export existing navigation primitive only); lib/customer-navigation.ts.

Added: app/styles/customer-workspace.css; components/workspace/customer-shell.tsx; components/workspace/customer-overview.tsx; components/workspace/customer-preview.tsx; lib/customer-overview.ts; lib/customer-overview.server.ts; app/design/command-center/customer/page.tsx; tests/workspace/customer-overview.test.mjs; docs/customer-workspace-phase2.md.
