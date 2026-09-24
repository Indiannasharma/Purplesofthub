# Account-Recovery Security Patch

**Scope:** account-recovery document storage, the public submission endpoint, the
authenticated administrator document path and internal notes.
**Date:** 2026-09-24

> **Status legend used throughout this document**

| Label | Meaning |
|---|---|
| **Implemented locally** | Code/migration exists in the working tree, type-checks, lints and is covered by tests. |
| **Tested in staging** | Executed against a non-production environment. |
| **Deployed to production** | Shipped and running in production. |
| **Independently verified in production** | Observed from outside the code base (SQL/curl/console). |
| **Pending manual action** | Requires a human with production credentials/authorisation. |

**Nothing in this patch is deployed to production, and no production database
change has been executed.** Source changes alone do not secure the live system:
the live bucket stays exactly as it is until Stage A (§8) is applied.

---

## 1. Repository baseline

| Item | Value |
|---|---|
| Repository root | `C:\Users\HP\Documents\Code\Softwork` (project: `purplesofthub/`) |
| Branch | `main` |
| Starting commit (HEAD) | `aca1359e61fcf1c27f50e7c8c1638ee22771a981` |
| Working tree at start | Clean except one pre-existing untracked file: `purplesofthub/PURPLESOFTHUB_PLATFORM_AUDIT.md` (preserved, untouched) |
| Deployment config | Vercel (`vercel.json`), no CI workflow |

---

## 2. Confirmed vulnerabilities (verified in source)

| # | Severity | Finding | Evidence |
|---|---|---|---|
| V1 | **Critical** | Recovery documents were stored in a **public** bucket and the endpoint persisted **full public URLs**. | `scripts/supabase-account-recovery-migration.sql:52-55` (`public = true`), `:63-67` (`Allow public reads` on `storage.objects`), `app/api/account-recovery/route.ts:79-82` and `:96-99` (`getPublicUrl`) |
| V2 | **Critical** | Object names were **guessable**: `id_<Date.now()>_<original filename>` / `screenshot_...`, with only non-alphanumerics replaced. | `app/api/account-recovery/route.ts:70, :88`; `app/admin/recovery/page.tsx:148, :165` |
| V3 | **Critical** | The **public** endpoint accepted and persisted the internal `admin_notes` field. | `app/api/account-recovery/route.ts:18` (read) → `:110` (insert) |
| V4 | **Critical** | The endpoint built a service-role Supabase client with an **empty cookie adapter**, so `auth.getUser()` could never reflect a real session; `created_by_admin_id` was not a trustworthy administrator identity. | `app/api/account-recovery/route.ts:33-52` (`getAll: () => []`), `:113` |
| V5 | **High** | **No server-side file validation** (no type allowlist, size ceiling, magic-byte check or attachment count) and no abuse controls (no rate limit, CAPTCHA or body limit). | `app/api/account-recovery/route.ts:68-101` |
| V6 | **High** | RLS allowed **anonymous INSERT of arbitrary rows** (including `admin_notes`) and let **any signed-in user read every recovery row**. | `scripts/supabase-account-recovery-table.sql:25-28` (`WITH CHECK (true)`), `:37-42` (`auth.uid() IS NOT NULL`) |
| V7 | **High** | Documents were uploaded with the **service-role** client from an unauthenticated request, so an upload was not attributable to any actor. | `app/api/account-recovery/route.ts:36-49, :71-76` |
| V8 | Medium | Database insert failures were swallowed (`catch { console.error }`) while the endpoint still returned `{ success: true }` — silent data loss, and a failed insert left **orphaned** documents in storage. | `app/api/account-recovery/route.ts:122-124, :180` |
| V9 | Medium | Public form field names (`firstName`, `lastName`, `appealMessage`) did not match the keys the route read (`first_name`, `appeal_message`), so those columns were always written as `NULL`; `full_name` (declared `NOT NULL` by the original DDL) was never written at all. | `app/services/social-media-management/account-recovery/page.tsx:600-611` vs `app/api/account-recovery/route.ts:14-18`; `scripts/supabase-account-recovery-table.sql:6` |
| V10 | Low | User-controlled values were interpolated into the staff notification e-mail HTML without escaping. | `app/api/account-recovery/route.ts:151-171` |

Confirmed not affected: no other bucket is referenced by recovery code, and the
public recovery page contains no document links.

---

## 3. Phase 0 — Production containment (**pending manual action**)

### 3.1 What was verified locally

* No PostgreSQL client (`psql`) is available on this machine.
* No Supabase Management API token is available.
* No explicit authorisation to mutate production was given.
* Therefore **the containment SQL was prepared but has not been executed**, and
  **no production containment is claimed.**

### 3.2 Containment SQL (to be run by an authorised operator)

The operation is shipped as a versioned migration
(`supabase/migrations/20260924000000_privatize_account_recovery_documents.sql`)
which is a superset of the minimum containment:

```sql
BEGIN;

UPDATE storage.buckets
SET public = false
WHERE id = 'account-recovery-documents';

DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

COMMIT;
```

The migration additionally emits a SQL `WARNING` for **any other**
`storage.objects` policy whose expression still mentions the recovery bucket, so
a differently named policy cannot silently keep the bucket public.

### 3.3 Manual Supabase Dashboard steps (alternative to SQL)

1. **Storage → `account-recovery-documents` → Settings**: turn **Public bucket**
   *off* and save.
2. **Storage → Policies** (bucket `account-recovery-documents`): delete every
   policy granting `SELECT`/`INSERT` to `public`, `anon` or `authenticated` — in
   particular `Allow public reads` and `Allow public uploads`.
3. **Storage → Policies → `storage.objects`**: search the policy list for any
   other policy whose expression mentions `account-recovery-documents`.
4. **Database → Policies → `account_recovery_requests`**: delete
   `Allow anonymous inserts` and `Allow users to read own submissions`.
5. **Database → SQL Editor**: run the migration file and read the notices.

### 3.4 Containment verification checklist

* `SELECT id, public FROM storage.buckets WHERE id = 'account-recovery-documents';` → `false`
* `SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';` → no row mentioning the bucket
* An anonymous request for a previously public object URL returns `400`/`404`, never `200`
* An anonymous `list` on the bucket fails
* No documents deleted; other buckets and their policies untouched

### 3.5 Preserving the fix

* `supabase/migrations/20260924000000_privatize_account_recovery_documents.sql`
  (new, versioned, transactional).
* `scripts/supabase-account-recovery-migration.sql` — the bucket insert now uses
  `false` with `ON CONFLICT (id) DO UPDATE SET public = false`, the two public
  storage policies were removed, and a security banner was added.
* `scripts/supabase-account-recovery-table.sql` — the anonymous `INSERT` policy
  and the `auth.uid() IS NOT NULL` read policy were replaced with a
  least-privilege set, plus a security banner.
* `scripts/README.md` — setup instructions now require verifying that the bucket
  is private and warn against re-adding public policies.

Historical SQL scripts must not be run wholesale against production.

---

## 4. Phase 1 — Public submission endpoint (implemented locally)

`app/api/account-recovery/route.ts` was rewritten:

* **No administrator session.** `createServerClient` / `cookies()` / the empty
  cookie adapter are gone; `created_by_admin_id` is explicitly `null`.
  Administrative creation moved to a separate guarded route (§6).
* **`admin_notes` removed from the public path.** The field is not read and not
  in the insert payload. Any submission containing an internal field
  (`admin_notes`, `status`, `created_by_admin_id`, `user_id`,
  `id_document_url`, `screenshot_url`, `assigned_to`, `approval_status`, …) is
  rejected with `400` instead of being ignored; unknown fields are rejected too.
* **Server-side schema.** `lib/recovery/requests.ts` normalises and validates
  every value (length caps, e-mail format, platform allowlist, bounded numeric
  amount, required fields, handle sanitisation) and accepts both the public
  camelCase names and the admin snake_case names.
* **File validation.** `lib/uploadPolicy.ts#validateRecoveryDocument` enforces
  JPEG/PNG/PDF only, max **5 MB** per file, max **2 attachments**, non-empty
  content, declared MIME in the allowlist **and** matching magic bytes. The
  storage extension is derived from the validated MIME type — never from the
  filename. Display names are sanitised and are metadata only.
* **Unpredictable paths.** `lib/recovery/documents.ts#newRecoveryDocumentPath`
  produces `recovery/{request-uuid}/{document-uuid}.{jpg|png|pdf}` with
  `crypto.randomUUID()`; no name, e-mail, handle, account id or timestamp.
* **Private upload, no URLs.** Uploads go to the private
  `account-recovery-documents` bucket via the service role; `getPublicUrl` is
  never called, no signed URL is generated, only the private object path is
  stored, and the response contains neither paths nor URLs.
* **Cleanup.** If an upload or the insert fails, the objects uploaded for that
  submission are removed (`removeRecoveryObjects`) and the caller gets a
  non-revealing error instead of a false success.
* **Abuse controls.** Declared body ceiling (`12 MB`), a rate limiter
  (`3 / hour`, keyed by a **salted SHA-256 of the client IP** —
  `deriveRecoveryRateLimitKey`, so raw IPs are neither stored nor logged),
  Turnstile verification through the existing `verifyCaptcha`, and
  `Cache-Control: no-store`.
* **Logging.** Identifiers and error messages only: no document contents, no raw
  IP, no e-mail/phone.
* **Notification e-mail** keeps staff context (no documents, no links) and now
  HTML-escapes every interpolated value (V10).

Compatibility fix (V9): the route accepts `fullName`/`firstName`/`lastName`/
`appealMessage`/`issueType` as well as the snake_case names, writes
`first_name`/`last_name` **and** `full_name`, and only drops a column from the
insert when PostgreSQL/PostgREST reports that the column genuinely does not exist
(`lib/recovery/persistence.ts#missingColumnFromError`).

**CAPTCHA caveat (pending manual action):** `components/TurnstileWidget.tsx` is a
stub that renders `null`, and neither `.env.local` nor `.env.production` defines
`TURNSTILE_SECRET_KEY`. The server-side check is wired and fails closed as soon
as the secret exists, so **do not enable the secret in production before the
widget is implemented** — otherwise legitimate submissions would be rejected.
Rate limiting is live whenever Upstash credentials are present (`.env.local` has
them; `.env.production` does not list them — verify the production environment).

---

## 5. Phase 2 — Administrator document access (implemented locally)

New route:
`GET /api/admin/recovery/[id]/documents/[documentId]/signed-url`

Order of operations, all server-side:

1. `requireAdmin()` (the existing helper in `lib/auth.ts`) — 401 for anonymous,
   403 for a signed-in non-admin.
2. The recovery record is loaded with the service-role client — 404 if missing.
3. `documentId` is validated against the fixed key allowlist
   (`id_document`, `screenshot`). The column is resolved through
   `RECOVERY_DOCUMENT_COLUMN_BY_KEY`; the browser can never supply a path.
4. The stored value is resolved by
   `parseRecoveryDocumentReference(value, NEXT_PUBLIC_SUPABASE_URL)`, which
   accepts only a bucket-relative object path or a public URL **for this
   project's recovery bucket**, and rejects external hosts, foreign buckets,
   signed URLs for other buckets, traversal and absolute paths.
5. `createSignedUrl(objectPath, 60)` — a **60-second** URL.
6. `Cache-Control: no-store`; the signed URL is never logged (only the recovery
   id, document key, actor id and whether the stored value was a legacy URL).

### Existing-document compatibility

* Historical rows contain
  `https://<project>.supabase.co/storage/v1/object/public/account-recovery-documents/<object>`
  (the shape `getPublicUrl` produced) or plain legacy object names such as
  `id_1699999999999_passport_jpg`.
* Both shapes resolve to a private object path server-side; the public URL is
  never reused or surfaced.
* The migration rewrites those columns to the canonical bucket-relative object
  path (`regexp_replace`, idempotent) so records converge on the private form
  while the objects and their history are preserved.
* Legacy public URLs are **not** offered as a fallback: after containment they
  return 400/404, and access continues through short-lived signed URLs.

**Remember:** a signed URL is a bearer credential. The 60-second expiry limits
*future* access; it does not undo any exposure that already happened (§7).

---

## 6. Phase 3 — Admin interface and internal notes (implemented locally)

### 6.1 Admin workspace (`app/admin/recovery/page.tsx`)

* Data layer moved off direct browser Supabase calls:
  * list ← `GET /api/admin/recovery/requests`
  * create ← `POST /api/admin/recovery/requests` (multipart, guarded)
  * status / notes ← `PATCH /api/admin/recovery/requests/[id]`
* Document buttons are now controlled actions: on click the page requests a
  short-lived signed URL and opens it immediately with
  `window.open(url, '_blank', 'noopener,noreferrer')`. Signed URLs are never
  written to component state, `localStorage` or the database, and no URLs are
  generated when the page loads.
* The browser no longer receives or renders storage paths: records carry
  `has_id_document` / `has_screenshot` flags only.
* Upload `accept` attributes and helper text now match what the server actually
  accepts (JPEG/PNG/PDF, 5 MB).
* The recovery-request workflow, filters, statuses and history are unchanged.

New guarded routes (`requireAdmin()` before any privileged access):

| Route | Purpose |
|---|---|
| `GET /api/admin/recovery/requests` | list (includes `admin_notes`), bounded to 500 rows, `no-store` |
| `POST /api/admin/recovery/requests` | administrative creation with internal notes and documents; sets `created_by_admin_id` from the verified session and `status` server-side |
| `PATCH /api/admin/recovery/requests/[id]` | the only mutation path for `status` and `admin_notes`; `id_document_url`, `screenshot_url`, `user_id`, `created_by_admin_id` are rejected |

### 6.2 Internal-notes authorisation

* `admin_notes` is written **only** by the guarded admin routes (service role)
  and is never accepted from the public endpoint.
* The migration replaces the over-broad read policy
  (`Allow users to read own submissions`, whose `auth.uid() IS NOT NULL` clause
  let any signed-in user read every row) with an exact own-row policy, and drops
  the anonymous `INSERT` policy.
* Table-level privileges are revoked from `anon` and `authenticated` and only a
  public column list is re-granted, so `admin_notes`, `id_document_url`,
  `screenshot_url` and `created_by_admin_id` cannot be read or written by a
  client session even if a future policy is added by mistake.
* The client dashboard (`app/dashboard/recovery/page.tsx`) now selects an
  explicit column list and no longer requests or displays `admin_notes`.
  (Deliberate behaviour change: internal notes are staff-only. If a
  client-visible note is ever wanted, it must be a separate column with its own
  policy rather than reusing `admin_notes`.)

---

## 7. Phase 4 — Existing-document exposure review (open)

**Treat every previously uploaded identity document as potentially exposed until
production is investigated.** No evidence of unauthorised retrieval exists, and
none is claimed.

Known:

* The bucket was created with `public = true` and a `SELECT` policy for the
  `public` role (`scripts/supabase-account-recovery-migration.sql:52-67`).
* Object names were derived from a millisecond timestamp plus the sanitised
  original filename (`id_<ms>_<name>`, `screenshot_<ms>_<name>`), so object
  names were guessable and could be enumerated with cheap brute force.
* URLs were stored in `id_document_url` / `screenshot_url` and rendered as
  clickable links in the admin workspace; the public bucket served them to
  anyone with the URL and no authentication.

Unknown / to be established by an operator with production access:

* How long the bucket was public and whether it was ever public in production at
  all (the migration script may not have been run there).
* The number of affected rows and objects, and their upload dates.
* Whether Supabase Storage access logs exist for the period and whether plain
  public object fetches are recorded at all — **public object downloads are not
  authenticated, so any log evidence is at best partial and cannot prove the
  absence of access**. Log retention, sampling and the absence of object-level
  request attribution all limit this analysis; treat an empty log as
  "cannot establish", not as "no access".
* Whether any search engine, proxy or cache indexed the object URLs.

Recommended actions (owner: operator with production access):

1. Inventory: count rows with non-null document columns, group by upload month,
   and list object names; export the list privately (do not paste identities into
   tickets/chat).
2. Preserve evidence: snapshot the bucket policy history and any available
   access logs before changing anything else. Do not delete objects or
   overwrite rows.
3. Establish the exact period of public exposure from deployment/migration
   history.
4. Assess notification duties under the applicable privacy/data-protection regime
   (e.g. NDPA 2023 / GDPR Art. 33–34 style analysis): identity documents are a
   high-risk category, so involve counsel and consider notifying affected
   individuals, plus the relevant supervisory authority, if unauthorised access
   cannot be ruled out.
5. Incident-response steps: rotate anything the documents could compromise
   (nothing derived from the bucket itself), force re-verification if fraud risk
   is plausible, review who had console access, and keep a decision log.
6. Re-run the §3.4 checklist and record the containment timestamp.

---

## 8. Phase 5 — Security regression tests

`npm test` (new script: `node --test "tests/**/*.test.mjs"`) runs 54 tests.
The repository had **no test framework and no test database**, so the suite mixes
three honest categories:

1. **Unit tests against real modules** (Node ≥ 22 native TypeScript type
   stripping — no new dependency):
   * `recovery-upload-policy.test.mjs` — allowlist (JPEG/PNG/PDF), 5 MB ceiling,
     2-attachment ceiling, empty files, unsupported declared types, **spoofed MIME
     types** (executable/HTML declared as image or PDF, PDF ⇄ PNG confusion),
     extension derived from MIME rather than filename, display-name sanitisation.
   * `recovery-request-schema.test.mjs` — valid submission normalisation,
     **`admin_notes` rejected in public mode** and accepted in admin mode, every
     server-owned field rejected, unknown fields rejected, required-field /
     platform / amount validation, length caps, camelCase + snake_case aliases.
   * `recovery-document-access.test.mjs` — generated paths are UUID-based,
     collision-free over 200 draws and free of client data; invalid input throws;
     only `id_document`/`screenshot` keys are accepted; canonical, legacy-flat and
     legacy-public-URL references resolve while external hosts, foreign buckets,
     other-bucket signed URLs, traversal, absolute paths, empty and oversized
     values are rejected; 60-second TTL; the rate-limit key is a salted hash that
     never contains the raw IP; admin records expose document flags but no storage
     locations.
   * `recovery-abuse-controls.test.mjs` — CAPTCHA fails closed when the token is
     missing, rejected or the call errors; verifies the Siteverify contract with a
     stubbed `fetch`; dormant (no outbound call) when no secret is configured.
2. **Source-level regression guards** (`recovery-static-guards.test.mjs`) — no
   `getPublicUrl` or public object URL anywhere in `app/`, `lib/`, `components/`
   (one documented exception: the legacy URL *parser*); the public route holds no
   admin session and writes no internal fields; every admin route calls
   `requireAdmin()` before the service-role client; the signed-URL route never
   reads a path, body or query parameter from the request; the admin page
   persists no signed URL and never touches storage directly; the client
   dashboard cannot read `admin_notes`; the migration makes the bucket private
   and drops the public/anonymous policies; the historical setup scripts cannot
   recreate the public bucket, the public policy, `WITH CHECK (true)` or
   `auth.uid() IS NOT NULL`; the bucket-name literal exists in exactly one module.
3. **Not covered** (no staging environment or test database was available): live
   RLS enforcement, real signed-URL expiry, real Turnstile round-trips, Upstash
   rate-limit behaviour and end-to-end uploads against Supabase. Those belong to
   Stage B with synthetic documents. The guards and unit tests are *regression*
   protection, not proof about the live system.

---

## 9. Phase 6 — Deployment plan (both stages pending manual action)

### Stage A — Immediate containment

1. Obtain explicit authorisation and confirm the target project ref is production.
2. Snapshot the current bucket setting and storage policies as evidence.
3. Apply `supabase/migrations/20260924000000_privatize_account_recovery_documents.sql`
   (or the Dashboard steps in §3.3).
4. Run the §3.4 checklist; record timestamp, environment, operator and output.
5. Until Stage B ships, the admin workspace's document buttons and the admin
   "New Request" upload still use the old client-side paths and will stop working
   once the bucket is private — ship Stage A and Stage B close together, or
   accept that limitation briefly.

### Stage B — Application security patch

1. Review and merge only this patch (no dashboard redesign, no RBAC expansion, no
   unrelated refactoring).
2. Run `npx tsc --noEmit`, targeted ESLint (§11), `npm test`, `npm run build`,
   `git diff --check`.
3. Deploy to staging and verify the whole workflow with **synthetic documents
   only** (never real identity documents): valid submission creates a row and a
   private object with no URL in the response; a submission carrying
   `admin_notes` returns 400 and persists nothing; admin list/notes/status/
   document viewing works; signed URLs expire at ~60 s; anonymous and non-admin
   requests return 401/403; an old public URL returns 400/404.
4. Deploy to production, record the deployed commit, repeat the verification with
   synthetic documents, then delete the synthetic data.
5. Do not deploy unrelated dashboard, service or pricing changes with this patch.

---

## 10. Files changed

| File | Change |
|---|---|
| `app/api/account-recovery/route.ts` | Public endpoint rewritten: no admin session, internal fields rejected, schema validation, file validation, private uploads with UUID paths, orphan cleanup, rate limit, CAPTCHA hook, non-revealing errors, escaped e-mail |
| `lib/recovery/requests.ts` | **new** — server-side submission schema/validation and internal-field rejection |
| `lib/recovery/documents.ts` | **new** — private bucket constants, UUID object paths, legacy reference parsing, 60 s TTL, salted rate-limit key |
| `lib/recovery/persistence.ts` | **new** — resilient insert (drops only genuinely missing columns) and orphan cleanup |
| `lib/recovery/records.ts` | **new** — admin record DTO (document flags, no storage locations) and status allowlist |
| `lib/uploadPolicy.ts` | Recovery allowlist, 5 MB / 2-attachment limits, `validateRecoveryDocument`, `sanitizeDisplayFileName` |
| `lib/rateLimit.ts` | `recovery` limiter (3/hour, prefix `rl:recovery`) |
| `app/api/admin/recovery/requests/route.ts` | **new** — guarded admin list + creation |
| `app/api/admin/recovery/requests/[id]/route.ts` | **new** — guarded admin status/notes mutation |
| `app/api/admin/recovery/[id]/documents/[documentId]/signed-url/route.ts` | **new** — guarded 60-second signed URL |
| `app/admin/recovery/page.tsx` | Guarded endpoints, controlled document viewing, no storage paths, upload copy/accept aligned |
| `app/dashboard/recovery/page.tsx` | Explicit column list; `admin_notes` no longer read or displayed |
| `app/services/social-media-management/account-recovery/page.tsx` | File `accept` attributes aligned with the server allowlist |
| `supabase/migrations/20260924000000_privatize_account_recovery_documents.sql` | **new** — bucket privacy, public policy removal, RLS/privilege hardening, legacy URL conversion, verification + rollback docs |
| `scripts/supabase-account-recovery-migration.sql` | Bucket created private, public storage policies removed, security banner |
| `scripts/supabase-account-recovery-table.sql` | Anonymous INSERT and over-broad read policies replaced, security banner |
| `scripts/README.md` | Private-bucket verification step and warnings |
| `package.json` | `test` script added |
| `tests/security/*.test.mjs` | **new** — five suites (54 tests) |
| `docs/security/ACCOUNT_RECOVERY_SECURITY_PATCH.md` | **new** — this document |

Not touched: `app/api/checkout/**`, payments, Nova, portfolio, styling systems,
other storage buckets, the admin shell/layout, and the audit report.

---

## 11. Local validation results (actually executed)

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | **Pass** — 0 errors (two `RecoveryRecordRow` typing errors found during the work were fixed, not suppressed) |
| Security tests | `npm test` → `node --test "tests/**/*.test.mjs"` | **Pass** — 54 tests, 54 pass, 0 fail |
| Production build | `npm run build` (Turbopack, after clearing `.next`) | **Pass** — `✓ Compiled successfully in 3.5min`, `Running TypeScript` with no errors, `✓ Generating static pages (179/179)`, route table includes `/api/account-recovery`, `/api/admin/recovery/requests`, `/api/admin/recovery/requests/[id]`, `/api/admin/recovery/[id]/documents/[documentId]/signed-url`, `.next/standalone/server.js` produced |
| Whitespace | `git diff --check` | **Pass** — exit 0, no whitespace errors |
| Targeted ESLint | `npx eslint app/api/admin/recovery lib/recovery lib/uploadPolicy.ts lib/rateLimit.ts tests app/services/social-media-management/account-recovery/page.tsx` | **Pass** — 0 problems in every new/modified module and test file; the only message is a pre-existing `react/no-unescaped-entities` error in the untouched `Driver's License` copy of the public service page |
| Targeted ESLint (pages) | `npx eslint app/api/account-recovery/route.ts app/admin/recovery/page.tsx app/dashboard/recovery/page.tsx` | Same or fewer problems than the pre-patch baseline (no new rule violations) |
| Broader scoped ESLint | `npx eslint app lib components tests` | 280 pre-existing problems in 189 legacy files (204 errors, 76 warnings) — **none attributed to any file added or modified by this patch** (verified by filtering the report for the new paths) |

Baseline comparison for the three pre-existing files (identical ESLint config,
`HEAD` versions copied into a scratch directory):

| File | Baseline | After patch |
|---|---|---|
| `app/api/account-recovery/route.ts` | 4 warnings (`cookieStore`, `adminError`, `uploadData` ×2 unused) + 1 error (`no-explicit-any`) | 0 problems |
| `app/admin/recovery/page.tsx` | unused `Link` (pre-existing), `loadRequests` "accessed before declared" (pre-existing), 7 × `no-explicit-any` | unchanged pre-existing items, 7 × `no-explicit-any` |
| `app/dashboard/recovery/page.tsx` | `loadRequests` "accessed before declared", `react/no-unescaped-entities` | unchanged pre-existing items |

Two notes on honesty:

* The `loadRequests`/`no-explicit-any`/`no-unescaped-entities` findings are
  **pre-existing** in files whose surrounding code this patch did not rewrite;
  they were left alone rather than "fixed" as part of an unrelated refactor.
* Full-repo `npm run lint` was not used as the gate: the ESLint config does not
  ignore `.claude/worktrees/**`, so it also lints an entire second copy of the
  project (very slow) — a pre-existing configuration gap, unrelated to this
  patch.

---

---

## 12. Release record (2026-09-24) — committed, pushed and observed in production

| Item | Value |
|---|---|
| Branch / remote | `main` → `origin` `https://github.com/Indiannasharma/Purplesofthub.git` |
| Starting HEAD | `aca1359e61fcf1c27f50e7c8c1638ee22771a981` (origin/main identical, no divergence) |
| Security patch commit | `298adc4e45b5fb20b3b28bf00fe62831ce1b1e83` — *fix(security): privatize account recovery documents and harden recovery APIs* (24 files, +3181/−337) |
| Follow-up fix commit | `b225c2d9f0d1117cfd51d0be9ddfe7b6cd54c259` — *fix(security): keep recovery submissions working when the rate limiter is unavailable* (3 files, +71/−11) |
| Push result | `aca1359e..298adc4e main -> main`, then `298adc4e..b225c2d9 main -> main` (fast-forward, no force) |
| Remote main after push | `b225c2d9f0d1117cfd51d0be9ddfe7b6cd54c259` |
| Vercel project | existing project `purplesofthub` (`prj_DQ7c9LYOt8mMfKsw064zPE07Fcz8`, org `team_eXhF9XLaeGODdjva6cZdQbQP`); no new project created |
| Production Supabase project | `japscxueoenflsucqtry.supabase.co` (discovered from the deployed client bundle; the local `.env*` files contain placeholders and are gitignored) |
| Vercel deployment ID / status | **NOT VERIFIED** — the Vercel CLI is not authenticated in this workspace and no `VERCEL_TOKEN` is available, so deployment metadata could not be read |

### Why the follow-up fix was required

Post-deploy, the public endpoint returned a bare `500` for every request. Probing
the unmodified `/api/chat` (same `checkRateLimit` helper, wrapped in its own
try/catch) returned its graceful 500, proving the **Upstash rate-limit backend is
failing in production** and that the missing error guard in the new route turned
that into an unhandled 500. The helper now fails **open** (logged) and the route
has an outer try/catch, so a dependency outage can no longer take the recovery
form down. Verified after redeploy: `/api/chat` returns `400 {"error":"Messages
are required"}` instead of `500` (a pre-existing breakage fixed), and
`POST /api/account-recovery` with a JSON body returns `400` instead of `500`.

### Production observations (unauthenticated, read-only, from this workspace)

| Probe | Result |
|---|---|
| `GET https://www.purplesofthub.com/` | `200` |
| `GET https://purplesofthub.vercel.app/` | `200` |
| `GET /api/admin/recovery/requests` | **`401`** (new guarded route deployed, unauthenticated) |
| `GET /api/admin/recovery/{uuid}/documents/id_document/signed-url` | **`401`** |
| `PATCH /api/admin/recovery/requests/{uuid}` | **`401`** |
| `POST /api/account-recovery` with `admin_notes` | **`400`** `{"error":"This submission contains a field that is not accepted."}` — nothing persisted |
| `POST /api/account-recovery` with a `.txt` attachment | **`415`** `{"error":"Unsupported file type. Upload a JPG, PNG or PDF."}` — nothing persisted |
| Anonymous fetch of a recovery object (public and authenticated object routes) | **`404 {"error":"Bucket not found","code":"NoSuchBucket"}`** — anonymous document retrieval fails |
| Anonymous `POST /storage/v1/object/list/account-recovery-documents` | `200 []` (RLS-filtered; no object names or contents returned) |
| Anonymous `GET /rest/v1/account_recovery_requests` | `500 42P17` (see §14) |
| `GET /api/contact` (empty body) | `400 {"error":"Name, email and message are required"}` — application healthy |

**Containment status:** anonymous access to recovery documents is verified to
fail in production. Whether the underlying bucket exists and is flagged private,
or does not exist at all in this project, **could not be determined without
credentials** (no public bucket exists in the project to serve as a comparison
baseline; every probed bucket name returns `NoSuchBucket` anonymously). No
production database or storage mutation was performed by this release.

### Open production defects discovered during verification (pre-existing, not caused by this release)

| # | Defect | Evidence | Owner action |
|---|---|---|---|
| D1 | `42P17 infinite recursion detected in policy for relation "profiles"`. Session-scoped reads of `account_recovery_requests`/`profiles` fail, and the recovery INSERT fails after ~6s (most likely the `notify_admin_on_recovery` trigger resolving the admin id through the recursive `profiles` policies). | anonymous `GET /rest/v1/account_recovery_requests` → `500 42P17`; `GET /rest/v1/profiles` → `500 42P17`; `POST /api/account-recovery` with valid fields and no attachment → `500 {"error":"We could not save your request…"}` after ~6s | **Requires production DB access and explicit authorisation.** Replace the self-referential admin policies on `profiles` (e.g. `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`, `lib/supabase/schema.sql:117`) with a `SECURITY DEFINER` helper such as `public.is_admin()`, then re-run the §3.4 checks. Not executed here. |
| D2 | The Upstash rate-limit backend is unreachable/misconfigured in production. | `/api/chat` returned its 500 catch before the fix; the new recovery route returned bare 500s until the guard was added | Mitigated fail-open in code (this release); still verify the Upstash credentials in Vercel. |
| D3 | Recovery document upload fails: `POST` with a valid synthetic PNG → Cloudflare `error code: 502` after ~5.5s (origin failed during the storage upload), while the same request without an attachment reaches the database step and returns our JSON error. | 3/3 identical 502s; `.txt` and `admin_notes` requests behave correctly (415/400) | **Requires Vercel function logs + Supabase dashboard access.** Confirm the bucket exists, confirm `SUPABASE_SERVICE_ROLE_KEY` in Vercel belongs to `japscxueoenflsucqtry`, then re-test with the synthetic PNG. |
| D4 | The endpoint now reports honest failures where it previously returned a false `{"success":true}` while silently discarding the submission. | Behavioural change introduced deliberately (V8) | Not a defect; it means the recovery form is *visibly* broken while D1/D3 remain unfixed. |

**Side effects of verification:** no synthetic recovery rows were persisted (every
insert failed). At most two 135-byte synthetic PNG objects could exist under
`recovery/<uuid>/` if an upload partially completed before the 502 — the operator
should check and delete them. No real identity document was used, downloaded or
exposed during verification.

---

## 13. Remaining risks and pending manual actions

**Pending manual action (production):**

1. Obtain credentialed confirmation of the storage configuration: anonymous
   document retrieval is verified to fail, but whether
   `account-recovery-documents` exists and is flagged private (versus not
   existing at all) could not be established without Supabase access. If the
   bucket does exist, apply §3.2/§3.3 only after that confirmation and after
   taking the §7 evidence snapshot.
2. Fix D1 (profiles RLS recursion) and D3 (document upload 502) with explicit
   authorisation, then re-run the whole recovery workflow in production with
   synthetic documents.
3. Complete the §7 exposure inventory, evidence preservation and privacy
   assessment (notification duties, counsel involvement).
4. Decide on `full_name NOT NULL` schema drift: the new insert supplies
   `full_name`, and `lib/recovery/persistence.ts` will drop it only if the column
   is absent. If production reports a `NOT NULL` violation on any other column,
   capture the exact error from logs before changing the schema.
5. Complete `components/TurnstileWidget.tsx` before enabling
   `TURNSTILE_SECRET_KEY`, then re-test the public submission path.
6. Confirm Upstash (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) is
   configured in production; without it the rate limiter is dormant and only the
   body-size ceiling, CAPTCHA (when enabled) and validation protect the endpoint.
7. Reconcile the fragmented RLS/schema history (the audit's Phase 0/5 item): the
   migration reports leftover policies, but production policy state remains
   unverified until an operator runs the V1–V7 queries.
8. Re-run the removal of any public object URL still present in third-party
   caches/search indexes shows up in monitoring; nothing in this patch can recall
   a URL that was already fetched.

**Accepted limitations of this patch:**

* Signed URLs are bearer credentials; the 60-second TTL limits later access but
  does not remediate earlier exposure.
* No malware scanning is performed on uploaded documents (out of scope; consider
  a scanning service before rendering documents inline).
* `app/api/admin/recovery/requests` caps the list at 500 rows; older records are
  not paginated yet.
* PDFs remain permitted because scanned IDs are commonly PDFs; if the product
  decides PDFs are unnecessary, removing `application/pdf` from
  `RECOVERY_DOCUMENT_MIME_TYPES` is the single change required.
* Pre-existing lint/CI gaps are unchanged and outside this patch: full-repo
  `npm run lint` also lints the `.claude/worktrees/**` copy of the project (very
  slow) and the repo still has no CI type/lint/test/build gate.
