# Database Setup Scripts

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

- **RLS Policies**: Allow anonymous form submissions while protecting data access
- **Indices**: For fast queries on email, status, platform, and date

### Testing:

After setup, the account recovery form at `/services/social-media-management/account-recovery` will automatically save submissions to this table.
