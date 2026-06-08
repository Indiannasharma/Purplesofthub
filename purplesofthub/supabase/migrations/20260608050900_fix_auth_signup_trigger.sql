-- ============================================================
-- PurpleSoftHub - repair auth signup / invite failures
--
-- Symptom:
--   Supabase Auth returns "Database error saving new user" from both
--   public signup and Dashboard user invitations.
--
-- Cause:
--   An auth.users trigger is failing while Supabase creates the user.
--
-- Run in Supabase SQL Editor for the production project.
-- ============================================================

-- The application now sends branded welcome emails after signup/OAuth.
-- If the old DB-level welcome trigger was installed with placeholder
-- values, it should not run during auth user creation.
DROP TRIGGER IF EXISTS on_auth_user_created_welcome ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_welcome();

-- Make sure the profile table exists with the columns the trigger needs.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure profile creation can run from the auth schema and never depends
-- on the request user's RLS permissions.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    'client'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- A notification failure must not roll back auth signup/profile creation.
CREATE OR REPLACE FUNCTION public.get_first_admin_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id
  FROM public.profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.notify_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  admin_uuid uuid;
BEGIN
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_admin_on_signup failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_signup ON public.profiles;
CREATE TRIGGER trg_notify_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_signup();

-- Quick verification after running:
-- SELECT tgname, tgenabled
-- FROM pg_trigger
-- WHERE tgrelid IN ('auth.users'::regclass, 'public.profiles'::regclass)
-- ORDER BY tgname;
