# Week 3 Deployment Checklist

## ✅ Completed Tasks

### Phase 1: Components & Pages
- [x] Client Services Page (`/app/dashboard/services/page.tsx`)
- [x] Client Projects Page (`/app/dashboard/projects/page.tsx`)
- [x] Client Invoices Page (`/app/dashboard/invoices/page.tsx`)
- [x] Music Promotion Page (`/app/dashboard/music/page.tsx`)
- [x] Client Files Page (`/app/dashboard/files/page.tsx`)
- [x] Client Settings Page (`/app/dashboard/settings/page.tsx`)
- [x] SettingsForm Component (`/src/components/Client/SettingsForm.tsx`)
- [x] FileUpload Component (`/src/components/Client/FileUpload.tsx`)

### Phase 2: API Routes
- [x] Paystack Initialize Route (`/app/api/payments/paystack/initialize/route.ts`)
- [x] Paystack Verify Route (`/app/api/payments/paystack/verify/route.ts`)
- [x] File Upload Route (`/app/api/upload/route.ts`)

### Phase 3: Code Quality
- [x] TypeScript Build Successful (0 errors)
- [x] All imports verified and corrected
- [x] Supabase auth compatibility fixed (using `createClient` from `@/lib/supabase/server`)
- [x] Git commit created and pushed to main

## 📋 Pre-Deployment Setup

### 1. Environment Variables Setup

Add the following to Vercel dashboard (Settings > Environment Variables):

#### Required Production Variables:
```
# Payment Gateway (Paystack)
PAYSTACK_SECRET_KEY = <your_paystack_secret_key>
PAYSTACK_PUBLIC_KEY = <your_paystack_public_key>

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME = <your_cloud_name>
CLOUDINARY_API_KEY = <your_api_key>
CLOUDINARY_API_SECRET = <your_api_secret>

# Site URL (for production)
NEXT_PUBLIC_SITE_URL = https://purplesofthub.com

# Email (already configured)
EMAIL_USER = helo@purplesofthub.com
EMAIL_PASS = hrniwjtlutentvvq
EMAIL_TO = helo@purplesofthub.com

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL = https://japscxueoenflsucqtry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = <existing_value>
SUPABASE_SERVICE_ROLE_KEY = <existing_value>

# Analytics
NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX

# Upstash Redis (already configured)
UPSTASH_REDIS_REST_URL = <existing_value>
UPSTASH_REDIS_REST_TOKEN = <existing_value>

# API Keys
ANTHROPIC_API_KEY = <existing_value>
```

### 2. Obtain Required API Keys

#### Paystack:
1. Go to https://dashboard.paystack.co/settings/developers
2. Copy Secret Key and Public Key
3. Add to Vercel environment variables

#### Cloudinary:
1. Go to https://cloudinary.com/console/settings/api-keys
2. Copy Cloud Name, API Key, and API Secret
3. Add to Vercel environment variables

### 3. Database Schema Setup

The following Supabase tables already exist with necessary columns:
- `profiles` - for user profile data
- `invoices` - for invoice management
- `files` - for file metadata storage
- `music_campaigns` - for music promotion campaigns
- `services` - for service offerings
- `projects` - for project management

Verify columns exist in each table:

**profiles table:**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- full_name (TEXT)
- phone (TEXT)
- company (TEXT)
- country (TEXT)
- bio (TEXT)
- updated_at (TIMESTAMP)
```

**invoices table:**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- status (TEXT) - 'draft', 'pending', 'paid', 'cancelled'
- paid_at (TIMESTAMP)
```

**files table:**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- file_name (TEXT)
- file_size (INTEGER)
- file_url (TEXT)
- file_type (TEXT)
- cloudinary_public_id (TEXT)
- uploaded_at (TIMESTAMP)
```

**music_campaigns table:**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- status (TEXT)
- created_at (TIMESTAMP)
```

## 🚀 Deployment Steps

### Step 1: Verify Build Locally
```bash
npm run build
# ✅ Should complete with no errors
```

### Step 2: Test Dev Server
```bash
npm run dev
# ✅ Should start on http://localhost:3000
```

### Step 3: Update Environment Variables
1. Go to Vercel Dashboard
2. Navigate to your project settings
3. Go to "Environment Variables"
4. Add all variables from the checklist above
5. Ensure correct environment (Production, Preview, Development)

### Step 4: Deploy to Vercel
```bash
vercel deploy --prod
```

Or use Vercel dashboard:
1. Trigger deployment from main branch
2. Wait for build completion
3. Verify all pages load correctly

### Step 5: Post-Deployment Verification

#### Test Authentication:
- [ ] Login at `/sign-in`
- [ ] Verify user session persists

#### Test Dashboard Pages:
- [ ] `/dashboard/services` - Services grid displays correctly
- [ ] `/dashboard/projects` - Projects list displays correctly
- [ ] `/dashboard/invoices` - Invoices table displays correctly
- [ ] `/dashboard/music` - Music campaigns display correctly
- [ ] `/dashboard/files` - File upload works
- [ ] `/dashboard/settings` - Profile settings save correctly

#### Test Payment Integration:
- [ ] Click "Pay Now" on an invoice
- [ ] Verify redirects to Paystack payment page
- [ ] Test payment verification callback

#### Test File Upload:
- [ ] Upload file from `/dashboard/files`
- [ ] Verify file appears in Cloudinary
- [ ] Verify metadata saved in Supabase files table

## 📝 Notes

- All TypeScript compilation passes (exit code 0)
- All changes committed and pushed to main branch
- Production URLs need to be updated in Vercel
- Ensure Paystack and Cloudinary API keys are kept secure
- Monitor Vercel deployment logs for any runtime errors

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Paystack Documentation: https://paystack.com/developers/api
- Cloudinary Documentation: https://cloudinary.com/documentation
- Supabase Dashboard: https://app.supabase.com
