-- ==========================================
-- BLOG COMMENTS & REACTIONS SYSTEM SETUP
-- ==========================================
--
-- Run this SQL in your Supabase SQL Editor
-- Copy the entire content and paste it there
--
-- ==========================================

-- BLOG LIKES TABLE
CREATE TABLE IF NOT EXISTS blog_likes (
  id UUID DEFAULT gen_random_uuid()
    PRIMARY KEY,
  post_id UUID NOT NULL
    REFERENCES blog_posts(id)
    ON DELETE CASCADE,
  user_id UUID REFERENCES
    auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL DEFAULT 'love'
    CHECK (reaction IN
      ('love', 'fire', 'mind_blown')),
  anonymous_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  UNIQUE(post_id, anonymous_id)
);

ALTER TABLE blog_likes
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON blog_likes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert likes"
  ON blog_likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users delete own likes"
  ON blog_likes FOR DELETE
  TO anon, authenticated
  USING (
    user_id = auth.uid() OR
    anonymous_id IS NOT NULL
  );

-- BLOG COMMENTS TABLE
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid()
    PRIMARY KEY,
  post_id UUID NOT NULL
    REFERENCES blog_posts(id)
    ON DELETE CASCADE,
  parent_id UUID REFERENCES
    blog_comments(id)
    ON DELETE CASCADE,
  user_id UUID REFERENCES
    auth.users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL
    CHECK (char_length(content) >= 2
      AND char_length(content) <= 1000),
  is_deleted BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_comments
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved"
  ON blog_comments FOR SELECT
  TO anon, authenticated
  USING (
    is_deleted = FALSE AND
    is_approved = TRUE
  );

CREATE POLICY "Anyone can insert comments"
  ON blog_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users update own comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add comment_count to blog_posts
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS
  comment_count INTEGER DEFAULT 0;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS
  likes_count INTEGER DEFAULT 0;

-- Function to update comment count
CREATE OR REPLACE FUNCTION
  update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_posts
    SET comment_count =
      GREATEST(comment_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_count_trigger
  ON blog_comments;

CREATE TRIGGER comment_count_trigger
  AFTER INSERT OR DELETE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_count();

-- Verify
SELECT 'blog_likes' as table_name,
  count(*) FROM blog_likes
UNION ALL
SELECT 'blog_comments', count(*)
  FROM blog_comments;

NOTIFY pgrst, 'reload schema';
