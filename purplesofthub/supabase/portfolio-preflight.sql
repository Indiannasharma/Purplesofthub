-- READ ONLY. Run the entire file in project japscxueoenflsucqtry SQL Editor.
-- Confirm the project reference in the dashboard URL first.
-- One JSON result; metadata and counts only, no project/client/subscriber values.
-- Return this result for review BEFORE running the repair migration.
WITH relations AS (
  SELECT c.oid, n.nspname AS schema_name, c.relname AS table_name,
         c.relkind, c.relrowsecurity, c.relforcerowsecurity,
         obj_description(c.oid, 'pg_class') AS migration_marker
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE (c.relname LIKE 'portfolio\_%' ESCAPE '\' OR c.relname = 'media_library')
    AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
), report AS (
  SELECT 'relations' AS section, COALESCE(jsonb_agg(to_jsonb(r)), '[]') AS result FROM relations r
  UNION ALL
  SELECT 'record_counts', COALESCE(jsonb_agg(jsonb_build_object(
    'schema', r.schema_name, 'table', r.table_name,
    'count', ((xpath('/row/n/text()', query_to_xml(
      format('SELECT count(*) AS n FROM %I.%I', r.schema_name, r.table_name),
      false, false, '')))[1]::text)::bigint)), '[]')
  FROM relations r WHERE r.relkind IN ('r', 'p')
  UNION ALL
  SELECT 'columns', COALESCE(jsonb_agg(to_jsonb(c)), '[]')
  FROM (SELECT c.table_schema, c.table_name, c.column_name, c.udt_name,
               c.is_nullable, c.column_default
        FROM information_schema.columns c JOIN relations r
          ON r.schema_name = c.table_schema AND r.table_name = c.table_name
        ORDER BY c.table_schema, c.table_name, c.ordinal_position) c
  UNION ALL
  SELECT 'constraints_and_incoming_foreign_keys', COALESCE(jsonb_agg(jsonb_build_object(
    'table', c.conrelid::regclass::text, 'name', c.conname,
    'definition', pg_get_constraintdef(c.oid))), '[]')
  FROM pg_constraint c WHERE c.conrelid IN (SELECT oid FROM relations)
    OR c.confrelid IN (SELECT oid FROM relations)
  UNION ALL
  SELECT 'indexes', COALESCE(jsonb_agg(to_jsonb(i)), '[]')
  FROM pg_indexes i JOIN relations r ON r.schema_name = i.schemaname AND r.table_name = i.tablename
  UNION ALL
  SELECT 'triggers', COALESCE(jsonb_agg(jsonb_build_object(
    'table', t.tgrelid::regclass::text, 'name', t.tgname, 'enabled', t.tgenabled,
    'definition', pg_get_triggerdef(t.oid))), '[]')
  FROM pg_trigger t WHERE t.tgrelid IN (SELECT oid FROM relations) AND NOT t.tgisinternal
  UNION ALL
  SELECT 'policies', COALESCE(jsonb_agg(to_jsonb(p)), '[]')
  FROM pg_policies p JOIN relations r ON r.schema_name = p.schemaname AND r.table_name = p.tablename
  UNION ALL
  SELECT 'grants', COALESCE(jsonb_agg(to_jsonb(g)), '[]')
  FROM information_schema.role_table_grants g JOIN relations r
    ON r.schema_name = g.table_schema AND r.table_name = g.table_name
  UNION ALL
  SELECT 'admin_functions', COALESCE(jsonb_agg(jsonb_build_object(
    'name', p.proname, 'security_definer', p.prosecdef, 'settings', p.proconfig,
    'definition', pg_get_functiondef(p.oid))), '[]')
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname IN ('is_blog_admin', 'protect_profile_authority')
  UNION ALL
  SELECT 'profile_protection', COALESCE(jsonb_agg(jsonb_build_object(
    'name', t.tgname, 'enabled', t.tgenabled)), '[]') FROM pg_trigger t
  WHERE t.tgrelid = to_regclass('public.profiles') AND t.tgname = 'protect_profile_authority'
  UNION ALL
  SELECT 'portfolio_bucket_metadata', COALESCE(jsonb_agg(jsonb_build_object(
    'id', b.id, 'public', b.public, 'file_size_limit', b.file_size_limit,
    'allowed_mime_types', b.allowed_mime_types)), '[]') FROM storage.buckets b
  WHERE b.id ILIKE '%portfolio%' OR b.id ILIKE '%media%'
  UNION ALL
  SELECT 'storage_policies', COALESCE(jsonb_agg(to_jsonb(p)), '[]') FROM pg_policies p
  WHERE p.schemaname = 'storage' AND p.tablename IN ('objects', 'buckets')
  UNION ALL
  SELECT 'api_schema_setting', jsonb_build_object('value', current_setting('pgrst.db_schemas', true))
)
SELECT jsonb_pretty(jsonb_object_agg(section, result)) AS portfolio_preflight FROM report;
-- A NULL API schema setting here is inconclusive. In Settings > Data API,
-- confirm Exposed schemas includes public. Do not change that setting yet.
-- No Supabase bucket is currently needed by Portfolio: uploads use Cloudinary.
