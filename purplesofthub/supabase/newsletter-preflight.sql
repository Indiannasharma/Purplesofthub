-- READ ONLY. Run in the owner-confirmed project japscxueoenflsucqtry SQL Editor.
-- No subscriber values are returned. A REST 404 does not prove physical absence.
SELECT n.nspname AS schema_name, c.relname, c.relkind, c.relrowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'newsletter_subscribers';

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers'
ORDER BY ordinal_position;

SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers';

SELECT grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers';

SELECT p.proname, p.prosecdef, p.proconfig, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('is_blog_admin', 'protect_profile_authority');

SELECT tgname, tgenabled FROM pg_trigger
WHERE tgrelid = to_regclass('public.profiles') AND tgname = 'protect_profile_authority';

SELECT current_setting('pgrst.db_schemas', true) AS api_schemas;
-- Also check Supabase Settings > Data API > Exposed schemas includes public.
-- If ANY relation already exists, STOP: do not run the create-only migration.
-- Review its constraints/indexes and a COUNT(*) in the SQL Editor before an
-- additive reconciliation; never export existing subscriber email values.
