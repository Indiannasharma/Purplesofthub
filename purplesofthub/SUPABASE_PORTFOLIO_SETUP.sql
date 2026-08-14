-- ==========================================
-- PORTFOLIO MANAGEMENT SYSTEM SETUP
-- ==========================================
-- Run this SQL in your Supabase SQL Editor
-- ==========================================

-- ──────────────────────────────────────────
-- PORTFOLIO CATEGORIES
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_categories (
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

ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON portfolio_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON portfolio_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- ──────────────────────────────────────────
-- PORTFOLIO INDUSTRIES
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_industries (
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

ALTER TABLE portfolio_industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read industries"
  ON portfolio_industries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage industries"
  ON portfolio_industries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- ──────────────────────────────────────────
-- PORTFOLIO CLIENTS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_clients (
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

ALTER TABLE portfolio_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clients"
  ON portfolio_clients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage clients"
  ON portfolio_clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- ──────────────────────────────────────────
-- PORTFOLIO TESTIMONIALS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  company TEXT,
  photo_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portfolio_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read testimonials"
  ON portfolio_testimonials FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage testimonials"
  ON portfolio_testimonials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- ──────────────────────────────────────────
-- PORTFOLIO PROJECTS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  client_name TEXT,
  client_id UUID REFERENCES portfolio_clients(id) ON DELETE SET NULL,
  industry TEXT,
  category TEXT,
  service TEXT,
  completion_date TEXT,
  year TEXT,

  -- Cover / Media
  cover_image TEXT,
  hero_banner TEXT,
  featured_thumbnail TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,

  -- Content
  overview TEXT,
  challenge TEXT,
  solution TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  results TEXT,
  client_feedback TEXT,

  -- Services
  services_used JSONB DEFAULT '[]'::jsonb,

  -- Tags
  tags JSONB DEFAULT '[]'::jsonb,

  -- Client Info
  client_logo TEXT,
  client_website TEXT,

  -- Statistics
  project_duration TEXT,
  team_size TEXT,
  software_used TEXT,
  deliverables_count INTEGER,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,

  -- Visual
  color TEXT DEFAULT '#7c3aed',
  emoji TEXT DEFAULT '🎨',

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords JSONB DEFAULT '[]'::jsonb,
  og_image TEXT,
  canonical_url TEXT,
  structured_data JSONB,

  -- External Links
  live_url TEXT,
  behance_url TEXT,
  dribbble_url TEXT,
  youtube_embed TEXT,
  instagram_embed TEXT,
  figma_embed TEXT,
  adobe_xd_embed TEXT,

  -- Meta
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_status ON portfolio_projects(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_category ON portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_industry ON portfolio_projects(industry);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured ON portfolio_projects(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_year ON portfolio_projects(year);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_created ON portfolio_projects(created_at DESC);

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published projects"
  ON portfolio_projects FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins can read all projects"
  ON portfolio_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can manage projects"
  ON portfolio_projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- ──────────────────────────────────────────
-- MEDIA LIBRARY
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_library (
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

CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_created ON media_library(created_at DESC);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media"
  ON media_library FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage media"
  ON media_library FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- ──────────────────────────────────────────
-- SEED DEFAULT CATEGORIES
-- ──────────────────────────────────────────
INSERT INTO portfolio_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Featured Projects', 'featured-projects', 'Our best and most impactful work', '⭐', '#7c3aed', 0),
  ('Brand Identity', 'brand-identity', 'Complete brand identity systems', '🎨', '#a855f7', 1),
  ('Corporate Profiles', 'corporate-profiles', 'Corporate profile documents', '📊', '#3b82f6', 2),
  ('Company Profiles', 'company-profiles', 'Company profile documents', '🏢', '#6366f1', 3),
  ('Sponsorship Decks', 'sponsorship-decks', 'Sponsorship presentation decks', '🤝', '#8b5cf6', 4),
  ('Sponsorship Proposals', 'sponsorship-proposals', 'Sponsorship proposal documents', '📋', '#a78bfa', 5),
  ('Product Catalogues', 'product-catalogues', 'Product catalogue designs', '📦', '#f59e0b', 6),
  ('Event Branding', 'event-branding', 'Event branding and identity', '🎪', '#ec4899', 7),
  ('Website Design', 'website-design', 'Website design and development', '💻', '#06b6d4', 8),
  ('UI/UX', 'ui-ux', 'User interface and experience design', '🖥️', '#10b981', 9),
  ('Mobile Apps', 'mobile-apps', 'Mobile application design', '📱', '#22c55e', 10),
  ('Social Media', 'social-media', 'Social media graphics and campaigns', '📱', '#f43f5e', 11),
  ('YouTube', 'youtube', 'YouTube content and channel branding', '▶️', '#ef4444', 12),
  ('Instagram', 'instagram', 'Instagram content and campaigns', '📸', '#d946ef', 13),
  ('Video Production', 'video-production', 'Video production and editing', '🎬', '#f97316', 14),
  ('Motion Graphics', 'motion-graphics', 'Motion graphics and animation', '✨', '#8b5cf6', 15),
  ('AI Creative', 'ai-creative', 'AI-powered creative work', '🤖', '#06b6d4', 16),
  ('Print Design', 'print-design', 'Print design and collateral', '🖨️', '#64748b', 17),
  ('Marketing Campaigns', 'marketing-campaigns', 'Marketing campaign materials', '📢', '#f59e0b', 18),
  ('Live Streaming', 'live-streaming', 'Live streaming production', '📡', '#3b82f6', 19)
ON CONFLICT (name) DO NOTHING;

-- ──────────────────────────────────────────
-- SEED DEFAULT INDUSTRIES
-- ──────────────────────────────────────────
INSERT INTO portfolio_industries (name, slug, description, icon, color, sort_order) VALUES
  ('Technology', 'technology', 'Technology companies and startups', '💻', '#06b6d4', 0),
  ('Healthcare', 'healthcare', 'Healthcare and medical', '🏥', '#10b981', 1),
  ('Education', 'education', 'Education and learning', '🎓', '#3b82f6', 2),
  ('Construction', 'construction', 'Construction and building', '🏗️', '#f59e0b', 3),
  ('Fashion', 'fashion', 'Fashion and apparel', '👗', '#ec4899', 4),
  ('Automotive', 'automotive', 'Automotive industry', '🚗', '#ef4444', 5),
  ('Tourism', 'tourism', 'Tourism and travel', '✈️', '#22c55e', 6),
  ('Finance', 'finance', 'Finance and banking', '💰', '#f59e0b', 7),
  ('NGO', 'ngo', 'Non-governmental organizations', '🤝', '#8b5cf6', 8),
  ('Government', 'government', 'Government agencies', '🏛️', '#64748b', 9),
  ('Agriculture', 'agriculture', 'Agriculture and farming', '🌾', '#22c55e', 10),
  ('Real Estate', 'real-estate', 'Real estate and property', '🏠', '#7c3aed', 11),
  ('Hospitality', 'hospitality', 'Hospitality and hotels', '🏨', '#f97316', 12),
  ('Retail', 'retail', 'Retail and e-commerce', '🛍️', '#ec4899', 13),
  ('Entertainment', 'entertainment', 'Entertainment and media', '🎬', '#a855f7', 14),
  ('Sustainability', 'sustainability', 'Sustainability and environment', '🌿', '#10b981', 15),
  ('Creative', 'creative', 'Creative industries', '🎨', '#d946ef', 16),
  ('Corporate', 'corporate', 'Corporate and business', '🏢', '#6366f1', 17),
  ('Events', 'events', 'Events and conferences', '🎪', '#f59e0b', 18),
  ('Branding', 'branding', 'Branding and identity', '🎯', '#a855f7', 19)
ON CONFLICT (name) DO NOTHING;

-- ──────────────────────────────────────────
-- SEED DEFAULT SERVICES
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT DEFAULT '#7c3aed',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portfolio_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read services"
  ON portfolio_services FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage services"
  ON portfolio_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

INSERT INTO portfolio_services (name, slug, icon, color, sort_order) VALUES
  ('Brand Identity', 'brand-identity', '🎨', '#a855f7', 0),
  ('Logo Design', 'logo-design', '✏️', '#8b5cf6', 1),
  ('Website Development', 'website-development', '💻', '#06b6d4', 2),
  ('Mobile App', 'mobile-app', '📱', '#22c55e', 3),
  ('Corporate Profile', 'corporate-profile', '📊', '#3b82f6', 4),
  ('Company Profile', 'company-profile', '🏢', '#6366f1', 5),
  ('Sponsorship Deck', 'sponsorship-deck', '🤝', '#8b5cf6', 6),
  ('Sponsorship Proposal', 'sponsorship-proposal', '📋', '#a78bfa', 7),
  ('Product Catalogue', 'product-catalogue', '📦', '#f59e0b', 8),
  ('Event Branding', 'event-branding', '🎪', '#ec4899', 9),
  ('Social Media', 'social-media', '📱', '#f43f5e', 10),
  ('Digital Marketing', 'digital-marketing', '📢', '#f59e0b', 11),
  ('SEO', 'seo', '🔍', '#10b981', 12),
  ('Video Editing', 'video-editing', '🎬', '#f97316', 13),
  ('Motion Graphics', 'motion-graphics', '✨', '#8b5cf6', 14),
  ('Photography', 'photography', '📷', '#64748b', 15),
  ('Live Streaming', 'live-streaming', '📡', '#3b82f6', 16),
  ('AI Creative', 'ai-creative', '🤖', '#06b6d4', 17),
  ('Content Creation', 'content-creation', '✍️', '#ec4899', 18),
  ('YouTube Management', 'youtube-management', '▶️', '#ef4444', 19),
  ('Instagram Management', 'instagram-management', '📸', '#d946ef', 20)
ON CONFLICT (name) DO NOTHING;

-- ──────────────────────────────────────────
-- MIGRATE EXISTING PORTFOLIO DATA
-- ──────────────────────────────────────────
-- This will be done via a script after the tables are created
-- The existing hardcoded data in app/portfolio/_data/portfolio.ts
-- will be migrated to the database

-- Verify
SELECT 'portfolio_categories' as table_name, count(*) FROM portfolio_categories
UNION ALL
SELECT 'portfolio_industries', count(*) FROM portfolio_industries
UNION ALL
SELECT 'portfolio_services', count(*) FROM portfolio_services
UNION ALL
SELECT 'portfolio_projects', count(*) FROM portfolio_projects
UNION ALL
SELECT 'portfolio_clients', count(*) FROM portfolio_clients
UNION ALL
SELECT 'portfolio_testimonials', count(*) FROM portfolio_testimonials
UNION ALL
SELECT 'media_library', count(*) FROM media_library;

-- ──────────────────────────────────────────
-- PREMIUM RESOURCE LIBRARY
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  pdf_url TEXT,
  preview_url TEXT,
  related_services TEXT[] DEFAULT '{}',
  email_gate BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portfolio_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published resources"
  ON portfolio_resources FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins can manage resources"
  ON portfolio_resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

NOTIFY pgrst, 'reload schema';