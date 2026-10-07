BEGIN;

-- Additive metadata; existing content, slugs, images, dates and SEO are untouched.
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image_alt text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS source_urls text[] DEFAULT '{}';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_type text
  CHECK (author_type IS NULL OR author_type IN ('Person', 'Organization'));
ALTER TABLE public.blog_posts ALTER COLUMN author_name SET DEFAULT 'PurpleSoftHub';

-- There is no dedicated publication-author table in this schema.
UPDATE public.blog_posts SET author_name = 'PurpleSoftHub', author_id = NULL,
  author_type = 'Organization',
  featured_image_alt = COALESCE(featured_image_alt,
    'WhatsApp login blocked on a smartphone because the device software needs updating.')
WHERE slug = 'whatsapp-blocks-logins-outdated-software';

-- Remove permissive policies (notably the old authenticated USING (true) FOR ALL).
-- All mutations now go through the authenticated, validated server publisher.
DO $$
DECLARE item record;
BEGIN
  FOR item IN SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('blog_posts', 'blog_categories')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', item.policyname, item.tablename);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.is_blog_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.is_blog_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_blog_admin() TO authenticated;
-- Protect the role used by the publisher's existing profile-based authorization.
-- Ordinary profile edits remain allowed; only self-promotion is blocked.
CREATE OR REPLACE FUNCTION public.protect_profile_authority() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user = 'authenticated' THEN
    IF TG_OP = 'INSERT' THEN
      IF COALESCE(NEW.role, 'client') <> 'client' AND NOT public.is_blog_admin() THEN
        RAISE EXCEPTION 'Only administrators can assign privileged roles' USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_blog_admin() THEN
      RAISE EXCEPTION 'Only administrators can change roles' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_profile_authority ON public.profiles;
CREATE TRIGGER protect_profile_authority BEFORE INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_authority();

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY blog_published_read ON public.blog_posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY blog_admin_read ON public.blog_posts FOR SELECT TO authenticated USING ((SELECT public.is_blog_admin()));
CREATE POLICY blog_categories_read ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.blog_posts, public.blog_categories FROM anon, authenticated;
GRANT SELECT ON public.blog_posts, public.blog_categories TO anon, authenticated;
GRANT ALL ON public.blog_posts, public.blog_categories TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
