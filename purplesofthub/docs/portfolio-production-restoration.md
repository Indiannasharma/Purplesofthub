# Portfolio integration and production restoration

Date: 2026-10-15. Branch: `main`. Starting HEAD/origin/main:
`f4a2842934c4808a9c17c50da6543af2108657ea`.

## Database status and evidence

The owner confirmed the reviewed migration was executed independently in project
`japscxueoenflsucqtry`. All seven tables exist, RLS is enabled, anonymous writes are
denied, projects require published status for public reads, and clients/testimonials
require published parents. Admin policies use the existing protected `is_blog_admin()`.
The newsletter count remained one. This task did not rerun SQL or change any records.

Actual anonymous HTTP checks against that project returned 200/empty arrays for projects,
categories, industries, services, clients and testimonials. Anonymous media-library read
returned 401/42501. Server-only REST HEAD checks requesting every required column confirmed
all 126 columns across the seven tables are exposed, with zero records in each table.
No record values or credentials were logged. The local URL matches the intended project.
Production Vercel metadata confirms the existing URL, anon and server-role variables are
present for Production; no values were displayed or changed.

Production before this release: `/api/portfolio`, its featured filter and search requests
returned 200 `{data:[],count:0}`. Anonymous POST, PUT and DELETE each returned 401. The admin
page redirected to `/sign-in`. `/api/newsletter` remained 200 `{available:true}`.

## Targeted application changes

- Homepage and public listing now share a server-rendered, database-first published catalog.
  The listing's existing client design/filter controls moved intact to PortfolioListing.
  Both layouts retain the approved bundled projects while the restored database is empty.
- A server-only, bounded replacement check selects **only bundled slugs**, using the existing
  server credential. It never selects or returns private project content, IDs or status.
  Any database replacement suppresses the corresponding old bundled fallback, so an
  unpublished record cannot resurrect its older case study. Missing credentials or lookup
  failure fail closed for fallback. React cache deduplicates this per render; no shared
  cross-user cache is introduced. Actual published reads still use the existing session
  client and explicit published filter. No auth, schema or RLS changes were made.
- Normalization and authored-content detection now recognize `final_solution`, matching the
  current form's persisted story. Public cards filter strictly to published content.
- API pagination is bounded/validated and search cannot supply PostgREST OR syntax.
  Admin payloads validate title, slug, status, featured, client ID and cover URL.
  Status-only updates preserve slugs. Missing update/archive targets return 404; duplicate
  slugs return 409 without database details. Existing admin authorization runs before writes.
- Form saves prevent duplicate clicks and recover from network/HTTP errors. New projects
  default to draft; explicit draft/published/archived selection and existing custom categories
  are preserved. Failed archive requests no longer remove a row from the UI. Missing/error
  edit reads no longer present an empty editable project.
- Industry/service/client fields not exposed by the small existing editor remain untouched
  on updates. Taxonomy helpers and Cloudinary integration are preserved. No new taxonomy
  records, fake projects, testimonials, uploads or subscriber records were created.

## Validation

- 20 focused tests pass: SQL contracts; actual route functions with an in-memory Supabase
  fixture; 401/403 authorization; published/featured/empty/error behavior; create/edit/
  publish/unpublish/archive; duplicate slugs; input/media validation; story normalization;
  private replacement suppression; SSR homepage and admin-form rendering.
- Independent TypeScript passed. Changed-file ESLint passed with no errors and one existing
  `HomePortfolio.tsx` plain-image advisory. Git diff checks passed.
- One production build in this task passed: Next.js 16.1.6, compilation 107s, TypeScript,
  132 generated entries and standalone packaging, exit 0. The preceding task's restricted
  build stall was not repeated. Final route source was compared against its build source map
  and matched. No production application changes followed successful validation.
- Service-role value scan of generated browser JavaScript found no matches. No credentials,
  generated artifacts or QA profile files are included in the commit.
- Local actual HTTP: empty GET and featured GET 200, invalid pagination 400, nonexistent
  case study 404. No missing-table/PGRST205 errors.

## Browser verification

The in-app browser failed with EPERM resolving its runtime. The existing Chrome extension
failed loading its request-header policy. One isolated installed Chrome headless session
tested the actual local production build and real requests, without mocks or production writes.
It was closed after QA. One local production server was used; the owner's dev server was preserved.

At 1440x900 and 390x900, light and dark reloads had visible navigation/headline, 10 listing
cards plus the featured spotlight, and no horizontal overflow. Web filtering yielded seven
cards. `/portfolio/eco-pi-rewards` rendered its title/content; the homepage rendered six cards.
Anonymous admin navigation reached sign-in. Runtime/console exception capture was empty,
including zero hydration errors. Screenshots and raw evidence are outside Git at:
`C:/Users/HP/AppData/Local/Temp/psh-portfolio-dkX49x/verification.json` and
`portfolio-{1440,390}-{light,dark}.png` in that directory.

## Honest limitations and existing content issues

- Real signed-in administrator CRUD, non-admin browser sessions and Cloudinary uploads were
  not exercised: no production test writes were authorized. CRUD behavior passed in-memory
  API tests; real auth redirects/401 and owner-reported RLS were independently supported.
- All database tables are empty, so actual populated draft isolation, database case studies,
  featured records and testimonials cannot be claimed live-tested. No fake fixtures were seeded.
- Several existing bundled cover/gallery files return 404, including the Eco Pi Rewards and
  24HRS covers. The same URLs returned 404 in Production before release. Existing listing/detail
  artwork fallbacks handle failed images; missing actual client assets were not fabricated.
  The old homepage image markup remains subject to missing bundled media. This is a pre-existing
  content issue, not a new database integration failure, and needs the owner's real assets.
- The existing testimonial carousel is bundled content, not newly wired database CRUD.
  Protected testimonial queries are available; their empty state was verified via HTTP.
- The prior setup/migration/preflight/postflight files are retained as reviewed history.
  Actual Supabase migration-history registration was not independently inspected; **do not rerun**
  the completed migration based on local files.

## Release gate and rollback

Core schema compatibility, anonymous access controls, focused tests, build and local browser
checks passed. Unrelated GA4, newsletter, payments, auth and Analytics source files are unchanged.
Rollback target is the previous successful production commit
`f4a2842934c4808a9c17c50da6543af2108657ea`, deployment
`https://purplesofthub-q1chgedww-purplesofthub-9836s-projects.vercel.app`.
Vercel can promote/roll back to that deployment without deleting the additive Portfolio tables.
No automatic database rollback or schema deletion is proposed.

Release commit, push and exact Vercel status are recorded in the task report after execution.
