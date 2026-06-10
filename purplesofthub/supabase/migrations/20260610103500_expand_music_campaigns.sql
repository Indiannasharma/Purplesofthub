-- Expand music campaign intake fields for distribution and promotion workflows.
-- Safe to run on existing databases; keeps current campaign records intact.

ALTER TABLE public.music_campaigns
  ADD COLUMN IF NOT EXISTS genre TEXT,
  ADD COLUMN IF NOT EXISTS release_date DATE,
  ADD COLUMN IF NOT EXISTS spotify_url TEXT,
  ADD COLUMN IF NOT EXISTS apple_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS campaign_goal TEXT,
  ADD COLUMN IF NOT EXISTS budget_range TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS plan_name TEXT,
  ADD COLUMN IF NOT EXISTS plan_type TEXT,
  ADD COLUMN IF NOT EXISTS plan_price NUMERIC(12, 2);

ALTER TABLE public.music_campaigns
  ADD COLUMN IF NOT EXISTS track_url TEXT,
  ADD COLUMN IF NOT EXISTS campaign_type TEXT;

UPDATE public.music_campaigns
SET
  track_url = COALESCE(track_url, spotify_url, apple_url, 'Pending upload'),
  campaign_type = COALESCE(campaign_type, campaign_goal, plan_type, 'music_campaign')
WHERE track_url IS NULL OR campaign_type IS NULL;
