-- ===================================================
-- SUPABASE SQL SETUP FOR BLOG CATEGORIES
-- ===================================================
-- Run this in Supabase SQL Editor at:
-- https://app.supabase.com/project/[YOUR_PROJECT]/sql/new
-- ===================================================

-- Create categories table if not exists
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Authenticated full access" ON blog_categories;
DROP POLICY IF EXISTS "Public read" ON blog_categories;

-- Allow authenticated users full access
CREATE POLICY "Authenticated full access"
  ON blog_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public to read
CREATE POLICY "Public read"
  ON blog_categories FOR SELECT
  TO anon
  USING (true);

-- Insert default categories
INSERT INTO blog_categories (name, slug)
VALUES
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

-- Verify they exist
SELECT * FROM blog_categories ORDER BY name;
