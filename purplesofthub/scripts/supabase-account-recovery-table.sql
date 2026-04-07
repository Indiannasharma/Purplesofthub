-- Create account_recovery_requests table for storing account recovery service submissions
-- Run this in Supabase SQL Editor (under "SQL" tab in your project)

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

-- Create policy to allow anyone to insert (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON account_recovery_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow service role to read all
CREATE POLICY "Allow service role reads" ON account_recovery_requests
  FOR SELECT
  TO service_role
  USING (true);

-- Create policy to allow users to read their own submissions
CREATE POLICY "Allow users to read own submissions" ON account_recovery_requests
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = email OR
    auth.uid() IS NOT NULL
  );

-- Create index on email for faster lookups
CREATE INDEX idx_account_recovery_email ON account_recovery_requests(email);

-- Create index on status for filtering
CREATE INDEX idx_account_recovery_status ON account_recovery_requests(status);

-- Create index on platform for analytics
CREATE INDEX idx_account_recovery_platform ON account_recovery_requests(platform);

-- Create index on created_at for chronological queries
CREATE INDEX idx_account_recovery_created_at ON account_recovery_requests(created_at DESC);
