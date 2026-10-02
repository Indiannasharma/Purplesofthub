# Customer Workspace Phase 3

Scope: /dashboard/projects and /dashboard/invoices bodies only. Starting main and fetched origin/main were a24adfc380d695c9f346f605f7035e94ebdb55c5. The three untracked audits remain preserved. The existing master audit, Phase 1 foundation and Phase 2 report informed the work; the master audit's customer/payment/conflict sections were revisited alongside actual source.

## Architecture

The Phase 2 customer shell, identity adapter, auth layout, notification controller, navigation, mobile Sheet, account controls, themes and Nova lane are unchanged. Both route pages retain their existing createClient/auth.getUser/error-or-no-user redirect('/sign-in') gates. Their Suspense boundaries begin after authentication. Each server page reads only the current customer's records and passes safe presentation fields to its body. Projects has a small client component for local exact-status filtering; Invoices is now a server-safe pure view and does not import the regional CurrencyContext/converter. No client read waterfall or mutation is introduced.

Reuse: WorkspacePage, WorkspacePageHeader, WorkspaceButton, WorkspaceField/Select, shared loading/empty/error states, WorkspaceStatusBadge, Phase 2 invoiceAmount/overviewDate/projectProgress and the existing CustomerShell. CustomerRecordStatus extracts the exact existing Overview tone treatment into one reusable component; Overview composition is otherwise unchanged. Blank string amounts are now unavailable instead of becoming numeric zero. No pricing, settlement or calculation helper is changed.

New customer-records.css styles only the adopted body classes. Customer viewport/scroll ownership, global CSS, --cc/--cmd values and other module bodies remain intact. Comfortable cards work at desktop and mobile; there is no wide table, chart, decorative KPI or entire clickable card.

## Exact reads and ownership

| Domain | Selected fields | Ownership / ordering |
| --- | --- | --- |
| projects | id, title, description, service_type, status, progress, due_date, created_at; project_updates(id, message, created_at) | projects.client_id = verified user.id; created_at descending |
| invoices | id, amount, currency, status, due_date, created_at; projects(title) | invoices.client_id = verified user.id; embedded projects.client_id = verified user.id; created_at descending |

The existing session-scoped SSR client and customer RLS remain the authority. No service-role read, role-dependent dashboard aggregator, ownership change or schema migration is introduced. The extra embedded project predicate protects the relationship title too; it is a left embedding, not !inner, so a missing/inaccessible/unrelated project does not erase the owned invoice. This matches the documented [PostgREST embedded-filter behavior](https://docs.postgrest.org/en/v13/references/api/resource_embedding.html#top-level-filtering). Both object and array relationship response shapes are handled explicitly. Tests record exact filters/columns/order; they are not a claim of live RLS certification.

Both existing list reads had no application pagination or limit; that scope is preserved and remains subject to Supabase's configured row cap. Filter counts explicitly say loaded projects, not account-wide totals. Server reads are scoped first, then the already-owned project results may be filtered locally. No other customer's table is fetched for client filtering. No N+1 read is added. Pagination and exhaustive account totals require later separately validated work.

Projects replaces wildcard/internal-field retrieval with explicit customer fields. It retains descriptions, due dates and customer project update messages. The preview chooses the most recent valid-dated nonempty message from a copy of the returned updates; it no longer claims an unordered first message is the latest. Task counts and unqualified NGN budgets are omitted from customer presentation; task/update/budget persistence and staff workflows remain untouched. Legacy SQL does not define all current due_date/update relationship fields used by the existing pages/Admin; live schema compatibility is not guessed. Missing schema produces an honest error/unavailable state rather than fake records.

## Status, progress and filters

Project SQL vocabulary: pending, in_progress, completed, cancelled. Existing customer/Admin form additionally use on_hold; the legacy Admin list also uses active although that is absent from the SQL check constraint. No authority is inferred from those discrepancies. The optional native Project status selector appears only when loaded results contain multiple distinct statuses and filters exact stored values, including unknown/missing values. There is no broad Active bucket, new persisted category or search box without demonstrated volume.

Invoice SQL vocabulary: pending, paid, overdue, cancelled. Admin form uses draft and the send API writes sent. All recorded statuses are displayed through the same badge treatment as Overview, including unknown values in a neutral tone. Overdue is never inferred from the date; no status is redefined. Valid progress 0–100 is displayed with accessible progressbar values. Missing/invalid progress is unavailable, not clamped or fabricated. Dates use the Phase 2 UTC formatter and explicit created/issued/due labels, with missing/invalid values explained; created is never renamed started.

## Invoice amount versus total investigation

| Source | Observed semantics |
| --- | --- |
| lib/supabase/schema.sql | amount DECIMAL(10,2) NOT NULL; default currency USD; serial id. No total, subtotal, items or invoice_number column is defined here. |
| app/api/admin/invoices/route.ts POST | Writes numeric amount, currency (USD default), client/project, status and due_date. buildInvoiceNumber exists but is unused. |
| app/admin/invoices/new/page.tsx | Calculates each quantity × unit_price, sums item.total to subtotal, sets total = subtotal, and writes items/subtotal/total without amount. No tax calculation. Currency defaults NGN. Draft/send paths begin with draft/pending. Live defaults/generated amount behavior is unknown. |
| app/api/admin/invoices/[id]/route.ts PUT | Updates amount, currency, status, due_date, paid_at; does not reconcile total. |
| app/api/dashboard/create-project/route.ts | After verified canonical checkout, inserts paid invoice with amount = resolvedAmount and verified settlement currency. |
| universal/meta-ads checkout | Primarily create subscriptions; invoice fulfilment is a separate conditional create-project path, not one universal financial ledger. |
| Paystack initialize/verify | Reads amount/currency, verifies owner and payment amount/currency, and updates paid state. No total fallback. |
| invoice send API | Uses invoice.amount/currency in email and writes sent; default email payment link points to a missing customer detail route. |
| previous customer InvoicesClient | Read amount, converted it using regional fixed rates into selected display currency, summed mixed invoices, assumed NGN for missing currency and rendered numeric zero as Custom through the pricing formatter. |
| Phase 2 Overview | Displays amount in the recorded native currency, preserves zero, and treats missing values as unavailable. |

Conclusion: repository source does not establish a universally authoritative reconciled field. Phase 3 preserves amount as the customer-visible field because the previous customer read, SQL, API, checkout and Paystack consumers use it. It does not choose total, reconstruct line items, mutate records or change calculations. The display is labelled Recorded amount, never Total. Regional conversion/mixed totals are removed from this body to meet the explicit native-currency requirement and match Overview; settlement and pricing remain unchanged. USD/NGN/GBP/CAD and other valid recorded currency codes remain separate. Actual zero is zero; absent/blank/invalid amounts and absent/invalid currency are unavailable.

The list identifies invoices by their actual complete id under Invoice reference. It does not invent invoice_number from an id or select an optional column not established by the base schema/writers. Overview's existing invoice_number read is preserved; any deployment discrepancy remains documented live-schema work. No missing field is silently reconciled.

## Actions and routes

There is no app/dashboard/projects/[id]/page.tsx or app/dashboard/invoices/[id]/page.tsx. Customer download/PDF functionality is absent. Paystack invoice initialization/verification endpoints exist but the customer has no connected reachable Pay flow. The Admin email's /dashboard/invoices/{id} destination is unresolved. Phase 3 does not add View, Download or Pay buttons and does not repair those systems. Real Explore services, Overview and existing WhatsApp/Nova assistance remain available.

## States and accessibility

Successful empty reads render No projects yet / No invoices yet with useful guidance. Query failures are alerts, not zero records. Failed, unavailable and unauthorized reads are distinct, and raw backend errors are not exposed. Shared loading carries aria-busy. A native labelled status selector supports keyboard selection, with a polite loaded-result announcement. Headings, article/list semantics, date definition lists and text status labels support readable cards; status is not color-only. Existing skip link, focus rules, reduced motion, account/Sheet semantics and Nova support lane are reused.

## Validation and QA

TypeScript passed. Changed-file ESLint passed for all 13 changed/new code files with zero errors and zero warnings. All 87 regression tests passed, including 13 new records tests. The production build passed and generated 146 pages. Full repository ESLint measured 2,453 errors and 19,141 warnings against the verified Phase 2 baseline of 2,454 errors and 19,141 warnings. A normalized diagnostic multiset comparison found zero added diagnostics and one removed historical project no-explicit-any error. No baseline files were omitted and the ESLint configuration hash is unchanged. git diff --check passed.

Compiled synthetic visual QA covered 168 combinations: Projects/Invoices, populated/empty/failed/unavailable/unauthorized/loading, widths 375/390/430/768/1024/1280/1440, and light/dark. DOM geometry checks found no main/document horizontal overflow, no records outside the main horizontal bounds, and no Nova launcher overlap. Representative desktop/mobile screenshots were visually inspected; long references and values, missing fields and zero/full progress wrapped correctly. Exact completed-status filtering worked. Mobile Sheet focus stayed contained through 16 Tab steps in each theme; Escape returned focus to its trigger. The skip link focused customer-main. These are synthetic presentation checks, not live customer/RLS verification.

Both actual local protected pages redirected the available browser session to sign-in. No safe authenticated session was available, so authenticated customer/production visual QA and live-schema/RLS verification remain unperformed. No test customer or production records were created or modified. Anonymous compiled smoke checks returned 200 for home/sign-in/Academy/Services, 307 to sign-in for ten existing customer routes and Admin, and 404 for the fixture with the process-only preview flag disabled.

The /design/command-center/customer-records fixture inherits the existing noindex/nofollow metadata and production-disabled parent guard. Its synthetic data is labelled, imported only by that isolated preview, uses no production adapter and never mounts the notification controller with a fictitious user. The local preview environment flag is process-only, never written to environment/deployment config. Fixtures exercise long project/service/reference/status text, 0/100/invalid/missing progress, four currencies, large values and missing optional fields. The compiled production-disabled fixture returned 404 before commit.

Local Next docs directory is absent in this installed package. Existing conventions and official [Server/Client component](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [loading/Suspense](https://nextjs.org/docs/app/api-reference/file-conventions/loading) documentation were used as fallback. No dependency or framework configuration change.

## Preservation and next phase

Before editing, SHA-256 hashes were captured for 777 tracked files and three audits (780 files). Final hashes confirmed only the five intended existing files changed; 775 baseline files remained byte-identical, including all three unrelated audits. No baseline files were deleted. High-risk auth/payment/mutation/API/schema/RLS files, Phase 2 shell/navigation, Admin and other customer bodies are unchanged. Legacy components, TailAdmin and compatibility CSS remain retained.

Known gaps: amount/total and schema drift, missing detail/PDF/Pay capability, loaded-list pagination cap, existing checkout/idempotency/fulfilment issues and authenticated visual verification. These require distinct functional work; presentation does not resolve them.

Recommended Phase 4: one preservation-scoped customer module at a time, beginning with Files presentation around its existing upload/delete controller and private access contracts. Secure authenticated QA should precede expanding scope. Keep commerce/payment reconciliation, LMS/Marketplace/Creator capabilities, Admin modernization and TailAdmin retirement separate. Phase 4 is not started.

## File inventory

Modified: app/dashboard/projects/page.tsx; app/dashboard/invoices/page.tsx; app/dashboard/invoices/InvoicesClient.tsx; components/workspace/customer-overview.tsx (shared status extraction only); lib/customer-overview.ts (blank-string amount unavailable only).

Added: app/styles/customer-records.css; lib/customer-records.ts; lib/customer-records.server.ts; components/workspace/customer-record-status.tsx; components/workspace/customer-record-states.tsx; components/workspace/customer-projects.tsx; components/workspace/customer-records-preview.tsx; app/design/command-center/customer-records/page.tsx; tests/workspace/customer-records.test.mjs; docs/customer-workspace-phase3.md.
