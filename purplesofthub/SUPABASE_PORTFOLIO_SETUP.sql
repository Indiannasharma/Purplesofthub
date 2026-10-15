-- REVIEWED HANDOFF: requires target preflight review AND owner approval before execution.
-- Target dashboard project: japscxueoenflsucqtry. SQL cannot prove the project ref.
-- Canonical migration; SUPABASE_PORTFOLIO_SETUP.sql is an identical convenience copy.
-- Creates missing Portfolio objects only. No seeds, data updates, drops or bucket changes.
-- Unknown existing tables (even empty), alternative-schema objects or unknown policies ABORT.
-- Re-running this migration's own unchanged objects is safe; reconcile legacy objects separately.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SELECT pg_advisory_xact_lock(hashtext('psh-portfolio-repair'));

DO $guard$
DECLARE r record;
BEGIN
  IF to_regprocedure('public.is_blog_admin()') IS NULL
    OR NOT EXISTS (SELECT 1 FROM pg_proc p WHERE p.oid = to_regprocedure('public.is_blog_admin()')
      AND p.prosecdef AND p.prorettype = 'boolean'::regtype)
    OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = to_regclass('public.profiles')
      AND tgname = 'protect_profile_authority' AND tgenabled = 'O') THEN
    RAISE EXCEPTION 'STOP: verify the existing admin helper and profile protection; do not install unrelated migrations';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc p WHERE p.oid = to_regprocedure('public.is_blog_admin()')
    AND p.provolatile = 's' AND p.proconfig @> ARRAY['search_path=""']
    AND regexp_replace(lower(p.prosrc), '[[:space:]]', '', 'g') =
      'selectexists(select1frompublic.profileswhereid=auth.uid()androle=''admin'');'
    AND has_function_privilege('authenticated', p.oid, 'EXECUTE')) THEN
    RAISE EXCEPTION 'STOP: admin helper differs from verified admin-only definition; inspect without changing authentication';
  END IF;
  FOR r IN SELECT n.nspname, c.relname, c.oid, c.relkind FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname IN ('portfolio_projects', 'portfolio_categories', 'portfolio_industries', 'portfolio_services', 'portfolio_clients', 'portfolio_testimonials', 'media_library') AND c.relkind IN ('r','p','v','m','f') LOOP
    IF r.nspname <> 'public' OR r.relkind <> 'r'
       OR obj_description(r.oid, 'pg_class') IS DISTINCT FROM 'psh:portfolio-repair:20261015000000' THEN
      RAISE EXCEPTION 'STOP: existing %.% needs preflight review and additive reconciliation', r.nspname, r.relname;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
    AND tablename IN ('portfolio_projects', 'portfolio_categories', 'portfolio_industries', 'portfolio_services', 'portfolio_clients', 'portfolio_testimonials', 'media_library') AND policyname NOT IN ('portfolio_public_read', 'portfolio_admin_manage')) THEN
    RAISE EXCEPTION 'STOP: unexpected Portfolio policies; inspect before changing permissions';
  END IF;
END $guard$;

-- Validate required column types and key constraints before reusing marked tables.
DO $shape$
DECLARE table_spec record; col record; relation oid; id_attribute smallint; slug_attribute smallint;
BEGIN
  FOR table_spec IN SELECT key, value FROM jsonb_each($expected${"portfolio_projects":{"id":"uuid","title":"text","slug":"text","client_name":"text","client_id":"uuid","industry":"text","category":"text","service":"text","completion_date":"text","year":"text","cover_image":"text","hero_banner":"text","featured_thumbnail":"text","gallery":"jsonb","overview":"text","challenge":"text","solution":"text","deliverables":"jsonb","results":"text","client_feedback":"text","services_used":"jsonb","tags":"jsonb","client_logo":"text","client_website":"text","project_duration":"text","team_size":"text","software_used":"text","deliverables_count":"integer","status":"text","featured":"boolean","color":"text","emoji":"text","seo_title":"text","seo_description":"text","seo_keywords":"jsonb","og_image":"text","canonical_url":"text","structured_data":"jsonb","live_url":"text","behance_url":"text","dribbble_url":"text","youtube_embed":"text","instagram_embed":"text","figma_embed":"text","adobe_xd_embed":"text","view_count":"integer","created_at":"timestamptz","updated_at":"timestamptz","research":"text","strategy":"text","creative_direction":"text","wireframes":"text","moodboard":"text","typography":"text","colour_system":"text","grid_system":"text","final_solution":"text","comparison":"jsonb","recommended_services":"jsonb","mockups":"jsonb","videos":"jsonb","timeline":"jsonb","downloads":"jsonb","awards":"jsonb","related_projects":"jsonb","download_count":"integer","likes":"integer","enquiries":"integer"},"portfolio_categories":{"id":"uuid","name":"text","slug":"text","description":"text","icon":"text","color":"text","sort_order":"integer","created_at":"timestamptz","updated_at":"timestamptz"},"portfolio_industries":{"id":"uuid","name":"text","slug":"text","description":"text","icon":"text","color":"text","sort_order":"integer","created_at":"timestamptz","updated_at":"timestamptz"},"portfolio_services":{"id":"uuid","name":"text","slug":"text","icon":"text","color":"text","sort_order":"integer","created_at":"timestamptz","updated_at":"timestamptz"},"portfolio_clients":{"id":"uuid","name":"text","slug":"text","logo_url":"text","website":"text","industry":"text","description":"text","created_at":"timestamptz","updated_at":"timestamptz"},"portfolio_testimonials":{"id":"uuid","project_id":"uuid","client_name":"text","company":"text","photo_url":"text","rating":"integer","review":"text","is_featured":"boolean","created_at":"timestamptz","updated_at":"timestamptz"},"media_library":{"id":"uuid","filename":"text","url":"text","public_id":"text","folder":"text","file_type":"text","file_size":"integer","width":"integer","height":"integer","alt_text":"text","created_by":"uuid","created_at":"timestamptz","updated_at":"timestamptz"}}$expected$::jsonb) LOOP
    relation := to_regclass(format('public.%I', table_spec.key));
    IF relation IS NULL THEN CONTINUE; END IF;
    FOR col IN SELECT key, value FROM jsonb_each_text(table_spec.value) LOOP
      IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = relation
        AND attname = col.key AND NOT attisdropped AND atttypid = to_regtype(col.value)) THEN
        RAISE EXCEPTION 'STOP: incompatible column public.%.%', table_spec.key, col.key;
      END IF;
    END LOOP;
    SELECT attnum INTO id_attribute FROM pg_attribute WHERE attrelid = relation AND attname = 'id';
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = relation AND contype = 'p'
      AND conkey = ARRAY[id_attribute]) THEN
      RAISE EXCEPTION 'STOP: primary key drift on %', table_spec.key;
    END IF;
    IF table_spec.value ? 'slug' THEN
      SELECT attnum INTO slug_attribute FROM pg_attribute WHERE attrelid = relation AND attname = 'slug';
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = relation AND contype = 'u'
        AND conkey = ARRAY[slug_attribute]) THEN
        RAISE EXCEPTION 'STOP: unique slug constraint missing on %', table_spec.key;
      END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = relation AND (
      NOT polpermissive OR
      (polname = 'portfolio_public_read' AND (polcmd <> 'r' OR table_spec.key = 'media_library')) OR
      (polname = 'portfolio_admin_manage' AND polcmd <> '*'))) THEN
      RAISE EXCEPTION 'STOP: policy command/type drift on %', table_spec.key;
    END IF;
  END LOOP;
END $shape$;

CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  client_name TEXT,
  client_id UUID,
  industry TEXT,
  category TEXT,
  service TEXT,
  completion_date TEXT,
  year TEXT,

  cover_image TEXT,
  hero_banner TEXT,
  featured_thumbnail TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,

  overview TEXT,
  challenge TEXT,
  solution TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  results TEXT,
  client_feedback TEXT,

  services_used JSONB DEFAULT '[]'::jsonb,

  tags JSONB DEFAULT '[]'::jsonb,

  client_logo TEXT,
  client_website TEXT,

  project_duration TEXT,
  team_size TEXT,
  software_used TEXT,
  deliverables_count INTEGER,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,

  color TEXT DEFAULT '#7c3aed',
  emoji TEXT DEFAULT '🎨',

  seo_title TEXT,
  seo_description TEXT,
  seo_keywords JSONB DEFAULT '[]'::jsonb,
  og_image TEXT,
  canonical_url TEXT,
  structured_data JSONB,

  live_url TEXT,
  behance_url TEXT,
  dribbble_url TEXT,
  youtube_embed TEXT,
  instagram_embed TEXT,
  figma_embed TEXT,
  adobe_xd_embed TEXT,

  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  research TEXT,
  strategy TEXT,
  creative_direction TEXT,
  wireframes TEXT,
  moodboard TEXT,
  typography TEXT,
  colour_system TEXT,
  grid_system TEXT,
  final_solution TEXT,
  comparison JSONB,
  recommended_services JSONB DEFAULT '[]'::jsonb,
  mockups JSONB,
  videos JSONB,
  timeline JSONB,
  downloads JSONB,
  awards JSONB,
  related_projects JSONB DEFAULT '[]'::jsonb,
  download_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  enquiries INTEGER DEFAULT 0
);
COMMENT ON TABLE public.portfolio_projects IS 'psh:portfolio-repair:20261015000000';

CREATE TABLE IF NOT EXISTS public.portfolio_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#7c3aed',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.portfolio_categories IS 'psh:portfolio-repair:20261015000000';

CREATE TABLE IF NOT EXISTS public.portfolio_industries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#7c3aed',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.portfolio_industries IS 'psh:portfolio-repair:20261015000000';

CREATE TABLE IF NOT EXISTS public.portfolio_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT DEFAULT '#7c3aed',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.portfolio_services IS 'psh:portfolio-repair:20261015000000';

CREATE TABLE IF NOT EXISTS public.portfolio_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.portfolio_clients IS 'psh:portfolio-repair:20261015000000';

CREATE TABLE IF NOT EXISTS public.portfolio_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  company TEXT,
  photo_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.portfolio_testimonials IS 'psh:portfolio-repair:20261015000000';

CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  public_id TEXT,
  folder TEXT DEFAULT 'general',
  file_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.media_library IS 'psh:portfolio-repair:20261015000000';

-- Foreign key deferred until both projects and clients exist.
DO $fk$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.portfolio_projects'::regclass
    AND conname = 'portfolio_projects_client_id_fkey') THEN
    ALTER TABLE public.portfolio_projects ADD CONSTRAINT portfolio_projects_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES public.portfolio_clients(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c
    WHERE c.conrelid = 'public.portfolio_projects'::regclass AND c.conname = 'portfolio_projects_client_id_fkey'
      AND c.contype = 'f' AND c.confrelid = 'public.portfolio_clients'::regclass AND c.confdeltype = 'n'
      AND c.conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = c.conrelid AND attname = 'client_id')]
      AND c.confkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = c.confrelid AND attname = 'id')]) THEN
    RAISE EXCEPTION 'STOP: incompatible projects-to-clients foreign key';
  END IF;
END $fk$;
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_status_created ON public.portfolio_projects(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured_created ON public.portfolio_projects(created_at DESC) WHERE featured AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_category ON public.portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_industry ON public.portfolio_projects(industry);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_client ON public.portfolio_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_testimonials_project ON public.portfolio_testimonials(project_id);
CREATE INDEX IF NOT EXISTS idx_media_library_created_by ON public.media_library(created_by);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON public.media_library(folder);

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_projects FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO service_role;
GRANT SELECT ON public.portfolio_projects TO anon;
DO $policies$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_projects' AND policyname = 'portfolio_public_read') THEN
    CREATE POLICY portfolio_public_read ON public.portfolio_projects FOR SELECT TO anon, authenticated USING (status = 'published');
  END IF;
  ALTER POLICY portfolio_public_read ON public.portfolio_projects TO anon, authenticated USING (status = 'published');
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_projects' AND policyname = 'portfolio_admin_manage') THEN
    CREATE POLICY portfolio_admin_manage ON public.portfolio_projects FOR ALL TO authenticated
      USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
  END IF;
  ALTER POLICY portfolio_admin_manage ON public.portfolio_projects TO authenticated
    USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
END $policies$;

ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_categories FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_categories TO service_role;
GRANT SELECT ON public.portfolio_categories TO anon;
DO $policies$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_categories' AND policyname = 'portfolio_public_read') THEN
    CREATE POLICY portfolio_public_read ON public.portfolio_categories FOR SELECT TO anon, authenticated USING (true);
  END IF;
  ALTER POLICY portfolio_public_read ON public.portfolio_categories TO anon, authenticated USING (true);
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_categories' AND policyname = 'portfolio_admin_manage') THEN
    CREATE POLICY portfolio_admin_manage ON public.portfolio_categories FOR ALL TO authenticated
      USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
  END IF;
  ALTER POLICY portfolio_admin_manage ON public.portfolio_categories TO authenticated
    USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
END $policies$;

ALTER TABLE public.portfolio_industries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_industries FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_industries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_industries TO service_role;
GRANT SELECT ON public.portfolio_industries TO anon;
DO $policies$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_industries' AND policyname = 'portfolio_public_read') THEN
    CREATE POLICY portfolio_public_read ON public.portfolio_industries FOR SELECT TO anon, authenticated USING (true);
  END IF;
  ALTER POLICY portfolio_public_read ON public.portfolio_industries TO anon, authenticated USING (true);
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_industries' AND policyname = 'portfolio_admin_manage') THEN
    CREATE POLICY portfolio_admin_manage ON public.portfolio_industries FOR ALL TO authenticated
      USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
  END IF;
  ALTER POLICY portfolio_admin_manage ON public.portfolio_industries TO authenticated
    USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
END $policies$;

ALTER TABLE public.portfolio_services ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_services FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_services TO service_role;
GRANT SELECT ON public.portfolio_services TO anon;
DO $policies$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_services' AND policyname = 'portfolio_public_read') THEN
    CREATE POLICY portfolio_public_read ON public.portfolio_services FOR SELECT TO anon, authenticated USING (true);
  END IF;
  ALTER POLICY portfolio_public_read ON public.portfolio_services TO anon, authenticated USING (true);
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_services' AND policyname = 'portfolio_admin_manage') THEN
    CREATE POLICY portfolio_admin_manage ON public.portfolio_services FOR ALL TO authenticated
      USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
  END IF;
  ALTER POLICY portfolio_admin_manage ON public.portfolio_services TO authenticated
    USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
END $policies$;

ALTER TABLE public.portfolio_clients ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_clients FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_clients TO service_role;
GRANT SELECT ON public.portfolio_clients TO anon;
DO $policies$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_clients' AND policyname = 'portfolio_public_read') THEN
    CREATE POLICY portfolio_public_read ON public.portfolio_clients FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.portfolio_projects p WHERE p.client_id = portfolio_clients.id AND p.status = 'published'));
  END IF;
  ALTER POLICY portfolio_public_read ON public.portfolio_clients TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.portfolio_projects p WHERE p.client_id = portfolio_clients.id AND p.status = 'published'));
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_clients' AND policyname = 'portfolio_admin_manage') THEN
    CREATE POLICY portfolio_admin_manage ON public.portfolio_clients FOR ALL TO authenticated
      USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
  END IF;
  ALTER POLICY portfolio_admin_manage ON public.portfolio_clients TO authenticated
    USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
END $policies$;

ALTER TABLE public.portfolio_testimonials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_testimonials FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_testimonials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_testimonials TO service_role;
GRANT SELECT ON public.portfolio_testimonials TO anon;
DO $policies$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_testimonials' AND policyname = 'portfolio_public_read') THEN
    CREATE POLICY portfolio_public_read ON public.portfolio_testimonials FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.portfolio_projects p WHERE p.id = portfolio_testimonials.project_id AND p.status = 'published'));
  END IF;
  ALTER POLICY portfolio_public_read ON public.portfolio_testimonials TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.portfolio_projects p WHERE p.id = portfolio_testimonials.project_id AND p.status = 'published'));
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'portfolio_testimonials' AND policyname = 'portfolio_admin_manage') THEN
    CREATE POLICY portfolio_admin_manage ON public.portfolio_testimonials FOR ALL TO authenticated
      USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
  END IF;
  ALTER POLICY portfolio_admin_manage ON public.portfolio_testimonials TO authenticated
    USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
END $policies$;

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.media_library FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO service_role;
DO $policies$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'media_library' AND policyname = 'portfolio_admin_manage') THEN
    CREATE POLICY portfolio_admin_manage ON public.media_library FOR ALL TO authenticated
      USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
  END IF;
  ALTER POLICY portfolio_admin_manage ON public.media_library TO authenticated
    USING ((SELECT public.is_blog_admin())) WITH CHECK ((SELECT public.is_blog_admin()));
END $policies$;

-- No new timestamp function needed: all existing create/update helpers set updated_at.
-- portfolio_resources is NOT created: its current UI persists in localStorage, not this DB.
-- No Supabase storage bucket is created: existing uploads use Cloudinary with server auth.
NOTIFY pgrst, 'reload schema';
COMMIT;
