# Portfolio SQL execution handoff

> ARCHIVED: the owner has confirmed this repair was applied. Do not execute this historical
> request again. Current application verification is in `portfolio-production-restoration.md`.

Target project: **japscxueoenflsucqtry**. This deliverable has **not** been executed.
Use the connected ChatGPT Supabase integration; its SQL tools are not exposed in this Codex session.
Do not reinstall dependencies, rename `public.projects`, or make unrelated changes.

Attach these exact files to the ChatGPT conversation with the working Supabase connection:

1. `supabase/portfolio-preflight.sql`
2. `supabase/migrations/20261015000000_restore_portfolio.sql`
3. `supabase/portfolio-postflight.sql`

Use this execution request:

> Confirm your connected project is exactly japscxueoenflsucqtry. Run the attached
> portfolio-preflight.sql read-only and review every result. Missing Portfolio tables
> in public have independently been confirmed, but media_library and alternate schemas
> still require inspection. Confirm public is exposed through the Data API. Inspect
> the existing is_blog_admin function and protect_profile_authority trigger. Preserve
> the one newsletter record and every existing project/client record. Do not change
> public.projects, authentication, newsletter, analytics, payments or storage.
>
> Review the attached 20261015000000_restore_portfolio.sql against those findings.
> Unknown existing target objects deliberately cause an abort; stop and return the
> findings instead of bypassing the guard or dropping objects. This migration creates
> seven Portfolio tables, no records. It does not create portfolio_resources because
> that UI currently uses localStorage. Its public policies restrict projects to
> published status and clients/testimonials to published parents; taxonomy is public
> and media_library is admin-only. Session writes require the verified admin helper.
>
> Before executing any production migration, summarize the proposed changes and ask
> for my explicit approval. After approval, use the appropriate Supabase migration
> tool with the complete attached SQL, including transaction boundaries. Do not
> change unrelated objects or weaken the guards. If the tool manages transactions
> itself, check its documented transaction support before proceeding; stop on any
> uncertainty rather than partially executing the file.
>
> After success, run portfolio-postflight.sql read-only. Return migration name/status,
> table/column/constraint/index and RLS metadata, all policy definitions, anon write
> privilege results, and newsletter count only (no subscriber values). Verify actual
> anonymous PostgREST published reads, unpublished filtering and denied writes using
> non-mutating checks. Do not insert, update or delete a test record without asking
> for separate approval. Empty tables alone do not prove populated draft isolation
> or real administrator CRUD. Return exact results and remaining limitations to Codex.

Bring the execution report back to this task. Release remains blocked until actual database
and critical application/security checks pass. No Git commit, push or Vercel deployment is
part of this SQL handoff.
