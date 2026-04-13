-- ============================================================
-- PurpleSoftHub — Admin Notifications
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── 1. Table ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  message     text        NOT NULL DEFAULT '',
  type        text        NOT NULL DEFAULT 'general',
  is_read     boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_admin_id
  ON public.notifications (admin_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications (admin_id, is_read)
  WHERE is_read = false;

-- ─── 2. Row Level Security ────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admin reads own notifications
CREATE POLICY "admin_select_notifications"
  ON public.notifications FOR SELECT
  USING (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin marks their own notifications as read
CREATE POLICY "admin_update_notifications"
  ON public.notifications FOR UPDATE
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- Anyone (authenticated) may insert — needed for DB triggers running as SECURITY DEFINER
CREATE POLICY "insert_notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ─── 3. Enable Realtime ──────────────────────────────────────

-- Add the table to the realtime publication so the frontend subscription works.
-- If supabase_realtime publication does not exist yet, Supabase creates it
-- automatically; this line is safe to run.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ─── 4. Helper: find first admin user ────────────────────────

CREATE OR REPLACE FUNCTION public.get_first_admin_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id
  FROM public.profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;
$$;

-- ─── 5. Trigger: new user signup ─────────────────────────────

CREATE OR REPLACE FUNCTION public.notify_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_uuid uuid;
BEGIN
  -- Only notify for non-admin signups
  IF NEW.role = 'admin' THEN
    RETURN NEW;
  END IF;

  admin_uuid := public.get_first_admin_id();
  IF admin_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, admin_id, title, message, type)
  VALUES (
    NEW.id,
    admin_uuid,
    'New User Signed Up',
    COALESCE(NEW.full_name, NEW.email, 'Someone') || ' just created an account.',
    'signup'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_signup ON public.profiles;
CREATE TRIGGER trg_notify_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_signup();

-- ─── 6. Trigger: payment completed ───────────────────────────

CREATE OR REPLACE FUNCTION public.notify_admin_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_uuid uuid;
BEGIN
  -- Only fire when status transitions TO 'completed'
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;  -- already notified
  END IF;

  admin_uuid := public.get_first_admin_id();
  IF admin_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, admin_id, title, message, type)
  VALUES (
    NEW.user_id,
    admin_uuid,
    'Payment Received 💳',
    COALESCE(NEW.user_email, 'A client')
      || ' paid '
      || NEW.amount::text
      || ' '
      || COALESCE(NEW.currency, 'USD')
      || ' for '
      || COALESCE(NEW.service_name, 'a service')
      || '.',
    'payment'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_payment ON public.payments;
CREATE TRIGGER trg_notify_payment
  AFTER INSERT OR UPDATE OF status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_payment();

-- ─── 7. Trigger: new project ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.notify_admin_on_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_uuid  uuid;
  client_name text;
BEGIN
  admin_uuid := public.get_first_admin_id();
  IF admin_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO client_name
  FROM public.profiles
  WHERE id = NEW.client_id;

  INSERT INTO public.notifications (user_id, admin_id, title, message, type)
  VALUES (
    NEW.client_id,
    admin_uuid,
    'New Project Created 📁',
    COALESCE(client_name, 'A client')
      || ' started a new project: "'
      || COALESCE(NEW.title, 'Untitled')
      || '".',
    'project'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_project ON public.projects;
CREATE TRIGGER trg_notify_project
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_project();

-- ─── 8. Trigger: new music campaign ──────────────────────────

CREATE OR REPLACE FUNCTION public.notify_admin_on_music_campaign()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_uuid  uuid;
  client_name text;
BEGIN
  admin_uuid := public.get_first_admin_id();
  IF admin_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO client_name
  FROM public.profiles
  WHERE id = NEW.client_id;

  INSERT INTO public.notifications (user_id, admin_id, title, message, type)
  VALUES (
    NEW.client_id,
    admin_uuid,
    'New Music Campaign 🎵',
    COALESCE(client_name, 'An artist')
      || ' submitted a campaign for "'
      || COALESCE(NEW.track_title, 'Untitled Track')
      || '" by '
      || COALESCE(NEW.artist_name, 'Unknown Artist')
      || '.',
    'music_campaign'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_music_campaign ON public.music_campaigns;
CREATE TRIGGER trg_notify_music_campaign
  AFTER INSERT ON public.music_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_music_campaign();

-- ─── 9. Trigger: account recovery request ────────────────────

CREATE OR REPLACE FUNCTION public.notify_admin_on_recovery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_uuid uuid;
BEGIN
  admin_uuid := public.get_first_admin_id();
  IF admin_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, admin_id, title, message, type)
  VALUES (
    NEW.user_id,
    admin_uuid,
    'Account Recovery Request 🔐',
    COALESCE(NEW.email, 'A user') || ' submitted an account recovery request.',
    'recovery'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_recovery ON public.account_recovery_requests;
CREATE TRIGGER trg_notify_recovery
  AFTER INSERT ON public.account_recovery_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_recovery();

-- ─── Done ─────────────────────────────────────────────────────
-- Verify with:
--   SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 10;
