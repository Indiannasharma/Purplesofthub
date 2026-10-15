-- Add editorial taxonomy data to the existing table. No schema migration required.
-- Unique name/slug constraints make reruns safe; existing rows are never overwritten.
INSERT INTO public.blog_categories (name, slug)
SELECT name, slug FROM (VALUES
  ('Gaming', 'gaming'),
  ('How-To & Tutorials', 'how-to')
) AS additions(name, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM public.blog_categories existing
  WHERE lower(existing.name) = lower(additions.name)
     OR lower(existing.slug) = lower(additions.slug)
)
ON CONFLICT DO NOTHING;

SELECT name, slug FROM public.blog_categories
WHERE slug IN ('gaming', 'how-to') ORDER BY slug;
