-- Account Recovery Database Migration
-- Run this in Supabase SQL Editor to update existing table schema with all required fields

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

-- Create storage bucket for recovery documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('account-recovery-documents', 'account-recovery-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to storage bucket
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'account-recovery-documents');

-- Allow public access to uploaded files
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'account-recovery-documents');

-- Update RLS policies for authenticated users
CREATE POLICY "Allow admins to manage all recovery requests" ON account_recovery_requests
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN ('admin@purplesofthub.com', 'hello@purplesofthub.com')
  );

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';