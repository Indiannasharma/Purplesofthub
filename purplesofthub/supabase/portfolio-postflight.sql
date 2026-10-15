-- READ ONLY verification AFTER approved migration, in japscxueoenflsucqtry.
-- Does not create test records or impersonate an existing administrator.
-- Empty-table checks cannot prove populated draft isolation or real admin CRUD.
BEGIN READ ONLY;
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
  obj_description(c.oid, 'pg_class') AS migration_marker,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') AS anon_update,
  has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete,
  (has_table_privilege('authenticated', c.oid, 'SELECT')
    AND has_table_privilege('authenticated', c.oid, 'INSERT')
    AND has_table_privilege('authenticated', c.oid, 'UPDATE')
    AND has_table_privilege('authenticated', c.oid, 'DELETE')) AS session_operations
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN (
  'portfolio_projects', 'portfolio_categories', 'portfolio_industries', 'portfolio_services',
  'portfolio_clients', 'portfolio_testimonials', 'media_library')
ORDER BY c.relname;

SELECT table_name, column_name, udt_name, is_nullable, column_default
FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN (
  'portfolio_projects', 'portfolio_categories', 'portfolio_industries', 'portfolio_services',
  'portfolio_clients', 'portfolio_testimonials', 'media_library')
ORDER BY table_name, ordinal_position;

SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'
AND tablename IN ('portfolio_projects', 'portfolio_categories', 'portfolio_industries',
  'portfolio_services', 'portfolio_clients', 'portfolio_testimonials', 'media_library')
ORDER BY tablename, indexname;

SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public' AND tablename IN (
  'portfolio_projects', 'portfolio_categories', 'portfolio_industries', 'portfolio_services',
  'portfolio_clients', 'portfolio_testimonials', 'media_library')
ORDER BY tablename, policyname;

SELECT conrelid::regclass::text AS table_name, conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint WHERE conrelid IN (
  'public.portfolio_projects'::regclass, 'public.portfolio_testimonials'::regclass,
  'public.media_library'::regclass) ORDER BY conrelid, conname;

-- This must remain one; no subscriber values returned.
SELECT count(*) AS existing_newsletter_count FROM public.newsletter_subscribers;

SET LOCAL ROLE anon;
SELECT count(*) AS visible_published_projects FROM public.portfolio_projects WHERE status = 'published';
SELECT count(*) AS visible_unpublished_projects FROM public.portfolio_projects WHERE status IS DISTINCT FROM 'published';
-- visible_unpublished_projects must be 0; anon_* write privileges above must all be false.
RESET ROLE;
ROLLBACK;
-- Next verify the normal app /api/portfolio and anonymous PostgREST GET.
-- Use actual signed-in administrator UI for CRUD only after owner test-record approval.
