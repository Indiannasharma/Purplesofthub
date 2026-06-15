-- Expand music campaign intake fields for distribution and promotion workflows.
-- Safe to run on existing databases; keeps current campaign records intact.

CREATE TABLE IF NOT EXISTS public.music_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_title TEXT NOT NULL DEFAULT '',
  artist_name TEXT NOT NULL DEFAULT '',
  track_url TEXT NOT NULL DEFAULT 'Pending upload',
  campaign_type TEXT NOT NULL DEFAULT 'music_campaign',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget NUMERIC(12, 2),
  platforms TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

ALTER TABLE public.music_campaigns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'music_campaigns'
      AND policyname = 'Clients can view own music campaigns'
  ) THEN
    CREATE POLICY "Clients can view own music campaigns"
      ON public.music_campaigns FOR SELECT
      USING (client_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'music_campaigns'
      AND policyname = 'Clients can insert own music campaigns'
  ) THEN
    CREATE POLICY "Clients can insert own music campaigns"
      ON public.music_campaigns FOR INSERT
      WITH CHECK (client_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'music_campaigns'
      AND policyname = 'Admins can view all music campaigns'
  ) THEN
    CREATE POLICY "Admins can view all music campaigns"
      ON public.music_campaigns FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'music_campaigns'
      AND policyname = 'Admins can insert music campaigns'
  ) THEN
    CREATE POLICY "Admins can insert music campaigns"
      ON public.music_campaigns FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;
