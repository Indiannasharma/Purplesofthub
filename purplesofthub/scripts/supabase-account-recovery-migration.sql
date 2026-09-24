-- Account Recovery Database Migration
-- Run this in Supabase SQL Editor to update existing table schema with all required fields
--
-- SECURITY (2026-09-24): the account-recovery document bucket is PRIVATE. This
-- file no longer creates a public bucket or public storage policies. For
-- databases that already ran the old version, apply
-- supabase/migrations/20260924000000_privatize_account_recovery_documents.sql
-- and see docs/security/ACCOUNT_RECOVERY_SECURITY_PATCH.md.
-- Do not run historical SQL scripts wholesale against production.

-- Add missing columns to existing account_recovery_requests table
ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS last_name TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS handle TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS appeal_message TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS id_document_url TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS payment_status TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

ALTER TABLE account_recovery_requests 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Rename old columns for consistency
ALTER TABLE account_recovery_requests 
RENAME COLUMN surname TO last_name;

ALTER TABLE account_recovery_requests 
RENAME COLUMN additional_info TO appeal_message;

ALTER TABLE account_recovery_requests 
RENAME COLUMN facebook_handle TO handle;

-- Update default status values
ALTER TABLE account_recovery_requests 
ALTER COLUMN status SET DEFAULT 'pending_payment';

-- Create the private storage bucket for recovery documents.
--
-- SECURITY (2026-09-24): this bucket MUST stay private. Account-recovery
-- identity documents are only ever readable through the short-lived signed URLs
-- issued by the requireAdmin()-guarded endpoint
-- (app/api/admin/recovery/[id]/documents/[documentId]/signed-url).
-- Never re-add `public = true` or a public/anon storage policy here.
INSERT INTO storage.buckets (id, name, public)
VALUES ('account-recovery-documents', 'account-recovery-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Deliberately no storage policy on storage.objects for this bucket.
-- Recovery documents are written and read exclusively by service-role server
-- routes, which bypass RLS. Do NOT create "Allow public uploads" or
-- "Allow public reads" policies — doing so re-opens the exposure that
-- supabase/migrations/20260924000000_privatize_account_recovery_documents.sql
-- removed.

-- RLS policies for authenticated users.
-- (A hardened deployment also restricts anon/authenticated column privileges so
-- internal columns such as admin_notes can only be reached through service-role
-- routes; see the security migration referenced above.)
CREATE POLICY "Allow admins to manage all recovery requests" ON account_recovery_requests
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN ('admin@purplesofthub.com', 'hello@purplesofthub.com')
  );

CREATE POLICY "Users can read own recovery requests" ON account_recovery_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(auth.jwt() ->> 'email') = lower(email)
  );

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';