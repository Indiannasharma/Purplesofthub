# Portfolio database repair — reviewed SQL handoff, execution pending

> Historical preparation report. The owner subsequently confirmed execution and seven empty
> secured tables. **Do not rerun the migration.** See `portfolio-production-restoration.md`
> for current integration, validation and release evidence; older pending instructions below
> describe the state at preparation time.

Date: 2026-10-15. Branch: main. Starting HEAD/origin/main:
`f4a2842934c4808a9c17c50da6543af2108657ea`.

## Confirmed findings

- The owner previously obtained NULL for `to_regclass('public.portfolio_projects')`.
- The owner subsequently supplied independent live inspection confirming a healthy
  intended project, no `public.portfolio_*` tables and one existing newsletter record.
  Those findings are accepted; the broad investigation has not been repeated.
- Current local Supabase URL matches owner-confirmed project `japscxueoenflsucqtry`.
  Server credentials are present; no values were printed or changed.
- Read-only service-role REST HEAD probes returned 404 for projects, categories,
  industries, services, clients, testimonials, media_library and portfolio_resources.
  API unavailability alone cannot establish physical absence or schema-cache state.
- The previous setup script created testimonials before the referenced projects table.
  Its policy creation was not rerunnable, allowed editor writes, exposed every testimonial
  and media-library row publicly, and had no surrounding transaction.
- The current admin form submits `final_solution` and `videos`, absent from that SQL.
  The services update helper also writes `updated_at`, absent from its old definition.
- Browser and server Portfolio clients use session/anon Supabase access, not service keys.
  API POST/PUT/archive require `requireAdmin()` before writes; direct browser reads rely on RLS.
- Uploads use the existing authenticated Cloudinary endpoint and admin-only Portfolio purposes.
  No new Supabase storage bucket or storage policy is necessary.

## Prepared files — NOT executed

1. `supabase/portfolio-preflight.sql`: one JSON report with cross-schema relations,
   exact record counts, columns, constraints/incoming FKs, indexes, policies, grants,
   admin helper definitions, profile protection and relevant storage metadata/policies.
   No row values or object filenames are returned. Exact counts may take time on large tables.
2. `supabase/migrations/20261015000000_restore_portfolio.sql`: reviewed guarded handoff.
3. `SUPABASE_PORTFOLIO_SETUP.sql`: identical convenience copy of that migration.
4. `supabase/portfolio-postflight.sql`: read-only metadata, privilege and anonymous-read checks.
5. `docs/portfolio-supabase-handoff.md`: exact execution request for the working ChatGPT integration.

The migration creates projects first; categories, industries, services and clients next;
testimonials then reference projects. The projects-to-clients FK is added after both exist.
UUID primary keys, unique slugs, category/industry/service unique names, status/rating checks,
query indexes and existing content/media JSON fields follow the actual source contracts.
No seed projects, testimonials, categories or other data are inserted.

RLS permits public published projects and testimonials/clients attached to published projects.
Taxonomy reads are public. Media-library metadata is admin-only. Session writes require the
existing admin helper, with both USING and WITH CHECK. Existing helper and profile protection
must be inspected in the preflight; this script does not redefine them.

Unknown existing tables, alternate-schema copies and unexpected policy names abort the entire
transaction. Objects created by this migration have a marker so unchanged reruns are supported.
Reruns also check the 126 required column types, primary keys, unique slugs and policy command/type.
Known policy roles/predicates are reapplied with ALTER POLICY; names alone are not trusted.
The existing admin helper's body, stable/security-definer properties, empty search path and
authenticated execute permission must match the previously verified admin-only definition.
Unexpected helper definitions abort rather than modifying authentication. The deferred client
FK is checked for its exact source/target columns and SET NULL behavior. Media uploader FK has
an index. These are static checks until actually executed in PostgreSQL.
This is deliberately not a blind reconciliation of legacy tables: existing data requires review
before an additive repair is designed. The marker is not a substitute for schema/policy drift
inspection. No existing rows, buckets, auth functions or unrelated tables are modified.

`portfolio_resources` is inventoried but not created: its current admin UI uses localStorage,
not a database query. No new extensions or timestamp functions are required; UUID generation
is provided by the platform and existing write helpers already set timestamps.

## Execution handoff

Open Supabase project `japscxueoenflsucqtry`, SQL Editor. Paste the **entire**
`supabase/portfolio-preflight.sql` file and Run. Return its `portfolio_preflight` JSON result.
Also confirm Settings > Data API > Exposed schemas includes `public`; a NULL SQL session
setting does not establish that configuration.

Review the preflight output and obtain explicit owner approval before applying the migration.
Supabase SQL/migration tools were checked once for this request and are still not exposed in
this Codex session. Use the prepared handoff through the working connected ChatGPT integration.
The local DATABASE_URL is not this Supabase project and must not be used as an alternative.
No SQL was applied, no database records were created, and no test project was authorized.

The workspace `public.projects` relation is independent: its source schema has customer/profile
references and workspace lifecycle statuses. No migration statement references or alters it;
Portfolio uses the distinct UUID-backed `public.portfolio_projects` and `portfolio_clients`.
There is no cross-FK, data copy, rename or status conversion. Actual workspace rows were not read.

## Application work deferred until schema verification

- Homepage `app/page.tsx` passes bundled PORTFOLIO_PROJECTS only; it needs an isolated
  published/featured database load with retained fallback once the backend is verified.
- The normalizer reads `finalSolution`/`solution`, while the form persists `final_solution`.
  Case-study authored-content aliases have the same mismatch. Correct together after preflight.
- Detail lookup falls back to a bundled slug when the published query returns null. A draft
  overriding a bundled slug must not accidentally reveal its fallback; verify this explicitly.
- Listing fallback and HomePortfolio currently filter archived rather than strictly published
  for supplied local data. Database reads already request published; regression tests must cover both.
- Testimonials have data helpers but the visible section uses its own content; verify actual
  component wiring before claiming database testimonials work.
- No client/project data has been migrated from bundled examples. No production CRUD performed.

## Validation and release status

Only SQL/documentation and focused static SQL contract tests changed. Nine tests passed, checking source
contracts and safety structure; they do not execute PostgreSQL or establish real RLS behavior.
No TypeScript/TSX application file changed. Remaining validation results are recorded below
after completion; source contract tests do not substitute for live database/security verification.

Latest validation for the reviewed handoff:

- Nine focused Portfolio SQL contract tests: passed.
- TypeScript (`tsc --noEmit --incremental false`): passed.
- Changed-file ESLint (`tests/portfolio/schema.test.mjs`): passed.
- Tracked Git diff check and whitespace checks across all seven intended files: passed.
- Targeted credential-pattern scan of those files: no matches.
- One `npm run build` attempt: did not complete. Next.js 16.1.6 remained at
  `Creating an optimized production build`; build diagnostics continued to show `compile`
  after more than nine minutes, without a compiler error or success. The verified owned
  build process was nearly idle, so it was stopped. Command exited 1 after cancellation.
  This is an incomplete validation, not an identified code error or a successful build.
  No second build or browser session was started; the user's development server was not stopped.
- No PostgreSQL execution, actual RLS/CRUD tests or live Portfolio restoration verified.

The complete migration is 23,575 UTF-8 bytes; SHA-256:
`2e3856716c16d85a8685fd39bdcde9cf4477c9b42365cd8862b02befbb0b4cac`.
Its root setup copy is identical. Use the complete file as the deliverable, not a partial snippet.

Real availability, grants/RLS, admin CRUD, unpublished access, media, featured homepage and
browser verification remain pending. No commit, push or deployment is authorized by the release
gate until the migration is applied and critical checks pass. Unrelated audits/QA remain intact.
