-- Drop and recreate cleanly
DROP TABLE IF EXISTS blog_posts CASCADE;

CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  content TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID,
  author_name TEXT DEFAULT 'PurpleSoftHub',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on blog_posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public read published only
CREATE POLICY "Public read published blog_posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (status = 'published');

-- Create categories table
DROP TABLE IF EXISTS blog_categories CASCADE;

CREATE TABLE blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read categories"
  ON blog_categories FOR SELECT
  TO anon
  USING (true);

-- Insert default categories
INSERT INTO blog_categories (name, slug) VALUES 
  ('Technology', 'technology'),
  ('Web Development', 'web-development'),
  ('Mobile Apps', 'mobile-apps'),
  ('Digital Marketing', 'digital-marketing'),
  ('Music & Entertainment', 'music-entertainment'),
  ('Business & Startups', 'business-startups'),
  ('Design & UI/UX', 'design-ui-ux'),
  ('Academy & Learning', 'academy-learning'),
  ('Company News', 'company-news')
ON CONFLICT (name) DO NOTHING;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';