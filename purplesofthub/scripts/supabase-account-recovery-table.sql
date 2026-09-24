-- Create account_recovery_requests table for storing account recovery service submissions
-- Run this in Supabase SQL Editor (under "SQL" tab in your project)
--
-- SECURITY (2026-09-24): review docs/security/ACCOUNT_RECOVERY_SECURITY_PATCH.md
-- before running this file. The recovery table mixes public-facing fields with
-- internal ones (admin_notes) and is now written only by service-role routes;
-- supabase/migrations/20260924000000_privatize_account_recovery_documents.sql
-- also restricts anon/authenticated column privileges on existing deployments.

CREATE TABLE account_recovery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  facebook_handle TEXT,
  first_name TEXT,
  surname TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  support_type TEXT,
  additional_info TEXT,
  platform TEXT NOT NULL,
  amount TEXT,
  status TEXT DEFAULT 'pending_payment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE account_recovery_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies.
--
-- SECURITY (2026-09-24): do NOT re-add an anonymous INSERT policy with
-- `WITH CHECK (true)`. Public submissions are written by the service-role route
-- handler app/api/account-recovery/route.ts, which validates every field and
-- rejects internal fields such as admin_notes. An anon-key client must never be
-- able to insert recovery rows directly.
CREATE POLICY "Allow admins to manage all recovery requests" ON account_recovery_requests
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN ('admin@purplesofthub.com', 'hello@purplesofthub.com')
  );

-- Clients may read only their own submissions.
-- The previous policy used `auth.jwt() ->> 'email' = email OR auth.uid() IS NOT NULL`,
-- and that second clause let ANY signed-in user read EVERY recovery row
-- (including admin_notes and document paths).
CREATE POLICY "Users can read own recovery requests" ON account_recovery_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(auth.jwt() ->> 'email') = lower(email)
  );

-- Create index on email for faster lookups
CREATE INDEX idx_account_recovery_email ON account_recovery_requests(email);

-- Create index on status for filtering
CREATE INDEX idx_account_recovery_status ON account_recovery_requests(status);

-- Create index on platform for analytics
CREATE INDEX idx_account_recovery_platform ON account_recovery_requests(platform);

-- Create index on created_at for chronological queries
CREATE INDEX idx_account_recovery_created_at ON account_recovery_requests(created_at DESC);
