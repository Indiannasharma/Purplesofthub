# Database Setup Scripts

> **Security notice (2026-09-24).** The account-recovery identity documents live
> in the **private** Supabase Storage bucket `account-recovery-documents`. Never
> make that bucket public and never add a public/anon storage policy for it. The
> scripts below have been updated to match; see
> `docs/security/ACCOUNT_RECOVERY_SECURITY_PATCH.md` and
> `supabase/migrations/20260924000000_privatize_account_recovery_documents.sql`
> for existing deployments.

## Account Recovery Table Setup

To enable the Account Recovery service form to store submissions in your Supabase database:

### Steps:

1. **Go to your Supabase Project Dashboard**
   - Navigate to https://app.supabase.com
   - Select your PurpleSoftHub project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Script**
   - Open `supabase-account-recovery-table.sql`
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor
   - Click "Run"

4. **Verify the Table**
   - Go to "Table Editor" in the left sidebar
   - You should see a new `account_recovery_requests` table

5. **Verify the storage bucket is private**
   - Storage → `account-recovery-documents` → the bucket must be marked **Private**
   - `SELECT id, public FROM storage.buckets WHERE id = 'account-recovery-documents';`
     must return `public = false`

### What Gets Created:

- **Table**: `account_recovery_requests` with fields:
  - `id` (UUID, auto-generated)
  - `full_name`, `first_name`, `surname` (text)
  - `facebook_handle` (text, optional)
  - `email`, `phone` (text)
  - `platform` (Facebook/Instagram/TikTok)
  - `support_type`, `additional_info` (text)
  - `amount` (currency)
  - `status` (defaults to "pending_payment")
  - `created_at`, `updated_at` (timestamps)

- **RLS Policies**: administrators may manage all requests; a signed-in client may
  read only their own submissions. There is deliberately **no** anonymous INSERT
  policy — public submissions go through the service-role API route, which
  validates the payload and rejects internal fields such as `admin_notes`.
- **Storage**: `account-recovery-documents` (private, service-role access only)
- **Indices**: For fast queries on email, status, platform, and date

### Testing:

After setup, the account recovery form at `/services/social-media-management/account-recovery` will automatically save submissions to this table. Identity documents are uploaded to the private bucket and are only reachable by administrators through short-lived signed URLs.
